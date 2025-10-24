from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Date, Enum, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, date
import enum
# Sintaksa setattr(obj, attr_name, value) zahteva da prvi parametar bude objekat, drugi ime atributa (string), a treći nova vrednost.
# -------------------------------
# KONFIGURACIJA
# -------------------------------
DATABASE_URL = "mysql+pymysql://root:@localhost:3004/School"
engine_root = create_engine("mysql+pymysql://root:@localhost:3004/")

with engine_root.connect() as conn:
    conn.execute(text("CREATE DATABASE IF NOT EXISTS School"))

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

SECRET_KEY = "school_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# -------------------------------
# ENUMS
# -------------------------------
class ExamType(str, enum.Enum):
    pismeni = "pismeni"
    usmeni = "usmeni"

class ExamStatus(str, enum.Enum):
    prijavljen = "prijavljen"
    polozio = "polozio"
    pao = "pao"

# -------------------------------
# MODELI BAZE
# -------------------------------
class Student(Base):
    __tablename__ = "Students"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    index_number = Column(String(20), unique=True, nullable=False)
    age_of_study = Column(Integer, nullable=False)

class Professor(Base):
    __tablename__ = "professors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)

class Subject(Base):
    __tablename__ = "Subjects"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    espb = Column(Integer, nullable=False)
    professor_id = Column(Integer, ForeignKey("professors.id"), nullable=False)

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

# -------------------------------
# PYDANTIC ŠEME
# -------------------------------
class ProfessorRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    subject: str = Field(..., min_length=2, max_length=100)

class LoginData(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_role: str

class StudentLoginData(BaseModel):
    username: str
    index_number: str

class StudentResponse(BaseModel):
    id: int
    name: str
    username: str
    email: str
    index_number: str
    age_of_study: int

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

class StudentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    index_number: str = Field(..., min_length=3, max_length=20)
    age_of_study: int = Field(..., ge=1, le=10)

class SubjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    espb: int = Field(..., ge=1, le=30)
    professor_id: int

class SubjectResponse(BaseModel):
    id: int
    name: str
    espb: int
    professor_id: int

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

# -------------------------------
# FASTAPI APP
# -------------------------------
app = FastAPI(title="School Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# HELPER FUNKCIJE
# -------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_student(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_role = payload.get("role")
        
        if username is None or user_role != "student":
            raise HTTPException(status_code=401, detail="Invalid token or not a student")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    student = db.query(Student).filter(Student.username == username).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student

def get_current_professor(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_role = payload.get("role")
        
        if username is None or user_role != "professor":
            raise HTTPException(status_code=401, detail="Invalid token or not a professor")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    professor = db.query(Professor).filter(Professor.username == username).first()

    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    return professor

# -------------------------------
# AUTH ENDPOINTS - PROFESORI
# -------------------------------
@app.post("/register", response_model=ProfessorResponse, status_code=status.HTTP_201_CREATED)
def register_professor(professor: ProfessorRegister, db: Session = Depends(get_db)):
    if db.query(Professor).filter(Professor.email == professor.email).first():
        raise HTTPException(status_code=400, detail="Email već postoji")
    if db.query(Professor).filter(Professor.username == professor.username).first():
        raise HTTPException(status_code=400, detail="Username već postoji")

    hashed_pw = hash_password(professor.password)
    db_professor = Professor(
        name=professor.name,
        username=professor.username,
        email=professor.email,
        password=hashed_pw,
        subject=professor.subject
    )
    
    db.add(db_professor)
    db.commit()
    db.refresh(db_professor)
    
    return db_professor

@app.post("/login", response_model=Token)
def login(data: LoginData, db: Session = Depends(get_db)):
    professor = db.query(Professor).filter(Professor.username == data.username).first()

    if not professor or not verify_password(data.password, professor.password):
        raise HTTPException(status_code=401, detail="Pogrešni kredencijali")

    access_token = create_access_token(
        data={"sub": professor.username, "id": professor.id, "role": "professor"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": professor.id,
        "user_role": "professor"
    }

# -------------------------------
# STUDENT AUTH ENDPOINTS
# -------------------------------
@app.post("/students/login", response_model=Token)
def login_student(data: StudentLoginData, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.username == data.username).first()

    if not student:
        raise HTTPException(status_code=401, detail="Pogrešni kredencijali: Student ne postoji")

    if student.index_number != data.index_number:
        raise HTTPException(status_code=401, detail="Pogrešni kredencijali: Indeks broj nije tačan")

    access_token = create_access_token(
        data={"sub": student.username, "id": student.id, "role": "student"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": student.id,
        "user_role": "student"
    }

@app.get("/students/me", response_model=StudentResponse)
def get_student_me(current_student: Student = Depends(get_current_student)):
    return current_student

# -------------------------------
# PROFESSOR ENDPOINTS
# -------------------------------
@app.get("/me", response_model=ProfessorResponse)
def get_me(current_professor: Professor = Depends(get_current_professor)):
    return current_professor

@app.get("/professors", response_model=list[ProfessorResponse])
def get_all_professors(db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    professors = db.query(Professor).all()
    return professors

# -------------------------------
# STUDENT ENDPOINTS (CRUD by Professors)
# -------------------------------
@app.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student: StudentCreate, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    if db.query(Student).filter(Student.email == student.email).first():
        raise HTTPException(status_code=400, detail="Email već postoji")
    if db.query(Student).filter(Student.username == student.username).first():
        raise HTTPException(status_code=400, detail="Username već postoji")
    if db.query(Student).filter(Student.index_number == student.index_number).first():
        raise HTTPException(status_code=400, detail="Index broj već postoji")

    db_student = Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    return db_student

@app.get("/students", response_model=list[StudentResponse])
def get_all_students(db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    students = db.query(Student).all()
    return students

@app.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    return student

@app.put("/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student_data: StudentCreate, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    
    for key, value in student_data.dict().items():
        setattr(student, key, value)
    
    db.commit()
    db.refresh(student)
    return student

@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    
    db.delete(student)
    db.commit()
    return None

# -------------------------------
# SUBJECT ENDPOINTS
# -------------------------------
@app.post("/subjects", response_model=SubjectResponse)
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    db_subject = Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

# PROFESOR može videti sve predmete
@app.get("/subjects", response_model=list[SubjectResponse])
def get_all_subjects(db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    subjects = db.query(Subject).all()
    return subjects

# STUDENT može videti sve predmete
@app.get("/student/subjects", response_model=list[SubjectResponse])
def get_all_subjects_student(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    subjects = db.query(Subject).all()
    return subjects

# -------------------------------
# EXAM ENDPOINTS
# -------------------------------
@app.post("/exams", response_model=ExamResponse)
def create_exam(exam: ExamCreate, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    # ⭐ Proveri da li je profesor vlasnik predmeta
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    #provera da li predmet postoji i da li ga je profesor uospet kreirao
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ne postoji")
    
    if subject.professor_id != current_professor.id:
        raise HTTPException(
            status_code=403, 
            detail=f"Nemate dozvolu da kreirate ispite za predmet '{subject.name}'. Samo profesor {subject.professor_id} može kreirati ispite."
        )
    db_exam = Exam(**exam.dict())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

# PROFESOR može videti sve ispite (SAMO ZA SVOJE PREDMETE)
@app.get("/exams", response_model=list[ExamResponse])
def get_all_exams_professor(db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    # ⭐ Profesor vidi SAMO ispite za SVOJE predmete
    professor_subjects = db.query(Subject).filter(Subject.professor_id == current_professor.id).all()
    professor_subject_ids = [s.id for s in professor_subjects]
    #ovo je ako profesor ima vise predmeta
    
    exams = db.query(Exam).filter(Exam.subject_id.in_(professor_subject_ids)).all()
    return exams

# STUDENT može videti sve ispite (BEZ autentifikacije - zato radi!)
@app.get("/student/exams", response_model=list[ExamResponse])
def get_all_exams_student(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    exams = db.query(Exam).all()
    return exams

@app.get("/exams/{exam_id}", response_model=ExamResponse)
def get_exam(exam_id: int, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    return exam

# -------------------------------
# EXAM REGISTRATION ENDPOINTS
# -------------------------------

# Pydantic šema za studentsku prijavu (bez student_id)
class StudentExamRegistrationCreate(BaseModel):
    exam_id: int

# ENDPOINT ZA STUDENTE - prijava na ispit
@app.post("/student/exam-registrations", response_model=ExamRegistrationResponse)
def student_create_exam_registration(
    registration: StudentExamRegistrationCreate, 
    db: Session = Depends(get_db), 
    current_student: Student = Depends(get_current_student)
):
    # Student automatski koristi svoj ID iz tokena
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    # Proveri da li je već prijavljen
    existing = db.query(ExamRegistration).filter(
        ExamRegistration.student_id == current_student.id,
        ExamRegistration.exam_id == registration.exam_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Već ste prijavljeni na ovaj ispit")
    
    # Kreiraj novu prijavu
    db_registration = ExamRegistration(
        student_id=current_student.id,
        exam_id=registration.exam_id
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    return db_registration

# ENDPOINT ZA PROFESORE - kreiranje prijave za studenta
@app.post("/exam-registrations", response_model=ExamRegistrationResponse)
def create_exam_registration(
    registration: ExamRegistrationCreate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    student = db.query(Student).filter(Student.id == registration.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student ne postoji")
    
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    existing = db.query(ExamRegistration).filter(
        ExamRegistration.student_id == registration.student_id,
        ExamRegistration.exam_id == registration.exam_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student je već prijavljen na ovaj ispit")
    
    db_registration = ExamRegistration(**registration.dict())
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    return db_registration

@app.get("/exam-registrations", response_model=list[ExamRegistrationResponse])
def get_all_exam_registrations(db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    # ⭐ Profesor vidi SAMO prijave za SVOJE predmete
    # 1. Pronađi sve predmete ovog profesora
    professor_subjects = db.query(Subject).filter(Subject.professor_id == current_professor.id).all()
    professor_subject_ids = [s.id for s in professor_subjects]
    
    # 2. Pronađi sve ispite za te predmete
    professor_exams = db.query(Exam).filter(Exam.subject_id.in_(professor_subject_ids)).all()
    professor_exam_ids = [e.id for e in professor_exams]
    
    # 3. Vrati samo prijave za te ispite
    registrations = db.query(ExamRegistration).filter(
        ExamRegistration.exam_id.in_(professor_exam_ids)
    ).all()
    
    return registrations

# STUDENT vidi samo SVOJE prijave
@app.get("/student/exam-registrations", response_model=list[ExamRegistrationResponse])
def get_my_exam_registrations(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    registrations = db.query(ExamRegistration).filter(
        ExamRegistration.student_id == current_student.id
    ).all()
    return registrations

@app.get("/exam-registrations/exam/{exam_id}", response_model=list[ExamRegistrationResponse])
def get_exam_registrations_by_exam(exam_id: int, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    registrations = db.query(ExamRegistration).filter(ExamRegistration.exam_id == exam_id).all()
    return registrations

@app.put("/exam-registrations/{registration_id}", response_model=ExamRegistrationResponse)
def update_exam_registration(
    registration_id: int, 
    update_data: ExamRegistrationUpdate, 
    db: Session = Depends(get_db), 
    current_professor: Professor = Depends(get_current_professor)
):
    # 1. Pronađi prijavu
    registration = db.query(ExamRegistration).filter(ExamRegistration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Prijava ne postoji")
    
    # 2. Pronađi ispit
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    # 3. Pronađi predmet
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ne postoji")
    
    # 4. ⭐ PROVERI DA LI JE PROFESOR VLASNIK PREDMETA
    if subject.professor_id != current_professor.id:
        raise HTTPException(
            status_code=403, 
            detail=f"Nemate dozvolu da menjate ocene za predmet '{subject.name}'. Samo profesor {subject.professor_id} može menjati ocene."
        )
    
    # 5. Ažuriraj prijavu
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(registration, key, value)
    
    db.commit()
    db.refresh(registration)
    return registration

@app.get("/")
def root():
    return {
        "message": "School Management System API",
        "status": "online"
    }