# routes/exams.py
"""
Exam endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_professor, get_current_student
from models import Exam, Subject, Professor, Student
from schemas import ExamCreate, ExamResponse

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.post("", response_model=ExamResponse)
def create_exam(
    exam: ExamCreate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Kreiranje ispita (samo profesor koji predaje predmet)"""
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ne postoji")
    
    if subject.professor_id != current_professor.id:
        raise HTTPException(
            status_code=403, 
            detail=f"Nemate dozvolu da kreirate ispite za predmet '{subject.name}'. Samo profesor {subject.professor_id} može kreirati ispite."
        )
    
    db_exam = Exam(**exam.dict())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@router.get("", response_model=list[ExamResponse])
def get_all_exams_professor(
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Lista ispita profesora (samo ispiti za predmete koje profesor predaje)"""
    professor_subjects = db.query(Subject).filter(Subject.professor_id == current_professor.id).all()
    professor_subject_ids = [s.id for s in professor_subjects]
    
    exams = db.query(Exam).filter(Exam.subject_id.in_(professor_subject_ids)).all()
    return exams

@router.get("/student", response_model=list[ExamResponse])
def get_all_exams_student(
    db: Session = Depends(get_db), 
    current_student: Student = Depends(get_current_student)
):
    """Lista ispita relevantnih za studenta (filtrirano po departmanu i godini)"""
    # Prvo dohvati predmete koji su relevantni za studenta
    subject_query = db.query(Subject)
    
    if current_student.department:
        subject_query = subject_query.filter(
            (Subject.department == current_student.department) | (Subject.department == None)
        )
    
    subject_query = subject_query.filter(
        (Subject.year <= current_student.age_of_study) | (Subject.year == None)
    )
    
    relevant_subjects = subject_query.all()
    relevant_subject_ids = [s.id for s in relevant_subjects]
    
    # Vrati samo ispite za te predmete
    exams = db.query(Exam).filter(Exam.subject_id.in_(relevant_subject_ids)).all()
    return exams

@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam(
    exam_id: int, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Dobijanje ispita po ID-u (samo profesori)"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    return exam

@router.delete("/delete/{exam_id}")
def delete_exam(
    exam_id: int, 
    db: Session = Depends(get_db), 
    professor: Professor = Depends(get_current_professor)
):
    """Brisanje ispita (samo profesor koji predaje predmet)"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ispita ne postoji")
    
    if subject.professor_id != professor.id:
        raise HTTPException(status_code=403, detail="Nemate pravo da obrišete ovaj ispit")
    
    db.delete(exam)
    db.commit()
    return {"success": True}