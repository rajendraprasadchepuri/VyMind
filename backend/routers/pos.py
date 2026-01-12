from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database_config import get_db
from backend.models import schemas, core
from backend.auth import get_current_user
from backend.crud import base as crud_base
from datetime import datetime

router = APIRouter(
    prefix="/pos",
    tags=["pos"],
)

@router.post("/checkout", response_model=schemas.Transaction)
def process_checkout(
    transaction_data: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    aid = current_user.account_id
    
    # Validation loop
    total_profit = 0.0
    db_items = []
    
    for item in transaction_data.items:
        product = db.query(core.Product).filter(
            core.Product.id == item.product_id, 
            core.Product.account_id == aid
        ).first()
        
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_name} not found")
            
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
            
        # Deduct Stock
        product.stock_quantity -= item.quantity
        
        # Calculate Profit
        # Profit = (Sale Price - Cost Price) * Qty
        profit = (item.price_at_sale - product.cost_price) * item.quantity
        total_profit += profit
        
        # Create Item Record
        db_item = core.TransactionItem(
            id=crud_base.generate_unique_id(16),
            product_id=product.id,
            product_name=product.name,
            quantity=item.quantity,
            price_at_sale=item.price_at_sale,
            cost_at_sale=product.cost_price
        )
        db_items.append(db_item)

    # Create Transaction Record
    tx_id = crud_base.generate_unique_id(16)
    new_tx = core.Transaction(
        id=tx_id,
        account_id=aid,
        customer_id=transaction_data.customer_id,
        total_amount=transaction_data.total_amount,
        total_profit=total_profit,
        payment_method=transaction_data.payment_method,
        points_redeemed=transaction_data.points_redeemed,
        timestamp=datetime.utcnow()
    )
    
    db.add(new_tx)
    db.flush() # flush to get ID
    
    for db_item in db_items:
        db_item.transaction_id = new_tx.id
        db.add(db_item)
        
    db.commit()
    db.refresh(new_tx)
    return new_tx
