# test_connection.py
"""
Test skripta za proveru database konekcije i tabela
Pokreni sa: python test_connection.py
"""
from sqlalchemy import create_engine, text
from config import DATABASE_URL
import sys

def test_database():
    """Testira konekciju i prikazuje dostupne tabele"""
    
    print("=" * 60)
    print("🔍 TESTIRANJE NEON POSTGRESQL KONEKCIJE")
    print("=" * 60)
    
    try:
        # Kreiraj engine
        print("\n⏳ Povezivanje sa bazom...")
        engine = create_engine(DATABASE_URL)
        
        # Testiraj konekciju
        with engine.connect() as connection:
            # PostgreSQL verzija
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()
            print(f"\n✅ Uspešna konekcija!")
            print(f"📊 PostgreSQL verzija: {version[0][:50]}...")
            
            # Proveri tabele
            print("\n" + "=" * 60)
            print("📋 DOSTUPNE TABELE:")
            print("=" * 60)
            
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = result.fetchall()
            
            if not tables:
                print("⚠️  Nema tabela u bazi! Pokreni SQL skriptu prvo.")
                return False
            
            print(f"\nPronadjeno tabela: {len(tables)}\n")
            
            # Za svaku tabelu, prikaži broj redova
            for table in tables:
                table_name = table[0]
                count_result = connection.execute(
                    text(f"SELECT COUNT(*) FROM {table_name}")
                )
                count = count_result.fetchone()[0]
                print(f"  ✓ {table_name:<25} ({count} redova)")
            
            # Proveri VIEW
            print("\n" + "=" * 60)
            print("👁️  VIEWS:")
            print("=" * 60)
            
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.views 
                WHERE table_schema = 'public'
            """))
            
            views = result.fetchall()
            if views:
                for view in views:
                    print(f"  ✓ {view[0]}")
            else:
                print("  Nema VIEW-ova")
            
            print("\n" + "=" * 60)
            print("✅ SVE JE SPREMNO ZA RAD!")
            print("=" * 60)
            return True
            
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ GREŠKA PRI KONEKCIJI:")
        print("=" * 60)
        print(f"\n{str(e)}\n")
        print("🔧 PROVERI:")
        print("  1. Da li je .env fajl kreiran?")
        print("  2. Da li je DATABASE_URL ispravan?")
        print("  3. Da li si pokrenuo SQL skriptu u Neon-u?")
        print("  4. Da li imaš psycopg2-binary instaliran?")
        print("\n" + "=" * 60)
        return False

if __name__ == "__main__":
    success = test_database()
    sys.exit(0 if success else 1)