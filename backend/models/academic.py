from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship  # ← DODAJ IMPORT!
from database import Base
from models.enums import ExamType, ExamStatus


class Subject(Base):
    __tablename__ = "Subjects"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    espb = Column(Integer, nullable=False)
    professor_id = Column(Integer, ForeignKey("professors.id"), nullable=False)
    year = Column(Integer, nullable=True)
    department = Column(String(50), nullable=True)
    
    # ✅ RELATIONSHIPS:
    professor = relationship("Professor", back_populates="subjects")
    exams = relationship("Exam", back_populates="subject")


class Exam(Base):
    __tablename__ = "Exams"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_id = Column(Integer, ForeignKey("Subjects.id"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(Enum(ExamType), nullable=False)
    
    # ✅ RELATIONSHIPS:
    subject = relationship("Subject", back_populates="exams")
    registrations = relationship("ExamRegistration", back_populates="exam")


class ExamRegistration(Base):
    __tablename__ = "Exams_Registrations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("Students.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("Exams.id"), nullable=False)
    num_of_applications = Column(Integer, default=1)
    grade = Column(Integer, default=0)
    points = Column(Integer, default=0)
    status = Column(Enum(ExamStatus), default=ExamStatus.prijavljen)
    
    # ✅ RELATIONSHIPS:
    student = relationship("Student", back_populates="exam_registrations")
    exam = relationship("Exam", back_populates="registrations")