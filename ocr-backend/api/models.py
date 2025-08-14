from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class FileMeta(BaseModel):
    filename: str
    upload_time: str
    uploader: str

class ExtractedText(BaseModel):
    file_id: str
    content: str

class LLMLog(BaseModel):
    file_id: str
    log: str
    timestamp: str
