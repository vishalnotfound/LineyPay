# app/db/crud.py
from sqlalchemy.orm import Session
from . import models
from passlib.context import CryptContext
import uuid

# Setup Passlib bcrypt context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =======================
# Password Hashing Utils
# =======================
def get_password_hash(password: str):
    """
    Hash a password safely using bcrypt.
    Truncates password to 72 characters due to bcrypt limitation.
    """
    truncated_password = password[:72]
    return pwd_context.hash(truncated_password)

def verify_password(plain_password: str, hashed_password: str):
    """
    Verify a password against the hashed version.
    Truncates input password to 72 chars for consistency.
    """
    return pwd_context.verify(plain_password[:72], hashed_password)

# =======================
# User CRUD Operations
# =======================
def create_user(db: Session, username: str, password: str):
    """
    Create a new user with hashed password.
    Initializes balance to 0.
    """
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.username == username).first()
    if existing_user:
        raise ValueError("User already exists")
    
    hashed_password = get_password_hash(password[:72])
    user = models.User(username=username, password=hashed_password, balance=0)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_username(db: Session, username: str):
    """
    Retrieve a user by their username.
    """
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(db: Session, user_id: int):
    """
    Retrieve a user by their ID.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticate a user by verifying username and password.
    """
    # Check if user exists
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise ValueError("User not found")
    
    # Verify the password
    if not verify_password(password, user.password):
        raise ValueError("Incorrect password")
    
    return user

# =======================
# Wallet Operations
# =======================
def add_money(db: Session, user: models.User, amount: float):
    """
    Add money to a user's wallet and update DB.
    """
    if amount <= 0:
        raise ValueError("Amount must be positive")
    user.balance += amount
    db.commit()
    db.refresh(user)
    return user

def transfer_money(db: Session, from_user: models.User, to_user: models.User, amount: float):
    """
    Transfer money between two users safely.
    Raises ValueError if insufficient balance.
    Creates a transaction record with unique ID.
    """
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if from_user.balance < amount:
        raise ValueError("Insufficient balance")
    
    # Deduct and add amounts
    from_user.balance -= amount
    to_user.balance += amount

    # Create transaction record
    transaction = models.Transaction(
        from_user_id=from_user.id,
        to_user_id=to_user.id,
        amount=amount,
        transaction_id=str(uuid.uuid4())
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

def get_transactions(db: Session, user: models.User):
    """
    Get all transactions related to the user (sent + received).
    """
    sent = db.query(models.Transaction).filter(models.Transaction.from_user_id == user.id).all()
    received = db.query(models.Transaction).filter(models.Transaction.to_user_id == user.id).all()
    # Combine sent and received transactions
    return sent + received
