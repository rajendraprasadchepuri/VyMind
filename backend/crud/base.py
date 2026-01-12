from sqlalchemy.orm import Session
from backend.models import core, schemas
import secrets
import string

def generate_unique_id(length=16, numeric_only=False, prefix=''):
    if numeric_only:
        chars = string.digits
    else:
        chars = string.ascii_uppercase + string.digits
    gen_len = max(1, length - len(prefix))
    random_str = ''.join(secrets.choice(chars) for _ in range(gen_len))
    return f"{prefix}{random_str}"

# Product CRUD
def get_product(db: Session, product_id: str, account_id: str):
    return db.query(core.Product).filter(core.Product.id == product_id, core.Product.account_id == account_id).first()

def get_products(db: Session, account_id: str, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(core.Product).filter(core.Product.account_id == account_id)
    if search:
        query = query.filter(core.Product.name.ilike(f"%{search}%") | core.Product.category.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = core.Product(**product.model_dump())
    if not db_product.id:
        db_product.id = generate_unique_id(16)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: str, account_id: str, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id, account_id)
    if db_product:
        # Use exclude_unset=True to only update provided fields
        update_data = product_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str, account_id: str):
    db_product = get_product(db, product_id, account_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

# Customer CRUD
def get_customer(db: Session, customer_id: str, account_id: str):
    return db.query(core.Customer).filter(core.Customer.id == customer_id, core.Customer.account_id == account_id).first()

def get_customers(db: Session, account_id: str, skip: int = 0, limit: int = 100):
    return db.query(core.Customer).filter(core.Customer.account_id == account_id).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = core.Customer(**customer.model_dump())
    if not db_customer.id:
        db_customer.id = generate_unique_id(16, numeric_only=True)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

# Restaurant CRUD
def get_tables(db: Session, account_id: str):
    return db.query(core.RestaurantTable).filter(core.RestaurantTable.account_id == account_id).all()

def create_table(db: Session, table: schemas.RestaurantTableCreate):
    db_table = core.RestaurantTable(**table.model_dump())
    if not db_table.id:
        db_table.id = generate_unique_id(8, prefix="TBL_")
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

def update_table_position(db: Session, table_id: str, x: int, y: int, account_id: str):
    table = db.query(core.RestaurantTable).filter(core.RestaurantTable.id == table_id, core.RestaurantTable.account_id == account_id).first()
    if table:
        table.x_position = x
        table.y_position = y
        db.commit()
        db.refresh(table)
    return table

def create_kitchen_order(db: Session, order: schemas.KitchenOrderCreate):
    db_order = core.KitchenOrder(**order.model_dump())
    if not db_order.id:
        db_order.id = generate_unique_id(12, prefix="KOT_")
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_active_orders(db: Session, account_id: str):
    return db.query(core.KitchenOrder).filter(
        core.KitchenOrder.account_id == account_id, 
        core.KitchenOrder.status.in_(["PENDING", "PREPARING", "READY"])
    ).all()
