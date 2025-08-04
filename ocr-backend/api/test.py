from doctr.io import DocumentFile
from doctr.models import ocr_predictor

from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_core.embeddings import Embeddings

from transformers import AutoTokenizer, AutoModel
import torch
from ollama import chat
from typing import BinaryIO

# === OCR: Load Doctr model (assumes weights are already cached) ===
def load_doctr_model():
    return ocr_predictor(pretrained=True)  # Uses local weights if cached

# === OCR: Convert PDF to Text using DOCTR ===
def convert_pdf_to_text_doctr(file: BinaryIO, model) -> str:
    # Load the PDF directly from the uploaded file-like object
    doc = DocumentFile.from_pdf(file)

    # Perform OCR using the provided model
    result = model(doc)

    # Render extracted text
    extracted_text = result.render()

    return extracted_text

# === Custom Local Embedding Class (Offline) ===
class LocalHFEmbeddings(Embeddings):
    def __init__(self, model_path):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModel.from_pretrained(model_path)
        self.device = torch.device("cpu")  # Use "cuda" if GPU is available
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

# === Load Local Sentence Transformer Embeddings ===
def load_embeddings():
    model_path = "/home/ocr/Downloads/HTR/models/all-MiniLM-L6-v2"  # Local path
    return LocalHFEmbeddings(model_path)

# === Prompt Template ===
prompt = PromptTemplate(
    template="""
You are a helpful assistant.
Only answer based on the provided context.
If the context is insufficient, say "I don't know."

{context}

Question: {question} in 
""",
    input_variables=["context", "question"]
)

# === Run Mistral locally using Ollama ===
def run_mistral_offline(prompt_text):
    response = chat(
        model="mistral",
        messages=[
            {"role": "user", "content": prompt_text}
        ]
    )
    return response['message']['content']

# === Main Logic ===
def main():
    # Step 1: Load models
    doctr_model = load_doctr_model()
    embeddings = load_embeddings()

    # Step 2: OCR and Split
    pdf_path = "/home/ocr/Downloads/test2.pdf"  # Change as needed
    print("Running OCR on PDF...")
    ocr_text = convert_pdf_to_text_doctr(pdf_path, doctr_model)

    print(ocr_text)

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.create_documents([ocr_text])

    # Step 3: Create FAISS index
    print("Indexing text...")
    vector_store = FAISS.from_documents(chunks, embeddings)
    retriever = vector_store.as_retriever(search_type='similarity', search_kwargs={'k': 4})

    # Step 4: QA Loop
    print("\nReady for questions. Type 'exit' to quit.\n")
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