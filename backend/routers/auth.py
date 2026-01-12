from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database_config import get_db
from backend.models import core, schemas
from backend import auth as auth_utils
from backend.crud import base as crud_base

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Legacy match: Username + Password + Company Name
    user = db.query(core.User).join(core.Account).filter(
        core.User.username == request.username,
        core.Account.company_name == request.company_name
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, password, or company name",
        )
    
    if not auth_utils.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, password, or company name",
        )
    
    # Check account status
    account = db.query(core.Account).filter(core.Account.id == user.account_id).first()
    if account.status == 'PENDING':
        raise HTTPException(status_code=403, detail="Account pending approval")
    if account.status != 'ACTIVE':
        raise HTTPException(status_code=403, detail="Account is suspended")

    access_token = auth_utils.create_access_token(
        data={"sub": user.username, "account_id": user.account_id, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", response_model=schemas.Account)
def signup(request: schemas.CompanyCreate, db: Session = Depends(get_db)):
    # Check if company exists
    existing_acc = db.query(core.Account).filter(core.Account.company_name == request.company_name).first()
    if existing_acc:
        raise HTTPException(status_code=400, detail="Company name already exists")
    
    # Create Account
    new_acc_id = crud_base.generate_unique_id(16)
    new_account = core.Account(
        id=new_acc_id,
        company_name=request.company_name,
        status='PENDING'
    )
    db.add(new_account)
    
    # Create Admin User
    new_user_id = crud_base.generate_unique_id(16)
    hashed_pwd = auth_utils.get_password_hash(request.password)
    new_user = core.User(
        id=new_user_id,
        account_id=new_acc_id,
        username=request.username,
        email=request.email,
        password_hash=hashed_pwd,
        role='admin'
    )
    db.add(new_user)
    
    db.commit()
    db.refresh(new_account)
    return new_account
