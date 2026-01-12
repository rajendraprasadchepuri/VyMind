from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime, date

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    account_id: Optional[str] = None

class LoginRequest(BaseModel):
    company_name: str
    username: str
    password: str

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    role: Optional[str] = "staff"

class UserCreate(UserBase):
    password: str
    account_id: str

class CompanyCreate(BaseModel):
    company_name: str
    username: str
    password: str
    email: EmailStr

class User(UserBase):
    id: str
    account_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ... (Previous schemas)
class AccountBase(BaseModel):
    company_name: str
    subscription_plan: Optional[str] = "Starter"
    status: Optional[str] = "ACTIVE"

class AccountCreate(AccountBase):
    id: str

class Account(AccountBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    price: float
    cost_price: float
    stock_quantity: Optional[int] = 0
    tax_rate: Optional[float] = 0.0
    science_tags: Optional[str] = None

class ProductCreate(ProductBase):
    id: Optional[str] = None
    account_id: str

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    tax_rate: Optional[float] = None
    science_tags: Optional[str] = None

class Product(ProductBase):
    id: str
    account_id: str
    updated_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = "Unknown"
    pincode: Optional[str] = "000000"
    loyalty_points: Optional[int] = 0

class CustomerCreate(CustomerBase):
    id: Optional[str] = None
    account_id: str

class Customer(CustomerBase):
    id: str
    account_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TransactionItemBase(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price_at_sale: float
    cost_at_sale: float

class TransactionBase(BaseModel):
    customer_id: Optional[str] = None
    total_amount: float
    total_profit: float
    payment_method: Optional[str] = "CASH"
    transaction_hash: Optional[str] = None
    points_redeemed: Optional[int] = 0

class TransactionCreate(TransactionBase):
    id: Optional[str] = None
    account_id: str
    items: List[TransactionItemBase]

class Transaction(TransactionBase):
    id: str
    account_id: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_revenue: float
    total_sales_count: int
    product_count: int
    low_stock_count: int
