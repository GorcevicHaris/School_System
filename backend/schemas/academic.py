# schemas/academic.py
"""
Academic Pydantic šeme
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from models.enums import ExamType, ExamStatus
from datetime import datetime
class SubjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    espb: int = Field(..., ge=1, le=30)
    professor_id: int
    year: Optional[int] = Field(None, ge=1, le=4)
    department: Optional[str] = Field(None, max_length=50)

class SubjectResponse(BaseModel):
    id: int
    name: str
    espb: int
    professor_id: int
    year: Optional[int] = None
    department: Optional[str] = None

    class Config:
        from_attributes = True

class ExamCreate(BaseModel):
    subject_id: int
    date: date
    type: ExamType

class ExamResponse(BaseModel):
    id: int
    subject_id: int
    date: date
    type: ExamType

    class Config:
        from_attributes = True

class ExamRegistrationCreate(BaseModel):
    student_id: int
    exam_id: int

class StudentExamRegistrationCreate(BaseModel):
    exam_id: int

class ExamRegistrationUpdate(BaseModel):
    grade: Optional[int] = None
    points: Optional[int] = None
    status: Optional[ExamStatus] = None

class ExamRegistrationResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    num_of_applications: int
    grade: int
    points: int
    status: ExamStatus

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
