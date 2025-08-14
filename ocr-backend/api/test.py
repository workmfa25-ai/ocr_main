# # main.py
# import tempfile
# from fastapi import FastAPI, File, UploadFile
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# from io import BytesIO
# from doctr.models import ocr_predictor
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi import APIRouter, File, UploadFile, HTTPException
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# from io import BytesIO
# from doctr.models import ocr_predictor
# from fastapi.middleware.cors import CORSMiddleware

# from ocr_main import convert_pdf_to_text_doctr, process_pdf, answer_question
# #from api import router as api_router  # assuming you have defined routes in api.py

# app = FastAPI()

# # Add this line to include your API routes
# #app.include_router(api_router, prefix="/api")  # use prefix as needed


# # PDF_PATH = "/home/ocr/Downloads/HTR/testing.pdf"
# # try:
# #     retriever = process_pdf(PDF_PATH)
# #     print("✅ Retriever initialized successfully.")
# # except Exception as e:
# #     retriever = None
# #     print(f"❌ Error processing PDF: {e}")

# @app.get("/")
# def read_root():
#     return {"message": "FastAPI OCR-RAG server is running."}


# @app.post("/upload/")
# async def upload_file(file: UploadFile = File(...)):
#     try:
#         if file.content_type != "application/pdf":
#             return JSONResponse(
#                 status_code=400,
#                 content={"error": "Only PDF files are supported."}
#             )
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
#             tmp.write(await file.read())
#             tmp_path = tmp.name
#         contents = await file.read()
#         text = convert_pdf_to_text_doctr(tmp_path, doctr_model)
#         return {"filename": file.filename, "extracted_text": text}

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})


# def load_doctr_model():
#     return ocr_predictor(pretrained=True)

# doctr_model = load_doctr_model()

# # ===== Question Answering Endpoint =====
# class QuestionInput(BaseModel):
#     question: str

# @app.post("/ask/")
# async def ask_question_api(data: QuestionInput):
#     try:
#         # if retriever is None:
#         #     raise HTTPException(status_code=500, detail="Retriever not initialized.")
#         answer = answer_question(data.question, retriever)
#         return {"question": data.question, "answer": answer}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # from fastapi import FastAPI, HTTPException
# # from bson import ObjectId
# # from database import users_collection, files_collection, texts_collection, logs_collection
# # from models import UserCreate, UserLogin, FileMeta, ExtractedText, LLMLog
# # from utils import hash_password, verify_password
# # from fastapi import FastAPI
# # from database import db

# # app = FastAPI()
# # @app.get("/")
# # async def root():
# #     return {"message": "OCR API is running"}


# # @app.get("/ping-db")
# # async def ping_db():
# #     try:
# #         result = await db.command("ping")
# #         if result.get("ok") == 1:
# #             return {"status": "connected"}
# #     except Exception as e:
# #         return {"status": "error", "details": str(e)}

# # # Register user
# # @app.post("/register")
# # async def register(user: UserCreate):
# #     existing = await users_collection.find_one({"username": user.username})
# #     if existing:
# #         raise HTTPException(status_code=400, detail="Username already exists")
# #     user_dict = user.dict()
# #     user_dict["password_hash"] = hash_password(user.password)
# #     del user_dict["password"]
# #     await users_collection.insert_one(user_dict)
# #     return {"msg": "User registered successfully"}

# # # Login user
# # @app.post("/login")
# # async def login(user: UserLogin):
# #     db_user = await users_collection.find_one({"username": user.username})
# #     if not db_user or not verify_password(user.password, db_user["password_hash"]):
# #         raise HTTPException(status_code=401, detail="Invalid credentials")
# #     return {"msg": "Login successful"}

# # # Upload file metadata
# # @app.post("/files")
# # async def upload_metadata(file: FileMeta):
# #     result = await files_collection.insert_one(file.dict())
# #     return {"msg": "File metadata stored", "id": str(result.inserted_id)}

# # # Get all file metadata
# # @app.get("/files")
# # async def get_files():
# #     files = await files_collection.find().to_list(100)
# #     for f in files:
# #         f["_id"] = str(f["_id"])
# #     return files

# # # Store extracted text
# # @app.post("/texts")
# # async def store_text(data: ExtractedText):
# #     result = await texts_collection.insert_one(data.dict())
# #     return {"msg": "Text stored", "id": str(result.inserted_id)}

# # # Get extracted text by file ID
# # @app.get("/texts/{file_id}")
# # async def get_text(file_id: str):
# #     texts = await texts_collection.find({"file_id": file_id}).to_list(100)
# #     for t in texts:
# #         t["_id"] = str(t["_id"])
# #     return texts

# # # Store LLM log
# # @app.post("/logs")
# # async def store_log(log: LLMLog):
# #     result = await logs_collection.insert_one(log.dict())
# #     return {"msg": "LLM log stored", "id": str(result.inserted_id)}

# # # Get LLM logs
# # @app.get("/logs")
# # async def get_logs():
# #     logs = await logs_collection.find().to_list(100)
# #     for log in logs:
# #         log["_id"] = str(log["_id"])
# #     return logs


# Demo


# import tempfile
# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# from doctr.models import ocr_predictor
# from fastapi.middleware.cors import CORSMiddleware
# from ocr_main import convert_pdf_to_text_doctr, answer_question

# app = FastAPI()

# # Enable CORS if needed
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Update with allowed origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ===== Global storage for extracted text =====
# stored_text = None


# def load_doctr_model():
#     return ocr_predictor(pretrained=True)


# doctr_model = load_doctr_model()


# @app.get("/")
# def read_root():
#     return {"message": "FastAPI OCR-RAG server is running."}

# class SimpleRetriever:
#     def __init__(self, text):
#         # If it's a tuple or list, take only the first element
#         if isinstance(text, (tuple, list)):
#             text = text[0]
#         self.text = str(text)

#     def invoke(self, query: str):
#         return [type("Doc", (), {"page_content": self.text})()]




# retriever = None  # global

# @app.post("/upload/")
# async def upload_file(file: UploadFile = File(...)):
#     global retriever
#     try:
#         if file.content_type != "application/pdf":
#             return JSONResponse(
#                 status_code=400,
#                 content={"error": "Only PDF files are supported."}
#             )

#         with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
#             tmp.write(await file.read())
#             tmp_path = tmp.name

#         text = convert_pdf_to_text_doctr(tmp_path, doctr_model)

#         # Create a retriever object with this text
#         retriever = SimpleRetriever(text)

#         return {
#             "filename": file.filename,
#             "message": "Text extracted and retriever initialized."
#         }
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})



# # ===== Question Answering Endpoint =====
# class QuestionInput(BaseModel):
#     question: str


# @app.post("/ask/")
# async def ask_question_api(data: QuestionInput):
#     global retriever
#     print(retriever,'jkbdkjf')
#     if retriever is None:
#         raise HTTPException(status_code=400, detail="Please upload a PDF first.")
#     answer = answer_question(data.question, retriever)
#     return {"question": data.question, "answer": answer}

import os
import json
import tempfile
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_core.embeddings import Embeddings
from transformers import AutoTokenizer, AutoModel
from ollama import chat

app = FastAPI()

# Allow all origins (update for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# === Globals ===
retriever = None

# === OCR ===
def load_doctr_model():
    return ocr_predictor(pretrained=True)

def convert_pdf_to_text_doctr(pdf_path, model):
    doc = DocumentFile.from_pdf(pdf_path)
    result = model(doc)

    confidences = []
    for page_idx, page in enumerate(result.pages):
        word_confs = [word.confidence for block in page.blocks for line in block.lines for word in line.words]
        avg_conf = sum(word_confs) / len(word_confs) if word_confs else 0.0
        confidences.append((page_idx + 1, round(avg_conf * 100, 2)))

    with open("ocr_output.txt", 'w', encoding='utf-8') as f:
        f.write(result.render())

    return confidences, result.render(), "ocr_output.txt"

# === Local HF Embeddings ===
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

def load_embeddings():
    model_path = "sentence-transformers/all-MiniLM-L6-v2"
    return LocalHFEmbeddings(model_path)

# === Mistral Calls ===
def run_mistral_offline(prompt_text):
    response = chat(
        model="mistral",
        messages=[{"role": "user", "content": prompt_text}]
    )
    return response['message']['content']

def correct_spelling_with_mistral(text):
    response = chat(
        model="mistral",
        messages=[
            {"role": "system", "content": "You are given text extracted from a scanned document using OCR. The text may contain spelling mistakes, broken words, or extra spaces. Correct the spelling mistakes and fix spacing issues while keeping the meaning unchanged. Return only the corrected text."},
            {"role": "user", "content": text}
        ]
    )
    return response['message']['content']

def split_into_chunks(text, chunk_size=400):
    words = text.split()
    for i in range(0, len(words), chunk_size):
        yield " ".join(words[i:i+chunk_size])

# === API Routes ===
@app.get("/")
def read_root():
    return {"message": "OCR + RAG API running"}

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    global retriever
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Step 1: OCR
        doctr_model = load_doctr_model()
        page_confidences, _, ocr_file_path = convert_pdf_to_text_doctr(tmp_path, doctr_model)

        # Save confidence data
        confidence_data = [{"page": p, "confidence": c} for p, c in page_confidences]
        with open("page_confidences.json", "w", encoding="utf-8") as f:
            json.dump(confidence_data, f, indent=4)

        # Step 2: Spelling correction
        with open(ocr_file_path, "r", encoding="utf-8") as f:
            raw_text = f.read()

        corrected_text = []
        for idx, chunk in enumerate(split_into_chunks(raw_text, 400), start=1):
            corrected_chunk = correct_spelling_with_mistral(chunk)
            corrected_text.append(corrected_chunk)

        corrected_output = "\n\n".join(corrected_text)
        with open("corrected_text.txt", "w", encoding="utf-8") as f:
            f.write(corrected_output)

        # Step 3: Create retriever
        embeddings = load_embeddings()
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        chunks_for_index = splitter.create_documents([corrected_output])
        vector_store = FAISS.from_documents(chunks_for_index, embeddings)
        retriever = vector_store.as_retriever(search_type='similarity', search_kwargs={'k': 4})

        return {"message": "PDF processed successfully", "pages": len(page_confidences)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Question input model
class QuestionInput(BaseModel):
    question: str

@app.post("/ask/")
async def ask_question_api(data: QuestionInput):
    global retriever
    if retriever is None:
        raise HTTPException(status_code=400, detail="Please upload and process a PDF first.")

    retrieved_docs = retriever.invoke(data.question)
    context = "\n\n".join(doc.page_content for doc in retrieved_docs)
    final_prompt = prompt.format(context=context, question=data.question)
    answer = run_mistral_offline(final_prompt)
    return {"question": data.question, "answer": answer}
