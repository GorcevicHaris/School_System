# database.py
"""
Database konekcija i session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# Kreiraj SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Provera konekcije pre korišćenja
    pool_size=10,        # Broj konekcija u pool-u
    max_overflow=20      # Dodatne konekcije ako je potrebno
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base klasa za sve modele
Base = declarative_base()

# Dependency za FastAPI rute
def get_db():
    """
    Dependency function koja kreira database session
    Koristi se u FastAPI rutama sa Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test konekcije
def test_connection():
    """
    Testira database konekciju
    """
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()
            print(f"✅ Database konekcija uspešna!")
            print(f"📊 PostgreSQL verzija: {version[0]}")
            return True
    except Exception as e:
        print(f"❌ Greška pri konekciji: {e}")
        return False

if __name__ == "__main__":
    # Ako direktno pokreneš ovaj fajl, testiraj konekciju
    test_connection()