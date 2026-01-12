from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Date, Text, UniqueConstraint
from sqlalchemy.sql import func
from backend.database_config import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True)
    company_name = Column(String, nullable=False)
    subscription_plan = Column(String, default="Starter")
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, server_default=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String)
    price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    tax_rate = Column(Float, default=0.0)
    science_tags = Column(String)
    updated_at = Column(DateTime, onupdate=func.now())
    created_at = Column(DateTime, server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), index=True)
    total_amount = Column(Float, nullable=False)
    total_profit = Column(Float, nullable=False)
    payment_method = Column(String, default="CASH")
    transaction_hash = Column(String)
    points_redeemed = Column(Integer, default=0)

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id = Column(String, primary_key=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), index=True)
    product_id = Column(String, ForeignKey("products.id"))
    product_name = Column(String)
    quantity = Column(Integer)
    price_at_sale = Column(Float)
    cost_at_sale = Column(Float)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    city = Column(String, default="Unknown")
    pincode = Column(String, default="000000")
    loyalty_points = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    username = Column(String, nullable=False)
    email = Column(String)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin")
    permissions = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint('account_id', 'username', name='_account_username_uc'),)

class Setting(Base):
    __tablename__ = "settings"

    account_id = Column(String, ForeignKey("accounts.id"), primary_key=True)
    key = Column(String, primary_key=True)
    value = Column(String)

    __table_args__ = (UniqueConstraint('account_id', 'key', name='_account_key_uc'),)

class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    table_number = Column(String, nullable=False)
    capacity = Column(Integer, default=4)
    status = Column(String, default="AVAILABLE") # AVAILABLE, OCCUPIED, RESERVED
    zone = Column(String, default="Main Hall")
    x_position = Column(Integer, default=0)
    y_position = Column(Integer, default=0)
    current_order_id = Column(String, nullable=True)

class KitchenOrder(Base):
    __tablename__ = "kitchen_orders"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    table_id = Column(String, ForeignKey("restaurant_tables.id"))
    items_json = Column(Text) # Storing list of items as JSON for simplicity in this demo
    status = Column(String, default="PENDING") # PENDING, PREPARING, READY, SERVED
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    name = Column(String)
    contact_person = Column(String)
    phone = Column(String)
    category_specialty = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    order_date = Column(Date)
    expected_date = Column(Date)
    received_date = Column(Date)
    status = Column(String, default="PENDING")
    quality_rating = Column(Float)
    notes = Column(Text)

class Staff(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    name = Column(String)
    role = Column(String)
    hourly_rate = Column(Float)
    joined_at = Column(DateTime, server_default=func.now())

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(String, primary_key=True)
    staff_id = Column(String, ForeignKey("staff.id"), index=True)
    date = Column(Date)
    slot = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class ProductBatch(Base):
    __tablename__ = "product_batches"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    product_id = Column(String, ForeignKey("products.id"), index=True)
    batch_code = Column(String)
    expiry_date = Column(Date, index=True)
    quantity = Column(Integer)
    cost_price = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

class DailyContext(Base):
    __tablename__ = "daily_context"

    account_id = Column(String, ForeignKey("accounts.id"), primary_key=True)
    date = Column(Date, primary_key=True)
    weather_tag = Column(String)
    event_tag = Column(String)
    notes = Column(Text)

class B2BDeal(Base):
    __tablename__ = "b2b_deals"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    store_name = Column(String)
    product_name = Column(String)
    quantity = Column(Integer)
    price_per_unit = Column(Float)
    acc_phone = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class CrowdCampaign(Base):
    __tablename__ = "crowd_campaigns"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), index=True)
    item_name = Column(String)
    description = Column(Text)
    votes_needed = Column(Integer)
    votes_current = Column(Integer, default=0)
    price_est = Column(Float)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, server_default=func.now())
