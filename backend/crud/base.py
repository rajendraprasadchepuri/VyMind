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

def update_product(db: Session, product_id: str, account_id: str, product_update: schemas.ProductBase):
    db_product = get_product(db, product_id, account_id)
    if db_product:
        for key, value in product_update.model_dump().items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
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
