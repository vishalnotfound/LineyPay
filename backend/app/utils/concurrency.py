from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

def safe_transaction(db: Session, func, *args, **kwargs):
    """
    Wrapper to run DB operations safely with commit/rollback
    """
    try:
        result = func(*args, **kwargs)
        db.commit()
        return result
    except SQLAlchemyError as e:
        db.rollback()
        raise e
