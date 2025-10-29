# routes/auth.py
"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from dependencies import get_db
from models import Professor, Student
from schemas import (
    ProfessorRegister, ProfessorResponse, 
    LoginData, StudentLoginData, Token
)
from services import hash_password, verify_password, create_access_token
from config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=ProfessorResponse, status_code=status.HTTP_201_CREATED)
def register_professor(professor: ProfessorRegister, db: Session = Depends(get_db)):
    """Registracija profesora"""
    if db.query(Professor).filter(Professor.email == professor.email).first():
        raise HTTPException(status_code=400, detail="Email već postoji")
    if db.query(Professor).filter(Professor.username == professor.username).first():
        raise HTTPException(status_code=400, detail="Username već postoji")

    hashed_pw = hash_password(professor.password)
    db_professor = Professor(
        name=professor.name,
        username=professor.username,
        email=professor.email,
        password=hashed_pw,
        subject=professor.subject
    )
    
    db.add(db_professor)
    db.commit()
    db.refresh(db_professor)
    
    return db_professor

@router.post("/login", response_model=Token)
def login(data: LoginData, db: Session = Depends(get_db)):
    """Login profesora"""
    professor = db.query(Professor).filter(Professor.username == data.username).first()

    if not professor or not verify_password(data.password, professor.password):
        raise HTTPException(status_code=401, detail="Pogrešni kredencijali")

    access_token = create_access_token(
        data={"sub": professor.username, "id": professor.id, "role": "professor"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": professor.id,
        "user_role": "professor"
    }

@router.post("/students/login", response_model=Token)
def login_student(data: StudentLoginData, db: Session = Depends(get_db)):
    """Login studenta"""
    student = db.query(Student).filter(Student.username == data.username).first()

    if not student:
        raise HTTPException(status_code=401, detail="Pogrešni kredencijali: Student ne postoji")

    if student.index_number != data.index_number:
        raise HTTPException(status_code=401, detail="Pogrešni kredencijali: Indeks broj nije tačan")

    access_token = create_access_token(
        data={"sub": student.username, "id": student.id, "role": "student"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": student.id,
        "user_role": "student"
    }