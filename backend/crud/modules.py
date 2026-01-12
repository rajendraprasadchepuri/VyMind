from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from backend.models import core, schemas
from backend.crud.base import generate_unique_id
from sqlalchemy import func

# --- Settings ---
def get_settings(db: Session, account_id: str):
    return db.query(core.Setting).filter(core.Setting.account_id == account_id).all()

def update_setting(db: Session, setting: schemas.SettingCreate):
    db_setting = db.query(core.Setting).filter(
        core.Setting.account_id == setting.account_id,
        core.Setting.key == setting.key
    ).first()
    
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = core.Setting(
            account_id=setting.account_id,
            key=setting.key,
            value=setting.value
        )
        db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

# --- Analytics ---
def analyze_demand(db: Session, account_id: str, weather: str, event: str):
    # 1. Find dates with matching context
    matching_dates = db.query(core.DailyContext.date).filter(
        core.DailyContext.account_id == account_id,
        core.DailyContext.weather_tag == weather,
        core.DailyContext.event_tag == event
    ).all()
    
    date_list = [d[0] for d in matching_dates]
    
    if not date_list:
        return []
        
    # 2. Sum sales for those dates
    # JOIN Transaction -> TransactionItem
    # Filter where Transaction.timestamp.date() IN date_list
    # Note: timestamp is DateTime, we cast to Date
    
    results = db.query(
        core.TransactionItem.product_name,
        func.sum(core.TransactionItem.quantity).label("total_qty")
    ).join(core.Transaction).filter(
        core.Transaction.account_id == account_id,
        func.date(core.Transaction.timestamp).in_(date_list)
    ).group_by(core.TransactionItem.product_name).order_by(func.sum(core.TransactionItem.quantity).desc()).limit(5).all()
    
    return [{"product_name": r[0], "total_qty": r[1]} for r in results]

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

# --- StockSwap (B2B) ---
def get_b2b_deals(db: Session, account_id: str):
    return db.query(core.B2BDeal).filter(core.B2BDeal.account_id == account_id).all()

def create_b2b_deal(db: Session, deal: schemas.B2BDealCreate):
    db_deal = core.B2BDeal(
        id=generate_unique_id(),
        account_id=deal.account_id,
        store_name=deal.store_name,
        product_name=deal.product_name,
        quantity=deal.quantity,
        price_per_unit=deal.price_per_unit,
        acc_phone=deal.acc_phone
    )
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal

# --- CrowdStock ---
def get_crowd_campaigns(db: Session, account_id: str):
    return db.query(core.CrowdCampaign).filter(core.CrowdCampaign.account_id == account_id).all()

def create_crowd_campaign(db: Session, camp: schemas.CrowdCampaignCreate):
    db_camp = core.CrowdCampaign(
        id=generate_unique_id(),
        account_id=camp.account_id,
        item_name=camp.item_name,
        description=camp.description,
        votes_needed=camp.votes_needed,
        price_est=camp.price_est,
        status="ACTIVE"
    )
    db.add(db_camp)
    db.commit()
    db.refresh(db_camp)
    return db_camp

def vote_crowd_campaign(db: Session, campaign_id: str):
    camp = db.query(core.CrowdCampaign).filter(core.CrowdCampaign.id == campaign_id).first()
    if camp:
        camp.votes_current += 1
        db.commit()
        db.refresh(camp)
    return camp

# --- VoiceAudit ---
def get_voice_logs(db: Session, account_id: str):
    return db.query(core.VoiceLog).filter(core.VoiceLog.account_id == account_id).order_by(core.VoiceLog.created_at.desc()).all()

def create_voice_log(db: Session, log: schemas.VoiceLogCreate):
    db_log = core.VoiceLog(
        id=generate_unique_id(),
        account_id=log.account_id,
        transcript=log.transcript,
        action_extracted=log.action_extracted,
        confidence_score=log.confidence_score
    )
    db.refresh(db_log)
    return db_log

# --- ChurnGuard ---
def get_churn_risks(db: Session, account_id: str):
    customers = db.query(core.Customer).filter(core.Customer.account_id == account_id).all()
    results = []
    today = datetime.now().date()
    
    for c in customers:
        last_txn = db.query(core.Transaction).filter(
            core.Transaction.customer_id == c.id
        ).order_by(core.Transaction.timestamp.desc()).first()
        
        last_date = last_txn.timestamp.date() if last_txn else None
        total_spend = db.query(func.sum(core.Transaction.total_amount)).filter(
            core.Transaction.customer_id == c.id
        ).scalar() or 0.0
        
        days_since = 999
        risk = "Non-Active"
        
        if last_date:
            days_since = (today - last_date).days
            if days_since > 90: risk = "Critical"
            elif days_since > 60: risk = "High"
            elif days_since > 30: risk = "Medium"
            else: risk = "Low"
            
        results.append(schemas.ChurnRisk(
            customer_id=c.id,
            customer_name=c.name,
            last_visit=last_date,
            days_since=days_since,
            total_spend=total_spend,
            risk_level=risk
        ))
        
        
    return sorted(results, key=lambda x: x.days_since, reverse=True)

# --- GeoViz ---
CITY_COORDS = {
    "New York": (40.7128, -74.0060),
    "Los Angeles": (34.0522, -118.2437),
    "Chicago": (41.8781, -87.6298),
    "Houston": (29.7604, -95.3698),
    "Phoenix": (33.4484, -112.0740),
    "Philadelphia": (39.9526, -75.1652),
    "San Antonio": (29.4241, -98.4936),
    "San Diego": (32.7157, -117.1611),
    "Dallas": (32.7767, -96.7970),
    "San Jose": (37.3382, -121.8863),
    "Unknown": (39.8283, -98.5795) # Center of US approx
}

def get_geo_data(db: Session, account_id: str):
    # Aggregate sales by City from Customers joining Transactions? 
    # Or just Customer count by City? Let's do Sales Volume by City.
    
    cities = db.query(
        core.Customer.city, 
        func.sum(core.Transaction.total_amount).label("total_sales")
    ).join(core.Transaction).filter(
        core.Transaction.account_id == account_id
    ).group_by(core.Customer.city).all()
    
    results = []
    for city, volume in cities:
        city_norm = city.strip() if city else "Unknown"
        lat, lng = CITY_COORDS.get(city_norm, (39.8283 + (len(city_norm)*0.1), -98.5795)) # Pseudo-random fallback
        
        results.append(schemas.GeoPoint(
            city=city_norm,
            lat=lat,
            lng=lng,
            value=volume or 0.0
        ))
    return results

# --- ShelfSense ---
def get_shelf_insights(db: Session, account_id: str):
    insights = []
    
    # 1. Expiry Risk (Batches expiring in next 30 days)
    today = datetime.now().date()
    expiry_threshold = today + __import__("datetime").timedelta(days=30)
    
    risky_batches = db.query(core.ProductBatch).filter(
        core.ProductBatch.account_id == account_id,
        core.ProductBatch.expiry_date <= expiry_threshold,
        core.ProductBatch.expiry_date >= today,
        core.ProductBatch.quantity > 0
    ).all()
    
    for b in risky_batches:
        prod = db.query(core.Product).filter(core.Product.id == b.product_id).first()
        days_left = (b.expiry_date - today).days
        insights.append(schemas.ShelfInsight(
            product_id=b.product_id,
            product_name=prod.name if prod else "Unknown",
            insight_type="EXPIRY_RISK",
            details=f"Batch {b.batch_code} expires in {days_left} days",
            metric=float(days_left),
            severity="High" if days_left < 7 else "Medium"
        ))
        
    # 2. Stagnant Stock (Products with stock > 0 but no sales in 30 days)
    # Simplified check: Just find high stock items for now to demonstrate UI
    
    stagnant_prods = db.query(core.Product).filter(
        core.Product.account_id == account_id,
        core.Product.stock_quantity > 50
    ).limit(5).all()
    
    for p in stagnant_prods:
        insights.append(schemas.ShelfInsight(
            product_id=p.id,
            product_name=p.name,
            insight_type="STAGNANT_STOCK",
            details="High stock level with low recent velocity",
            metric=float(p.stock_quantity),
            severity="Low"
        ))
        
    return insights

# --- Online Ordering ---
def get_online_orders(db: Session, account_id: str):
    # Simulating external orders since we don't have a customer app in this demo
    # In production, this would query a real 'orders' table with source='ONLINE'
    
    mock_orders = [
        {
            "order_id": "ORD-9928",
            "customer_name": "Aditi Sharma",
            "address": "Flat 402, Sunshine Apts, MG Road",
            "items_summary": "2x Basmati Rice, 1x Oil",
            "total_amount": 1250.0,
            "status": "NEW",
            "payment_mode": "UPI",
            "time_elapsed_mins": 5
        },
        {
            "order_id": "ORD-9929",
            "customer_name": "Rajesh Kumar",
            "address": "Villa 12, Green Valley",
            "items_summary": "1x Detergent, 5x Soap",
            "total_amount": 450.0,
            "status": "ACCEPTED",
            "payment_mode": "COD",
            "time_elapsed_mins": 18
        }
    ]
    
    results = []
    for m in mock_orders:
        results.append(schemas.OnlineOrder(**m))
        
    return results
