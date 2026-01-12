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

class RestaurantTableBase(BaseModel):
    table_number: str
    capacity: int = 4
    status: str = "AVAILABLE"
    zone: str = "Main Hall"
    x_position: int = 0
    y_position: int = 0

class RestaurantTableCreate(RestaurantTableBase):
    id: Optional[str] = None
    account_id: str

class RestaurantTable(RestaurantTableBase):
    id: str
    account_id: str
    current_order_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class KitchenOrderBase(BaseModel):
    items_json: str # JSON string of items
    status: str = "PENDING"

class KitchenOrderCreate(KitchenOrderBase):
    id: Optional[str] = None
    table_id: str
    account_id: str

class KitchenOrder(KitchenOrderBase):
    id: str
    account_id: str
    table_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- VendorTrust Schemas ---
class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    category_specialty: Optional[str] = None

class SupplierCreate(SupplierBase):
    id: Optional[str] = None
    account_id: str

class Supplier(SupplierBase):
    id: str
    account_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PurchaseOrderBase(BaseModel):
    supplier_id: str
    order_date: Optional[date] = None
    expected_date: Optional[date] = None
    received_date: Optional[date] = None
    status: str = "PENDING"
    notes: Optional[str] = None
    quality_rating: Optional[float] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    id: Optional[str] = None
    account_id: str

class PurchaseOrder(PurchaseOrderBase):
    id: str
    account_id: str
    model_config = ConfigDict(from_attributes=True)

# --- ShiftSmart Schemas ---
class StaffBase(BaseModel):
    name: str
    role: str
    hourly_rate: float

class StaffCreate(StaffBase):
    id: Optional[str] = None
    account_id: str

class Staff(StaffBase):
    id: str
    account_id: str
    joined_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ShiftBase(BaseModel):
    staff_id: str
    date: date
    slot: str

class ShiftCreate(ShiftBase):
    id: Optional[str] = None

class Shift(ShiftBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- FreshFlow Schemas ---
class ProductBatchBase(BaseModel):
    product_id: str
    batch_code: str
    expiry_date: date
    quantity: int
    cost_price: float

class ProductBatchCreate(ProductBatchBase):
    id: Optional[str] = None
    account_id: str

class ProductBatch(ProductBatchBase):
    id: str
    account_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Misc Schemas ---
class DailyContextBase(BaseModel):
    date: date
    weather_tag: Optional[str] = None
    event_tag: Optional[str] = None
    notes: Optional[str] = None

class DailyContextCreate(DailyContextBase):
    account_id: str

class DailyContext(DailyContextBase):
    account_id: str
    model_config = ConfigDict(from_attributes=True)

class B2BDealBase(BaseModel):
    store_name: str
    product_name: str
    quantity: int
    price_per_unit: float
    acc_phone: Optional[str] = None

class B2BDealCreate(B2BDealBase):
    id: Optional[str] = None
    account_id: str

class B2BDeal(B2BDealBase):
    id: str
    account_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CrowdCampaignBase(BaseModel):
    item_name: str
    description: Optional[str] = None
    votes_needed: int
    votes_current: int = 0
    price_est: float
    status: str = "ACTIVE"

class CrowdCampaignCreate(CrowdCampaignBase):
    id: Optional[str] = None
    account_id: str

class CrowdCampaign(CrowdCampaignBase):
    id: str
    account_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Settings & Analytics ---
class SettingBase(BaseModel):
    key: str
    value: str

class SettingCreate(SettingBase):
    account_id: str

class Setting(SettingBase):
    account_id: str
    model_config = ConfigDict(from_attributes=True)

class DemandPredictionRequest(BaseModel):
    weather: str
    event: str

class PredictionItem(BaseModel):
    product_name: str
    total_qty: int

class DemandPredictionResponse(BaseModel):
    context: str
    predictions: List[PredictionItem]

