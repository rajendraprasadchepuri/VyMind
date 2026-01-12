from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database_config import engine, Base
from backend.routers import products, auth, dashboard, pos, restaurant

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VyaparMind API", version="1.0.0")

@app.on_event("startup")
def startup_event():
    # ... (startup logic)
    from backend.database_config import SessionLocal
    from backend.models import core
    from backend import auth as auth_utils
    
    db = SessionLocal()
    try:
        # Check for demo account
        demo_id = "9676260340"
        demo_account = db.query(core.Account).filter(core.Account.id == demo_id).first()
        if not demo_account:
            demo_account = core.Account(id=demo_id, company_name="VyaparMind Demo Store", status="ACTIVE")
            db.add(demo_account)
            db.commit()
            
        # Check for admin user specifically for the demo account
        admin = db.query(core.User).filter(core.User.username == "admin", core.User.account_id == demo_id).first()
        if not admin:
            hashed_pwd = auth_utils.get_password_hash("admin123")
            admin = core.User(
                id="ADMIN_ID_DEMO",
                account_id=demo_id,
                username="admin",
                email="admin@vyaparmind.com",
                password_hash=hashed_pwd,
                role="super_admin"
            )
            db.add(admin)
            db.commit()
        else:
            # Upgrade legacy hash if detected
            if not admin.password_hash.startswith("$2b$"):
                admin.password_hash = auth_utils.get_password_hash("admin123")
                db.commit()
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(dashboard.router)
app.include_router(pos.router)
app.include_router(restaurant.router)
app.include_router(modules.router)

@app.middleware("http")
async def log_requests(request, call_next):
    import logging
    logger = logging.getLogger("uvicorn")
    logger.info(f"Incoming Request: {request.method} {request.url}")
    
    auth_header = request.headers.get("Authorization")
    if auth_header:
        logger.info(f"Auth Header: {auth_header[:15]}...")
    else:
        logger.info("Auth Header: MISSING")
        
    response = await call_next(request)
    logger.info(f"Response Status: {response.status_code}")
    return response

# CORS Configuration
# Adjust origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "VyaparMind API is running", "status": "online"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
