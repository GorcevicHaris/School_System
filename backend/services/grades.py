from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from models.academic import ExamRegistration, Exam, Subject
from models.user import Professor


def get_student_grades_service(db: Session, student_id: int):
    """
    Vraća sve ocene studenta sa svim relevantnim informacijama
    """
    try:
        grades = (
            db.query(ExamRegistration)
            .join(Exam, ExamRegistration.exam_id == Exam.id)
            .join(Subject, Exam.subject_id == Subject.id)
            .join(Professor, Subject.professor_id == Professor.id)
            .filter(
                and_(
                    ExamRegistration.student_id == student_id,
                    ExamRegistration.grade > 5  # ← Samo položeni (6-10)
                )
            )
            .options(
                joinedload(ExamRegistration.exam)
                .joinedload(Exam.subject)
                .joinedload(Subject.professor)
            )
            .order_by(Exam.date.desc())  # ← Tvoja kolona je 'date', ne 'exam_date'
            .all()
        )
        
        # Formatiramo podatke
        result = []
        for reg in grades:
            result.append({
                "subject_name": reg.exam.subject.name,
                "exam_name": f"{reg.exam.subject.name} - {reg.exam.type.value}",  # jer Exam nema 'name' kolonu
                "exam_date": reg.exam.date,  # ← 'date', ne 'exam_date'
                "grade": reg.grade,
                "points": reg.points,
                "professor_name": reg.exam.subject.professor.name
            })
        
        return result
        
    except Exception as e:
        print(f"Error fetching student grades: {e}")
        import traceback
        traceback.print_exc()  # ← Detaljniji error za debugging
        raise