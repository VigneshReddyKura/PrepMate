import os
from dotenv import load_dotenv
from supabase import create_client
from pydantic import BaseModel

class SignupRequest(BaseModel):
    email: str
    password: str

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "PrepMate backend is alive"}

@app.get("/test-supabase")
def test_supabase():
    return {"connected": True, "url": SUPABASE_URL}

@app.post("/signup")
def signup(request: SignupRequest):
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        user_id = response.user.id

        supabase.table("profiles").insert({
            "id": user_id,
            "full_name": None,
            "target_role": None
        }).execute()

        return {"success": True, "user_id": user_id}
    except Exception as e:
        return {"success": False, "error": str(e)}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        return {
            "success": True,
            "access_token": response.session.access_token,
            "user_id": response.user.id
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

from fastapi import UploadFile, File
from pypdf import PdfReader
import io

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))

        raw_text = ""
        for page in pdf_reader.pages:
            raw_text += page.extract_text()

        return {"success": True, "raw_text": raw_text}
    except Exception as e:
        return {"success": False, "error": str(e)}