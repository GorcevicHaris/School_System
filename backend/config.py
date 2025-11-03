# config.py
"""
Konfiguracioni fajl za School Management System
Sadrži database URL, JWT secret key i druge konstante
"""
import os
from dotenv import load_dotenv

# Učitaj .env fajl
load_dotenv()

# Database konfiguracija - PostgreSQL (Neon)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL nije definisan u .env fajlu!")

# JWT konfiguracija
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_for_dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Server konfiguracija
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

# CORS konfiguracija
CORS_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"  # Za development - ukloni za production!
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]

# Environment
ENV = os.getenv("ENV", "development")
DEBUG = ENV == "development"

# Info
print(f"🔧 Environment: {ENV}")
print(f"🗄️  Database: {'Connected' if DATABASE_URL else 'Not configured'}")