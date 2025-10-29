# routes/__init__.py
"""
Export svih rutera
"""
from routes.auth import router as auth_router
from routes.professors import router as professors_router
from routes.students import router as students_router
from routes.subjects import router as subjects_router
from routes.exams import router as exams_router
from routes.registrations import router as registrations_router

__all__ = [
    "auth_router",
    "professors_router",
    "students_router",
    "subjects_router",
    "exams_router",
    "registrations_router"
]