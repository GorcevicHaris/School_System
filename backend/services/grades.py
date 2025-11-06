
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from models import ExamRegistration, Exam, Subject, Professor

def get_student_grades_service(db: Session, student_id: int):
    """
    Vraća sve ocene studenta sa svim relevantnim informacijama
    """
    try:
        # Kompleksan upit koji spaja sve potrebne tabele
        grades = (
            db.query(ExamRegistration)
            .join(Exam, ExamRegistration.exam_id == Exam.id)
            .join(Subject, Exam.subject_id == Subject.id)
            .join(Professor, Subject.professor_id == Professor.id)
            .filter(
                ExamRegistration.student_id == student_id,
                ExamRegistration.grade.isnot(None)  # Samo prijave sa ocenom
            )
            .options(
                joinedload(ExamRegistration.exam)
                .joinedload(Exam.subject)
                .joinedload(Subject.professor)
            )
            .order_by(Exam.exam_date.desc())  # Najnovije prvo
            .all()
        )
        
        # Formatiramo podatke
        result = []
        for reg in grades:
            result.append({
                "subject_name": reg.exam.subject.name,
                "exam_name": reg.exam.name,
                "exam_date": reg.exam.exam_date,
                "grade": reg.grade,
                "points": reg.points,
                "professor_name": reg.exam.subject.professor.name
            })
        
        return result
    except Exception as e:
        print(f"Error fetching student grades: {e}")
        raise
