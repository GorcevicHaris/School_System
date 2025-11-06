from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship  # ← DODAJ IMPORT!
from database import Base

class Student(Base):
    __tablename__ = "Students"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    index_number = Column(String(20), unique=True, nullable=False)
    age_of_study = Column(Integer, nullable=False)
    department = Column(String(50), nullable=True)
    
    # ✅ DODAJ:
    exam_registrations = relationship("ExamRegistration", back_populates="student")


class Professor(Base):
    __tablename__ = "professors"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    
    # ✅ DODAJ:
    subjects = relationship("Subject", back_populates="professor")