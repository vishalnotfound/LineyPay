from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import crud, database, models
from app import schemas
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

router = APIRouter(prefix="/auth", tags=["auth"])

# JWT utils
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Register
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        return crud.create_user(db, user.username, user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Login
@router.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        return crud.authenticate_user(db, user.username, user.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
