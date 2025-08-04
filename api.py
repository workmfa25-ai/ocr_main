from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from test import convert_pdf_to_text_doctr
from io import BytesIO
from fastapi.responses import JSONResponse

from doctr.io import DocumentFile
from doctr.models import ocr_predictor

def load_doctr_model():
    return ocr_predictor(pretrained=True) 
     
doctr_model = load_doctr_model()
'''doctr_model = None
embeddings = None
splitter = None
vector_store = None
prompt = None'''

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)
@app.get("/")
def read_root():
    return {"message": "FastAPI OCR-RAG server is running."}

@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={})


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
    
        if file.content_type != "application/pdf":
                return JSONResponse(status_code=400, content={"error": "Only PDF files are supported."})

        contents = await file.read()

            # Convert PDF to text using DOCTR
        text = convert_pdf_to_text_doctr(BytesIO(contents), doctr_model)

        return {"filename": file.filename, "extracted_text": text}  

    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    

    
    
