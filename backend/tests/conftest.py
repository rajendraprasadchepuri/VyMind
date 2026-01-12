import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database_config import Base, get_db

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # SEED DATA for Tests
    db = TestingSessionLocal()
    from backend.models import core
    from backend import auth as auth_utils
    
    # 1. Create Account
    demo_id = "9676260340"
    account = core.Account(id=demo_id, company_name="VyaparMind Demo Store", status="ACTIVE")
    db.add(account)
    
    # 2. Create Admin
    hashed_pwd = auth_utils.get_password_hash("admin123")
    admin = core.User(
        id="ADMIN_ID_DEMO",
        account_id=demo_id,
        username="admin",
        email="admin@vyaparmind.com",
        password_hash=hashed_pwd,
        role="super_admin"
    )
    db.add(admin)
    db.commit()
    db.close()
    
    with TestClient(app) as c:
        yield c
        
    # Drop tables
    Base.metadata.drop_all(bind=engine)
