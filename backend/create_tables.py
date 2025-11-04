# create_tables.py
from database import Base, engine
from models.academic import Subject, Exam, ExamRegistration
from models.user import Student, Professor

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
