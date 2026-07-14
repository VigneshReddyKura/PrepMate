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
        return {"success": True, "user_id": response.user.id}
    except Exception as e:
        return {"success": False, "error": str(e)}