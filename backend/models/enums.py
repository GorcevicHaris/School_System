# models/enums.py
"""
Enumeracije za tipove ispita i statuse
"""
import enum

class ExamType(str, enum.Enum):
    pismeni = "pismeni"
    usmeni = "usmeni"

class ExamStatus(str, enum.Enum):
    prijavljen = "prijavljen"
    polozio = "polozio"
    pao = "pao"