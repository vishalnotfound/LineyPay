from pydantic import BaseModel
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    balance: float

    class Config:
        orm_mode = True

# Wallet Schemas
class WalletAdd(BaseModel):
    amount: float

class WalletTransfer(BaseModel):
    to_username: str
    amount: float

class TransactionResponse(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    amount: float
    timestamp: datetime
    transaction_id: str

    class Config:
        orm_mode = True
