from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database_config import get_db
from backend.models import schemas, core
from backend.crud import base
from backend.auth import get_current_user

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

@router.get("", response_model=List[schemas.Product])
def read_products(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    products = base.get_products(db, account_id=current_user.account_id, skip=skip, limit=limit, search=search)
    return products

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    db_product = base.get_product(db, product_id=product_id, account_id=current_user.account_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.post("", response_model=schemas.Product)
def create_product(
    product: schemas.ProductBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    product_create = schemas.ProductCreate(**product.model_dump(), account_id=current_user.account_id)
    return base.create_product(db=db, product=product_create)

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: str,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    db_product = base.update_product(db, product_id, current_user.account_id, product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/{product_id}", response_model=schemas.Product)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    db_product = base.delete_product(db, product_id, current_user.account_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product
