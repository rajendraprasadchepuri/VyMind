from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database_config import get_db
from backend.models import schemas, core
from backend.crud import modules, base as crud_base
from backend.auth import get_current_user
from backend import auth as auth_utils

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

# --- Settings ---
@router.get("", response_model=List[schemas.Setting])
def read_settings(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_settings(db, current_user.account_id)

@router.put("", response_model=schemas.Setting)
def update_setting(
    setting: schemas.SettingBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    # Only Admin or Store Manager should do this usually
    if current_user.role not in ['admin', 'super_admin', 'manager']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    s_create = schemas.SettingCreate(
        key=setting.key,
        value=setting.value,
        account_id=current_user.account_id
    )
    return modules.update_setting(db, s_create)

# --- Analytics ---
@router.post("/predict", response_model=schemas.DemandPredictionResponse)
def predict_demand(
    request: schemas.DemandPredictionRequest,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    results = modules.analyze_demand(db, current_user.account_id, request.weather, request.event)
    return {
        "context": f"{request.weather} + {request.event}",
        "predictions": results
    }

# --- User Management (Admin Only) ---
@router.get("/users", response_model=List[schemas.User])
def list_users(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return db.query(core.User).filter(core.User.account_id == current_user.account_id).all()

@router.post("/users", response_model=schemas.User)
def create_user_admin(
    user_req: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")

    return crud_base.create_user(db, user_req)

@router.delete("/users/{username}")
def delete_user(
    username: str,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Prevent self-deletion
    if username == current_user.username:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    user_to_delete = db.query(core.User).filter(
        core.User.account_id == current_user.account_id,
        core.User.username == username
    ).first()
    
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user_to_delete)
    db.commit()
    return {"message": "User deleted"}
