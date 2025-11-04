# routes/subjects.py
"""
Subject endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_professor, get_current_student
from models import Subject, Professor, Student
from schemas import SubjectCreate, SubjectResponse

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.post("", response_model=SubjectResponse)
def create_subject(
    subject: SubjectCreate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Kreiranje predmeta (samo profesori)"""
    db_subject = Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.get("", response_model=list[SubjectResponse])
def get_all_subjects(
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Lista svih predmeta (samo profesori)"""
    subjects = db.query(Subject).all()
    
    print(f"🔍 PROFESOR ID: {current_professor.id}")
    print(f"📚 PRONAĐENO PREDMETA: {len(subjects)}")
    for subject in subjects:
        print(f"   - {subject.name} (ID: {subject.id}, Profesor: {subject.professor_id})")
    
    return subjects
@router.get("/student", response_model=list[SubjectResponse])
def get_all_subjects_student(
    db: Session = Depends(get_db), 
    current_student: Student = Depends(get_current_student),

):
    """Lista predmeta relevantnih za studenta (filtrirano po departmanu i godini)"""
    query = db.query(Subject)
    
    # Filtriraj po departmanu ako student ima definisan departman
    if current_student.department:
        query = query.filter(
            (Subject.department == current_student.department) | (Subject.department == None)
        )
    
    # Filtriraj po godini - student vidi samo predmete svoje ili nižih godina
    query = query.filter(
        (Subject.year <= current_student.age_of_study) | (Subject.year == None)
    )
    
    subjects = query.all()
    return subjects

@router.delete("/delete/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_professor: Professor = Depends(get_current_professor)
):
    """Brisanje predmeta (samo profesor koji ga predaje)"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ne postoji")
    
    if subject.professor_id != current_professor.id:
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu jer ovo nije vas predmet"
        )
    db.delete(subject)
    db.commit()

    return {"success": True, "message": f"Predmet '{subject.name}' je uspesno obrisan"}