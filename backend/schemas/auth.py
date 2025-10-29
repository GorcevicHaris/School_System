# schemas/auth.py
"""
Authentication Pydantic šeme
"""
from pydantic import BaseModel, Field, EmailStr

class LoginData(BaseModel):
    username: str
    password: str

class StudentLoginData(BaseModel):
    username: str
    index_number: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_role: str

class ProfessorRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    subject: str = Field(..., min_length=2, max_length=100)