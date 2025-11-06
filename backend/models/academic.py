# models/academic.py
"""
Academic modeli: Subject, Exam, ExamRegistration
"""
from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from database import Base
from models.enums import ExamType, ExamStatus

class Subject(Base):
    __tablename__ = "Subjects"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    espb = Column(Integer, nullable=False)
    professor_id = Column(Integer, ForeignKey("professors.id"), nullable=False)
    year = Column(Integer, nullable=True)  # godina studija (1-4)
    department = Column(String(50), nullable=True)  # smer/departman

class Exam(Base):
    __tablename__ = "Exams"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_id = Column(Integer, ForeignKey("Subjects.id"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(Enum(ExamType), nullable=False)

class ExamRegistration(Base):
    __tablename__ = "Exams_Registrations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("Students.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("Exams.id"), nullable=False)
    num_of_applications = Column(Integer, default=1)
    grade = Column(Integer, default=0)
    points = Column(Integer, default=0)
    status = Column(Enum(ExamStatus), default=ExamStatus.prijavljen)