from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import crud, database, models
from app import schemas
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router = APIRouter(prefix="/wallet", tags=["wallet"])

# Get current user from JWT
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = crud.get_user_by_username(db, username)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Get balance
@router.get("/balance")
def get_balance(current_user: models.User = Depends(get_current_user)):
    return {"balance": current_user.balance}

# Add money
@router.post("/add", response_model=schemas.UserResponse)
def add_money(wallet: schemas.WalletAdd, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return concurrency.safe_transaction(db, crud.add_money, current_user, wallet.amount)

# Transfer money
@router.post("/transfer", response_model=schemas.TransactionResponse)
def transfer_money(wallet: schemas.WalletTransfer, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    to_user = crud.get_user_by_username(db, wallet.to_username)
    if not to_user:
        raise HTTPException(status_code=404, detail="Recipient not found")
    try:
        transaction = concurrency.safe_transaction(db, crud.transfer_money, current_user, to_user, wallet.amount)
        return transaction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Transaction history
@router.get("/history", response_model=list[schemas.TransactionResponse])
def transaction_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_transactions(db, current_user)
