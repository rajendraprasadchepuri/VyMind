from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.database_config import get_db
from backend.models import schemas, core
from backend.auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    aid = current_user.account_id
    
    # Total Revenue
    revenue = db.query(func.sum(core.Transaction.total_amount)).filter(core.Transaction.account_id == aid).scalar() or 0.0
    
    # Total Sales Count
    sales_count = db.query(core.Transaction).filter(core.Transaction.account_id == aid).count()
    
    # Product Count
    product_count = db.query(core.Product).filter(core.Product.account_id == aid).count()
    
    # Low Stock (e.g., < 10)
    low_stock = db.query(core.Product).filter(
        core.Product.account_id == aid, 
        core.Product.stock_quantity < 10
    ).count()
    
    return {
        "total_revenue": revenue,
        "total_sales_count": sales_count,
        "product_count": product_count,
        "low_stock_count": low_stock
    }

@router.get("/recent-transactions", response_model=List[schemas.Transaction])
def get_recent_transactions(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    txs = db.query(core.Transaction).filter(core.Transaction.account_id == current_user.account_id)\
        .order_by(core.Transaction.timestamp.desc())\
        .limit(limit).all()
    return txs
