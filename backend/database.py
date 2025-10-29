# database.py
"""
Database setup i session management
"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL, DATABASE_ROOT_URL, DATABASE_NAME

# Kreiranje baze ako ne postoji
engine_root = create_engine(DATABASE_ROOT_URL)
with engine_root.connect() as conn:
    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DATABASE_NAME}"))

# Glavni engine za aplikaciju
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base klasa za SQLAlchemy modele
Base = declarative_base()