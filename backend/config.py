# config.py
"""
Konfiguracioni fajl za School Management System
Sadrži database URL, JWT secret key i druge konstante
"""

# Database konfiguracija
DATABASE_URL = "mysql+pymysql://root:@localhost:3004/School"
DATABASE_ROOT_URL = "mysql+pymysql://root:@localhost:3004/"
DATABASE_NAME = "School"

# JWT konfiguracija
SECRET_KEY = "school_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# CORS konfiguracija
CORS_ORIGINS = ["*"]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]