# main.py
"""
Glavni FastAPI aplikacijski fajl
Registruje sve rutere i kreira tabele
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import CORS_ORIGINS, CORS_ALLOW_CREDENTIALS, CORS_ALLOW_METHODS, CORS_ALLOW_HEADERS

# Import rutera
from routes import (
    auth_router,
    professors_router,
    students_router,
    subjects_router,
    exams_router,
    registrations_router
)

# Kreiranje tabela u bazi
Base.metadata.create_all(bind=engine)

# Kreiranje FastAPI aplikacije
app = FastAPI(
    title="School Management System API",
    description="API za upravljanje školskim sistemom - studenti, profesori, predmeti, ispiti",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
)

# Registracija rutera
app.include_router(auth_router)
app.include_router(professors_router)
app.include_router(students_router)
app.include_router(subjects_router)
app.include_router(exams_router)
app.include_router(registrations_router)

@app.get("/")
def root():
    """Root endpoint - provera da li API radi"""
    return {
        "message": "School Management System API",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
