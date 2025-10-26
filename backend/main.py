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
    department = Column(String(50), nullable=True)  # ⭐ NOVO

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
    year = Column(Integer, nullable=True)  # ⭐ NOVO - godina studija (1-4)
    department = Column(String(50), nullable=True)  # ⭐ NOVO - smer/departman

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
# PYDANTIC ŠEME - AŽURIRANE
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
    department: Optional[str] = None  # ⭐ NOVO

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
    department: Optional[str] = Field(None, max_length=50)  # ⭐ NOVO

class SubjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    espb: int = Field(..., ge=1, le=30)
    professor_id: int
    year: Optional[int] = Field(None, ge=1, le=4)  # ⭐ NOVO
    department: Optional[str] = Field(None, max_length=50)  # ⭐ NOVO

class SubjectResponse(BaseModel):
    id: int
    name: str
    espb: int
    professor_id: int
    year: Optional[int] = None  # ⭐ NOVO
    department: Optional[str] = None  # ⭐ NOVO

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

# ⭐ NOVA HELPER FUNKCIJA - Provera da li student može prijaviti ispit
def can_student_register_for_exam(student: Student, exam: Exam, db: Session) -> tuple[bool, str]:
    """
    Provera da li student ispunjava uslove za prijavu ispita.
    Vraća (True/False, poruka)
    """
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    
    if not subject:
        return False, "Predmet ne postoji"
    
    # Provera departmana
    if subject.department and student.department:
        if subject.department != student.department:
            return False, f"Ovaj predmet je samo za smer '{subject.department}'. Vi ste na smeru '{student.department}'."
    
    # Provera godine studija
    if subject.year:
        if student.age_of_study < subject.year:
            return False, f"Ovaj predmet je za {subject.year}. godinu studija. Vi ste na {student.age_of_study}. godini."
    
    return True, "OK"

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

@app.get("/subjects", response_model=list[SubjectResponse])
def get_all_subjects(db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    subjects = db.query(Subject).all()
    return subjects

# ⭐ STUDENT vidi samo predmete svog departmana i odgovarajuće godine
@app.get("/student/subjects", response_model=list[SubjectResponse])
def get_all_subjects_student(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    query = db.query(Subject)
    
    # Filtriraj po departmanu ako student ima definisan departman
    if current_student.department:
        query = query.filter(
            (Subject.department == current_student.department) | (Subject.department == None)
        )
    
    # Filtriraj po godini - student vidi samo predmete svoje ili nižih godina
    query = query.filter(
        (Subject.year <= current_student.age_of_study) | (Subject.year == None)
    )
    
    subjects = query.all()
    return subjects

@app.delete("/delete/subject/{subject_id}")
def delete_subject(
    subject_id:int,
    db:Session = Depends(get_db),
    current_professor:Professor = Depends(get_current_professor)
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject :
        raise HTTPException(status_code=404,detail="Predmet ne postoji")
    
    if subject.professor_id != current_professor.id:
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu jer ovo nije vas predmet"
        )
    db.delete(subject)
    db.commit()

    return {"success":True,"message":f"Predmet ' {subject.name} je uspesno obrisan"}

# -------------------------------
# EXAM ENDPOINTS
# -------------------------------
@app.post("/exams", response_model=ExamResponse)
def create_exam(exam: ExamCreate, db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    
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

@app.get("/exams", response_model=list[ExamResponse])
def get_all_exams_professor(db: Session = Depends(get_db), current_professor: Professor = Depends(get_current_professor)):
    professor_subjects = db.query(Subject).filter(Subject.professor_id == current_professor.id).all()
    professor_subject_ids = [s.id for s in professor_subjects]
    
    exams = db.query(Exam).filter(Exam.subject_id.in_(professor_subject_ids)).all()
    return exams

# ⭐ STUDENT vidi samo ispite koji su relevantni za njegov departman i godinu
@app.get("/student/exams", response_model=list[ExamResponse])
def get_all_exams_student(db: Session = Depends(get_db), current_student: Student = Depends(get_current_student)):
    # Prvo dohvati predmete koji su relevantni za studenta
    subject_query = db.query(Subject)
    
    if current_student.department:
        subject_query = subject_query.filter(
            (Subject.department == current_student.department) | (Subject.department == None)
        )
    
    subject_query = subject_query.filter(
        (Subject.year <= current_student.age_of_study) | (Subject.year == None)
    )
    
    relevant_subjects = subject_query.all()
    relevant_subject_ids = [s.id for s in relevant_subjects]
    
    # Vrati samo ispite za te predmete
    exams = db.query(Exam).filter(Exam.subject_id.in_(relevant_subject_ids)).all()
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
class StudentExamRegistrationCreate(BaseModel):
    exam_id: int

# ⭐ AŽURIRANO - ENDPOINT ZA STUDENTE sa validacijom departmana i godine
@app.post("/student/exam-registrations", response_model=ExamRegistrationResponse)
def student_create_exam_registration(
    registration: StudentExamRegistrationCreate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student)
):
    # 1. Proveri da li ispit postoji
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    # 2. ⭐ NOVA VALIDACIJA - Proveri da li student MOŽE prijaviti ovaj ispit
    can_register, message = can_student_register_for_exam(current_student, exam, db)
    if not can_register:
        raise HTTPException(status_code=403, detail=message)
    
    # 3. Dohvati SVE id od ispita za ovaj predmet
    all_exam_ids_for_subject = [
        e.id for e in db.query(Exam.id).filter(Exam.subject_id == exam.subject_id).all()
    ]
    
    # 4. Dohvati SVE prijave studenta za ovaj predmet
    all_registrations = db.query(ExamRegistration).filter(
        ExamRegistration.student_id == current_student.id,
        ExamRegistration.exam_id.in_(all_exam_ids_for_subject)
    ).all()
    
    # 5. Provere na osnovu već dohvaćenih podataka
    for reg in all_registrations:
        if reg.exam_id == registration.exam_id:
            if reg.status == ExamStatus.prijavljen:
                raise HTTPException(status_code=400, detail="Već ste prijavljeni na ovaj ispitni rok")
            elif reg.status == ExamStatus.pao:
                raise HTTPException(status_code=400, detail="Već ste pali na ovom roku. Sačekajte novi rok.")
        
        if reg.status == ExamStatus.prijavljen:
            raise HTTPException(
                status_code=400,
                detail="Već ste prijavljeni na drugi ispitni rok za ovaj predmet"
            )
        
        if reg.status == ExamStatus.polozio:
            raise HTTPException(status_code=400, detail="Već ste položili ovaj predmet")
    
    # 6. Kreiraj novu prijavu
    db_registration = ExamRegistration(
        student_id=current_student.id,
        exam_id=registration.exam_id,
        num_of_applications=len(all_registrations) + 1
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    return db_registration

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
    professor_subjects = db.query(Subject).filter(Subject.professor_id == current_professor.id).all()
    professor_subject_ids = [s.id for s in professor_subjects]
    
    professor_exams = db.query(Exam).filter(Exam.subject_id.in_(professor_subject_ids)).all()
    professor_exam_ids = [e.id for e in professor_exams]
    
    registrations = db.query(ExamRegistration).filter(
        ExamRegistration.exam_id.in_(professor_exam_ids)
    ).all()
    
    return registrations

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
    registration = db.query(ExamRegistration).filter(ExamRegistration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Prijava ne postoji")
    
    exam = db.query(Exam).filter(Exam.id == registration.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ne postoji")
    
    if subject.professor_id != current_professor.id:
        raise HTTPException(
            status_code=403, 
            detail=f"Nemate dozvolu da menjate ocene za predmet '{subject.name}'. Samo profesor {subject.professor_id} može menjati ocene."
        )
    
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(registration, key, value)
    
    db.commit()
    db.refresh(registration)
    return registration

@app.delete("/delete/exam/{exam_id}")
def delete_exam(exam_id: int, db: Session = Depends(get_db), professor=Depends(get_current_professor)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Ispit ne postoji")
    
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Predmet ispita ne postoji")
    
    if subject.professor_id != professor.id:
        raise HTTPException(status_code=403, detail="Nemate pravo da obrišete ovaj ispit")
    
    db.delete(exam)
    db.commit()
    return {"success": True}

@app.get("/")
def root():
    return {
        "message": "School Management System API",
        "status": "online"
    }