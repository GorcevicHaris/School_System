# models/__init__.py
"""
Export svih modela
"""
from models.user import Student, Professor
from models.academic import Subject, Exam, ExamRegistration
from models.enums import ExamType, ExamStatus

__all__ = [
    "Student",
    "Professor",
    "Subject",
    "Exam",
    "ExamRegistration",
    "ExamType",
    "ExamStatus"
]