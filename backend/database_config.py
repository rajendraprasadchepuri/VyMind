import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_TYPE = os.getenv("DB_TYPE", "SQLITE")

# Database URL construction
if DB_TYPE == "POSTGRES":
    PG_HOST = os.getenv("PGHOST", "localhost")
    PG_PORT = os.getenv("PGPORT", "5432")
    PG_NAME = os.getenv("PGDATABASE", "vyaparmind")
    PG_USER = os.getenv("PGUSER", "postgres")
    PG_PASS = os.getenv("PGPASSWORD", "postgres")
    SQLALCHEMY_DATABASE_URL = f"postgresql://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_NAME}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    # SQLite
    SQLITE_DB = os.getenv("SQLITE_DB", "retail_supply_chain.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///./{SQLITE_DB}"
    # check_same_thread=False is needed for SQLite with FastAPI
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
