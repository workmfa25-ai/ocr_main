from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json

app = FastAPI()

@app.get("/page_confidences")
def get_confidences():
    try:
        with open(r"page_confidences.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    except FileNotFoundError:
        return JSONResponse(content={"error": "Confidence data not found"}, status_code=404)
