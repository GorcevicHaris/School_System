# services/validation.py
"""
Validacioni servisi
"""
from sqlalchemy.orm import Session
from models import Student, Exam, Subject

def can_student_register_for_exam(student: Student, exam: Exam, db: Session) -> tuple[bool, str]:
    """
    Provera da li student ispunjava uslove za prijavu ispita.
    Vraća (True/False, poruka)
    """
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    
    if not subject:
        return False, "Predmet ne postoji"
    
    # Provera departmana
    if subject.department and student.department:
        if subject.department != student.department:
            return False, f"Ovaj predmet je samo za smer '{subject.department}'. Vi ste na smeru '{student.department}'."
    
    # Provera godine studija
    if subject.year:
        if student.age_of_study < subject.year:
            return False, f"Ovaj predmet je za {subject.year}. godinu studija. Vi ste na {student.age_of_study}. godini."
    
    return True, "OK"