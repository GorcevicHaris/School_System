# routes/registrations.py (nastavak)
"""
Exam Registration endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_professor, get_current_student
from models import ExamRegistration, Exam, Subject, Student, Professor
from models.enums import ExamStatus
from schemas import (
    ExamRegistrationCreate, 
    StudentExamRegistrationCreate,
    ExamRegistrationUpdate, 
    ExamRegistrationResponse
)
from services import can_student_register_for_exam

router = APIRouter(prefix="/exam-registrations", tags=["Exam Registrations"])

@router.post("/student", response_model=ExamRegistrationResponse)
def student_create_exam_registration(
    registration: StudentExamRegistrationCreate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student)
):
    """Prijava ispita od strane studenta (sa validacijom departmana i godine)"""
    
    # 1. Proveri da li ispit postoji
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    # 2. NOVA VALIDACIJA - Proveri da li student MOŽE prijaviti ovaj ispit
    can_register, message = can_student_register_for_exam(current_student, exam, db)
    if not can_register:
        raise HTTPException(status_code=403, detail=message)
    
    # 3. Dohvati SVE id od ispita za ovaj predmet
    all_exam_ids_for_subject = [
        e.id for e in db.query(Exam.id).filter(Exam.subject_id == exam.subject_id).all()
    ]
    
    # 4. Dohvati SVE prijave studenta za ovaj predmet
    all_registrations = db.query(ExamRegistration).filter(
        ExamRegistration.student_id == current_student.id,
        ExamRegistration.exam_id.in_(all_exam_ids_for_subject)
    ).all()
    
    # 5. Provere na osnovu već dohvaćenih podataka
    for reg in all_registrations:
        if reg.exam_id == registration.exam_id:
            if reg.status == ExamStatus.prijavljen:
                raise HTTPException(status_code=400, detail="Već ste prijavljeni na ovaj ispitni rok")
            elif reg.status == ExamStatus.pao:
                raise HTTPException(status_code=400, detail="Već ste pali na ovom roku. Sačekajte novi rok.")
        
        if reg.status == ExamStatus.prijavljen:
            raise HTTPException(
                status_code=400,
                detail="Već ste prijavljeni na drugi ispitni rok za ovaj predmet"
            )
        
        if reg.status == ExamStatus.polozio:
            raise HTTPException(status_code=400, detail="Već ste položili ovaj predmet")
    
    # 6. Kreiraj novu prijavu
    db_registration = ExamRegistration(
        student_id=current_student.id,
        exam_id=registration.exam_id,
        num_of_applications=len(all_registrations) + 1
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    return db_registration

@router.post("", response_model=ExamRegistrationResponse)
def create_exam_registration(
    registration: ExamRegistrationCreate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Prijava ispita od strane profesora (manuelna prijava studenta)"""
    student = db.query(Student).filter(Student.id == registration.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    existing = db.query(ExamRegistration).filter(
        ExamRegistration.student_id == registration.student_id,
        ExamRegistration.exam_id == registration.exam_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student je već prijavljen na ovaj ispit")
    
    db_registration = ExamRegistration(**registration.dict())
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    return db_registration

@router.get("", response_model=list[ExamRegistrationResponse])
def get_all_exam_registrations(
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Lista svih prijava za ispite profesora"""
    professor_subjects = db.query(Subject).filter(Subject.professor_id == current_professor.id).all()
    professor_subject_ids = [s.id for s in professor_subjects]
    
    professor_exams = db.query(Exam).filter(Exam.subject_id.in_(professor_subject_ids)).all()
    professor_exam_ids = [e.id for e in professor_exams]
    
    registrations = db.query(ExamRegistration).filter(
        ExamRegistration.exam_id.in_(professor_exam_ids)
    ).all()
    
    return registrations

@router.get("/student", response_model=list[ExamRegistrationResponse])
def get_my_exam_registrations(
    db: Session = Depends(get_db), 
    current_student: Student = Depends(get_current_student)
):
    """Lista prijava ispita trenutno ulogovanog studenta"""
    registrations = db.query(ExamRegistration).filter(
        ExamRegistration.student_id == current_student.id
    ).all()
    return registrations

@router.get("/exam/{exam_id}", response_model=list[ExamRegistrationResponse])
def get_exam_registrations_by_exam(
    exam_id: int, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Lista prijava za određeni ispit"""
    registrations = db.query(ExamRegistration).filter(ExamRegistration.exam_id == exam_id).all()
    return registrations

@router.put("/{registration_id}", response_model=ExamRegistrationResponse)
def update_exam_registration(
    registration_id: int, 
    update_data: ExamRegistrationUpdate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    """Ažuriranje prijave ispita (unos ocene, poena, statusa) - samo profesor"""
    registration = db.query(ExamRegistration).filter(ExamRegistration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Prijava ne postoji")
    
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ne postoji")
    
    if subject.professor_id != current_professor.id:
        raise HTTPException(
            status_code=403, 
            detail=f"Nemate dozvolu da menjate ocene za predmet '{subject.name}'. Samo profesor {subject.professor_id} može menjati ocene."
        )
    
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(registration, key, value)
    
    db.commit()
    db.refresh(registration)
    return registration