from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from backend.models import core, schemas
from backend.crud.base import generate_unique_id

# --- VendorTrust CRUD ---
def get_suppliers(db: Session, account_id: str):
    return db.query(core.Supplier).filter(core.Supplier.account_id == account_id).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = core.Supplier(
        id=generate_unique_id(),
        account_id=supplier.account_id,
        name=supplier.name,
        contact_person=supplier.contact_person,
        phone=supplier.phone,
        category_specialty=supplier.category_specialty
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def get_purchase_orders(db: Session, account_id: str):
    return db.query(core.PurchaseOrder).filter(core.PurchaseOrder.account_id == account_id).all()

def create_purchase_order(db: Session, po: schemas.PurchaseOrderCreate):
    db_po = core.PurchaseOrder(
        id=generate_unique_id(),
        account_id=po.account_id,
        supplier_id=po.supplier_id,
        order_date=po.order_date,
        expected_date=po.expected_date,
        notes=po.notes
    )
    db.add(db_po)
    db.commit()
    db.refresh(db_po)
    return db_po

# --- ShiftSmart CRUD ---
def get_staff(db: Session, account_id: str):
    return db.query(core.Staff).filter(core.Staff.account_id == account_id).all()

def create_staff(db: Session, staff: schemas.StaffCreate):
    db_staff = core.Staff(
        id=generate_unique_id(),
        account_id=staff.account_id,
        name=staff.name,
        role=staff.role,
        hourly_rate=staff.hourly_rate
    )
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def get_shifts(db: Session, staff_id: str):
    return db.query(core.Shift).filter(core.Shift.staff_id == staff_id).all()

def create_shift(db: Session, shift: schemas.ShiftBase):
    db_shift = core.Shift(
        id=generate_unique_id(),
        staff_id=shift.staff_id,
        date=shift.date,
        slot=shift.slot
    )
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift

# --- FreshFlow CRUD ---
def create_batch(db: Session, batch: schemas.ProductBatchCreate):
    db_batch = core.ProductBatch(
        id=generate_unique_id(),
        account_id=batch.account_id,
        product_id=batch.product_id,
        batch_code=batch.batch_code,
        expiry_date=batch.expiry_date,
        quantity=batch.quantity,
        cost_price=batch.cost_price
    )
    db.add(db_batch)
    
    # Update Product Stock
    product = db.query(core.Product).filter(core.Product.id == batch.product_id).first()
    if product:
        product.stock_quantity += batch.quantity
        
    db.commit()
    db.refresh(db_batch)
    return db_batch

def get_batches(db: Session, account_id: str):
    return db.query(core.ProductBatch).filter(core.ProductBatch.account_id == account_id).all()

# --- Misc CRUD ---
def set_daily_context(db: Session, ctx: schemas.DailyContextCreate):
    db_ctx = db.query(core.DailyContext).filter(
        core.DailyContext.account_id == ctx.account_id,
        core.DailyContext.date == ctx.date
    ).first()
    
    if db_ctx:
        db_ctx.weather_tag = ctx.weather_tag
        db_ctx.event_tag = ctx.event_tag
        db_ctx.notes = ctx.notes
    else:
        db_ctx = core.DailyContext(
            account_id=ctx.account_id,
            date=ctx.date,
            weather_tag=ctx.weather_tag,
            event_tag=ctx.event_tag,
            notes=ctx.notes
        )
        db.add(db_ctx)
    db.commit()
    db.refresh(db_ctx)
    return db_ctx

def get_daily_context(db: Session, account_id: str, date: datetime.date):
    return db.query(core.DailyContext).filter(
        core.DailyContext.account_id == account_id,
        core.DailyContext.date == date
    ).first()
