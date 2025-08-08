from doctr.io import DocumentFile
from doctr.models import ocr_predictor
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_core.embeddings import Embeddings
from transformers import AutoTokenizer, AutoModel
import torch
from ollama import chat
import os
import json
# === OCR: Load Doctr model ===
def load_doctr_model():
    return ocr_predictor(pretrained=True)  # Uses cached weights

# === OCR: Convert PDF to text ===
def convert_pdf_to_text_doctr(pdf_path, model):
    doc = DocumentFile.from_pdf(pdf_path)

    # Load OCR model
    model = ocr_predictor(pretrained=True)

    # Predict
    result = model(doc)

    confidences = []
    page_texts = []

    # Loop through each page
    for page_idx, page in enumerate(result.pages):
        word_confs = [word.confidence for block in page.blocks for line in block.lines for word in line.words]
        text = "\n".join([" ".join([word.value for word in line.words]) for block in page.blocks for line in block.lines])

        # Average confidence
        avg_conf = sum(word_confs) / len(word_confs) if word_confs else 0.0
        confidences.append((page_idx + 1, round(avg_conf * 100, 2)))  # percentage

        page_texts.append((page_idx + 1, text))
    with open("ocr_output.txt", 'w', encoding='utf-8') as file:
        file.write(result.render())
    return confidences, result.render(), "ocr_output.txt"

# === Custom Local Embedding Class (Offline) ===
class LocalHFEmbeddings(Embeddings):
    def __init__(self, model_path):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModel.from_pretrained(model_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def embed_documents(self, texts):
        return [self._embed(text) for text in texts]

    def embed_query(self, text):
        return self._embed(text)

    def _embed(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = self.model(**inputs)
            token_embeddings = outputs.last_hidden_state
            attention_mask = inputs['attention_mask']
            input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
            pooled = torch.sum(token_embeddings * input_mask_expanded, 1) / input_mask_expanded.sum(1)
        return pooled[0].cpu().numpy().tolist()

# === Load Local Embeddings ===
def load_embeddings():
    model_path = "sentence-transformers/all-MiniLM-L6-v2"
    return LocalHFEmbeddings(model_path)

# === Prompt Template ===
prompt = PromptTemplate(
    template="""
You are a helpful assistant.
Only answer based on the provided context.
If the context is insufficient, say "I don't know."

{context}

Question: {question}
""",
    input_variables=["context", "question"]
)

# === Run Mistral for QA ===
def run_mistral_offline(prompt_text):
    response = chat(
        model="mistral",
        messages=[{"role": "user", "content": prompt_text}]
    )
    return response['message']['content']

# === Run Mistral for spelling correction ===
def correct_spelling_with_mistral(text):
    response = chat(
        model="mistral",
        messages=[
            {"role": "system", "content": "You are given text extracted from a scanned document using OCR. The text may contain spelling mistakes, broken words, or extra spaces. Correct the spelling mistakes and fix spacing issues while keeping the meaning unchanged. Do not rewrite or rephrase unnecessarily. Return only the corrected text."},
            {"role": "user", "content": text}
        ]
    )
    return response['message']['content']

# === Split text into chunks of N words ===
def split_into_chunks(text, chunk_size=400):
    words = text.split()
    for i in range(0, len(words), chunk_size):
        yield " ".join(words[i:i+chunk_size])

# === Main Logic ===
def main():
    pdf_path = r"C:\Users\nikhi\OneDrive\Desktop\WhatsApp Image 2025-06-16 at 4.20.29 PM (1).pdf"

    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        return

    # Step 1: Load models
    doctr_model = load_doctr_model()
    embeddings = load_embeddings()

    # Step 2: OCR extraction
    print("🔍 Running OCR on PDF...")
    page_confidences,ocr_text, ocr_file_path = convert_pdf_to_text_doctr(pdf_path, doctr_model)
    
    confidence_data = [{"page": page, "confidence": conf} for page, conf in page_confidences]
    
    with open("page_confidences.json", "w", encoding="utf-8") as f:
        json.dump(confidence_data, f, indent=4)
    
    
    #print("\n📊 Confidence Level (per page):")
    #print("-" * 40)
    #print(f"{'Page':<10}{'Confidence (%)':<15}")
    #print("-" * 40)
    #for page_num, conf in page_confidences:
    #    print(f"{page_num:<10}{conf:<15}")
    #print("-" * 40)
        
    # Step 3: Spelling correction in 400-word chunks
    print("✏ Correcting spelling in chunks of 400 words...")
    with open(ocr_file_path, "r", encoding="utf-8") as f:
        raw_text = f.read()

    chunks = list(split_into_chunks(raw_text, 400))
    corrected_output_path = "corrected_text.txt"

    with open(corrected_output_path, "w", encoding="utf-8") as f_out:
        for idx, chunk in enumerate(chunks, start=1):
            print(f"Processing chunk {idx}/{len(chunks)}...")
            corrected_chunk = correct_spelling_with_mistral(chunk)
            f_out.write(corrected_chunk + "\n\n")

    print(f"✅ Corrected text saved to {corrected_output_path}")

    # Step 4: Create FAISS index for QA
    print("📦 Indexing corrected text...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks_for_index = splitter.create_documents([open(corrected_output_path, "r", encoding="utf-8").read()])
    vector_store = FAISS.from_documents(chunks_for_index, embeddings)
    retriever = vector_store.as_retriever(search_type='similarity', search_kwargs={'k': 4})

    # Step 5: QA loop
    print("\n💬 Ready for questions. Type 'exit' to quit.\n")
    while True:
        question = input("Enter Question: ")
        if question.strip().lower() == "exit":
            break
        retrieved_docs = retriever.invoke(question)
        context = "\n\n".join(doc.page_content for doc in retrieved_docs)
        final_prompt = prompt.format(context=context, question=question)
        answer = run_mistral_offline(final_prompt)
        print("\nAnswer:\n", answer, "\n")

if __name__ == "__main__":
    main()
 