# routes/professors.py
"""
Professor endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_professor
from models import Professor
from schemas import ProfessorResponse

router = APIRouter(prefix="/professors", tags=["Professors"])

@router.get("/me", response_model=ProfessorResponse)
def get_me(current_professor: Professor = Depends(get_current_professor)):
    """Dobijanje podataka o trenutno ulogovanom profesoru"""
    return current_professor

@router.get("", response_model=list[ProfessorResponse])
def get_all_professors(
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Lista svih profesora (samo za profesore)"""
    professors = db.query(Professor).all()
    return professors