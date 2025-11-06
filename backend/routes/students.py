# routes/students.py
"""
Student endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_professor, get_current_student
from models import Student, Professor
from schemas import StudentCreate, StudentResponse
from typing import List
from schemas import StudentGradeResponse
from services import get_student_grades_service

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/me", response_model=StudentResponse)
def get_student_me(current_student: Student = Depends(get_current_student)):
    """Dobijanje podataka o trenutno ulogovanom studentu"""
    return current_student

@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student: StudentCreate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Kreiranje novog studenta (samo profesori)"""
    if db.query(Student).filter(Student.email == student.email).first():
        raise HTTPException(status_code=400, detail="Email već postoji")
    if db.query(Student).filter(Student.username == student.username).first():
        raise HTTPException(status_code=400, detail="Username već postoji")
    if db.query(Student).filter(Student.index_number == student.index_number).first():
        raise HTTPException(status_code=400, detail="Index broj već postoji")

    db_student = Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    return db_student

@router.get("", response_model=list[StudentResponse])
def get_all_students(
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Lista svih studenata (samo profesori)"""
    students = db.query(Student).all()
    return students

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Dobijanje studenta po ID-u (samo profesori)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    return student

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int, 
    student_data: StudentCreate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Ažuriranje studenta (samo profesori)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    
    for key, value in student_data.dict().items():
        setattr(student, key, value)
    
    db.commit()
    db.refresh(student)
    return student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Brisanje studenta (samo profesori)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    
    db.delete(student)
    db.commit()
    return None


@router.get("/grades", response_model=List[StudentGradeResponse])
def get_student_grades(
    db: Session = Depends(get_db),
    current_student = Depends(get_current_student)
):
    """
    Endpoint za dobijanje svih ocena trenutno ulogovanog studenta
    
    - Vraća sve ocene sa informacijama o predmetu, ispitu i profesoru
    - Sortira po datumu (najnovije prvo)
    - Vraća samo prijave koje imaju unetu ocenu
    """
    try:
        grades = get_student_grades_service(db, current_student.id)
        return grades
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Greška pri učitavanju ocena: {str(e)}"
        )
