from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from backend.database_config import get_db
from backend.models import schemas, core
from backend.crud import modules
from backend.auth import get_current_user

router = APIRouter(
    prefix="/modules",
    tags=["modules"],
)

# --- VendorTrust ---
@router.get("/suppliers", response_model=List[schemas.Supplier])
def read_suppliers(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_suppliers(db, current_user.account_id)

@router.post("/suppliers", response_model=schemas.Supplier)
def create_supplier(
    supplier: schemas.SupplierBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    supplier_create = schemas.SupplierCreate(**supplier.model_dump(), account_id=current_user.account_id)
    return modules.create_supplier(db, supplier_create)

@router.get("/purchase-orders", response_model=List[schemas.PurchaseOrder])
def read_pos(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_purchase_orders(db, current_user.account_id)

@router.post("/purchase-orders", response_model=schemas.PurchaseOrder)
def create_po(
    po: schemas.PurchaseOrderBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    po_create = schemas.PurchaseOrderCreate(**po.model_dump(), account_id=current_user.account_id)
    return modules.create_purchase_order(db, po_create)

# --- ShiftSmart ---
@router.get("/staff", response_model=List[schemas.Staff])
def read_staff(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_staff(db, current_user.account_id)

@router.post("/staff", response_model=schemas.Staff)
def create_staff(
    staff: schemas.StaffBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    staff_create = schemas.StaffCreate(**staff.model_dump(), account_id=current_user.account_id)
    return modules.create_staff(db, staff_create)

@router.get("/shifts/{staff_id}", response_model=List[schemas.Shift])
def read_shifts(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_shifts(db, staff_id)

@router.post("/shifts", response_model=schemas.Shift)
def create_shift(
    shift: schemas.ShiftBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.create_shift(db, shift)

# --- FreshFlow ---
@router.get("/batches", response_model=List[schemas.ProductBatch])
def read_batches(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_batches(db, current_user.account_id)

@router.post("/batches", response_model=schemas.ProductBatch)
def create_batch(
    batch: schemas.ProductBatchBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    batch_create = schemas.ProductBatchCreate(**batch.model_dump(), account_id=current_user.account_id)
    return modules.create_batch(db, batch_create)

# --- IsoBar ---
@router.get("/daily-context/{date_str}", response_model=schemas.DailyContext)
def read_daily_context(
    date_str: date,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    ctx = modules.get_daily_context(db, current_user.account_id, date_str)
    if not ctx:
        raise HTTPException(status_code=404, detail="No context for this date")
    return ctx

@router.post("/daily-context", response_model=schemas.DailyContext)
def set_daily_context(
    ctx: schemas.DailyContextBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    ctx_create = schemas.DailyContextCreate(**ctx.model_dump(), account_id=current_user.account_id)
    return modules.set_daily_context(db, ctx_create)

# --- StockSwap (B2B) ---
@router.get("/b2b-deals", response_model=List[schemas.B2BDeal])
def read_b2b_deals(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_b2b_deals(db, current_user.account_id)

@router.post("/b2b-deals", response_model=schemas.B2BDeal)
def create_b2b_deal(
    deal: schemas.B2BDealBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    deal_create = schemas.B2BDealCreate(**deal.model_dump(), account_id=current_user.account_id)
    return modules.create_b2b_deal(db, deal_create)

# --- CrowdStock ---
@router.get("/crowd-campaigns", response_model=List[schemas.CrowdCampaign])
def read_crowd_campaigns(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.get_crowd_campaigns(db, current_user.account_id)

@router.post("/crowd-campaigns", response_model=schemas.CrowdCampaign)
def create_crowd_campaign(
    camp: schemas.CrowdCampaignBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    camp_create = schemas.CrowdCampaignCreate(**camp.model_dump(), account_id=current_user.account_id)
    return modules.create_crowd_campaign(db, camp_create)

@router.post("/crowd-campaigns/{campaign_id}/vote")
def vote_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return modules.vote_crowd_campaign(db, campaign_id)
