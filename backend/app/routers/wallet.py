# app/routers/wallet.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import crud, models
from app.db.database import get_db

router = APIRouter(prefix="/wallet", tags=["wallet"])

# Add money to user balance
@router.post("/add")
def add_money(user_id: int, amount: float, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = crud.add_money(db, user, amount)
    return {"user_id": updated_user.id, "balance": updated_user.balance}

# Transfer money from one user to another
@router.post("/transfer")
def transfer_money(from_user_id: int, to_user_id: int, amount: float, db: Session = Depends(get_db)):
    from_user = crud.get_user_by_id(db, from_user_id)
    to_user = crud.get_user_by_id(db, to_user_id)
    if not from_user or not to_user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        transaction = crud.transfer_money(db, from_user, to_user, amount)
        return {
            "transaction_id": transaction.transaction_id,
            "from_user_id": transaction.from_user_id,
            "to_user_id": transaction.to_user_id,
            "amount": transaction.amount
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get all transactions for a user
@router.get("/transactions/{user_id}")
def get_transactions(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    transactions = crud.get_transactions(db, user)
    return transactions
