from sqlalchemy.orm import Session, joinedload
from models import Exam, Subject, Professor, ExamRegistration

def get_student_grades_service(db: Session, student_id: int):
    grades = (
        db.query(ExamRegistration)
        .join(Exam, ExamRegistration.exam_id == Exam.id)
        .join(Subject, Exam.subject_id == Subject.id)
        .join(Professor, Subject.professor_id == Professor.id)
        .filter(ExamRegistration.student_id == student_id)  
        .options(
            joinedload(ExamRegistration.exam)
            .joinedload(Exam.subject)
            .joinedload(Subject.professor)
        )
        .order_by(Exam.date.desc())
        .all()
    )

    result = []
    for reg in grades:
        result.append({
            "subject_name": reg.exam.subject.name,
            "exam_name": f"{reg.exam.subject.name} - {reg.exam.type.value}",
            "exam_date": reg.exam.date,
            "grade": reg.grade,
            "points": reg.points,
            "professor_name": reg.exam.subject.professor.name,
        })
    
    return result
