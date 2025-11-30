from fastapi import FastAPI
from app.db.database import Base, engine
from app.routers import users, transactions, wallet
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:5500",  # if you open your HTML with Live Server
    "http://127.0.0.1",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables in DB
Base.metadata.create_all(bind=engine)



# Routers
app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(wallet.router)


@app.get("/")
def root():
    return {
        "This is a backend app, working fine. Made by Vishal Verma."
    }