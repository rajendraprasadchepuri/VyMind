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
