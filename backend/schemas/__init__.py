# schemas/__init__.py
"""
Export svih šema
"""
from schemas.auth import LoginData, StudentLoginData, Token, ProfessorRegister
from schemas.user import StudentCreate, StudentResponse, ProfessorResponse
from schemas.academic import (
    SubjectCreate, SubjectResponse,
    ExamCreate, ExamResponse,
    ExamRegistrationCreate, StudentExamRegistrationCreate,
    ExamRegistrationUpdate, ExamRegistrationResponse
)

__all__ = [
    # Auth
    "LoginData",
    "StudentLoginData",
    "Token",
    "ProfessorRegister",
    # User
    "StudentCreate",
    "StudentResponse",
    "ProfessorResponse",
    # Academic
    "SubjectCreate",
    "SubjectResponse",
    "ExamCreate",
    "ExamResponse",
    "ExamRegistrationCreate",
    "StudentExamRegistrationCreate",
    "ExamRegistrationUpdate",
    "ExamRegistrationResponse"
]