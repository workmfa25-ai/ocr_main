# from motor.motor_asyncio import AsyncIOMotorClient

# MONGO_URI = "mongodb://localhost:27017"
# client = AsyncIOMotorClient(MONGO_URI)
# db = client["ocr-db"] 

# # Collections
# users_collection = db["users"]
# files_collection = db["files"]
# texts_collection = db["texts"]
# logs_collection = db["logs"]

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from io import BytesIO
from doctr.models import ocr_predictor
from fastapi.middleware.cors import CORSMiddleware

from ocr_main import convert_pdf_to_text_doctr, process_pdf, answer_question

router = APIRouter()

# ===== Load DOCTR model =====
def load_doctr_model():
    return ocr_predictor(pretrained=True)

doctr_model = load_doctr_model()

# ===== Initialize Retriever at import time =====
PDF_PATH = "/home/ocr/Downloads/HTR/testing.pdf"
try:
    retriever = process_pdf(PDF_PATH)
    print("✅ Retriever initialized successfully.")
except Exception as e:
    retriever = None
    print(f"❌ Error processing PDF: {e}")

@router.get("/")
def read_root():
    return {"message": "FastAPI OCR-RAG server is running."}

@router.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={})

# ===== File Upload Endpoint =====
@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        if file.content_type != "application/pdf":
            return JSONResponse(
                status_code=400,
                content={"error": "Only PDF files are supported."}
            )

        contents = await file.read()
        text = convert_pdf_to_text_doctr(BytesIO(contents), doctr_model)
        return {"filename": file.filename, "extracted_text": text}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ===== Question Answering Endpoint =====
class QuestionInput(BaseModel):
    question: str

@router.post("/ask/")
async def ask_question_api(data: QuestionInput):
    try:
        if retriever is None:
            raise HTTPException(status_code=500, detail="Retriever not initialized.")
        answer = answer_question(data.question, retriever)
        return {"question": data.question, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
