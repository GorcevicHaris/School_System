# schemas/user.py
"""
User Pydantic šeme
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class StudentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    index_number: str = Field(..., min_length=3, max_length=20)
    age_of_study: int = Field(..., ge=1, le=10)
    department: Optional[str] = Field(None, max_length=50)

class StudentResponse(BaseModel):
    id: int
    name: str
    username: str
    email: str
    index_number: str
    age_of_study: int
    department: Optional[str] = None

    class Config:
        from_attributes = True

class ProfessorResponse(BaseModel):
    id: int
    name: str
    username: str
    email: str
    subject: str

    class Config:
        from_attributes = True


class StudentGradeResponse(BaseModel):
    """Šema za prikaz ocene studenta"""
    subject_name: str
    exam_name: str
    exam_date: datetime
    grade: Optional[int] = None
    points: Optional[int] = None
    professor_name: str
    
    class Config:
        from_attributes = True
