# dependencies.py
"""
FastAPI dependency funkcije
"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Student, Professor
from config import SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_student(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
) -> Student:
    """Dependency za dobijanje trenutno ulogovanog studenta"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_role = payload.get("role")
        
        if username is None or user_role != "student":
            raise HTTPException(status_code=401, detail="Invalid token or not a student")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    student = db.query(Student).filter(Student.username == username).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student

def get_current_professor(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
) -> Professor:
    """Dependency za dobijanje trenutno ulogovanog profesora"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_role = payload.get("role")
        
        if username is None or user_role != "professor":
            raise HTTPException(status_code=401, detail="Invalid token or not a professor")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    professor = db.query(Professor).filter(Professor.username == username).first()

    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    return professor