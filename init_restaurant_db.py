"""
Quick script to initialize restaurant tables in the database
"""
from backend.database_config import SessionLocal, Base, engine
from backend.models import core
import uuid

# Create all tables
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Database tables created!")

# Add sample restaurant tables
db = SessionLocal()
try:
    # Check if tables already exist
    existing_tables = db.query(core.RestaurantTable).count()
    
    if existing_tables == 0:
        print("\nAdding sample restaurant tables...")
        
        # Demo account ID
        demo_account_id = "9676260340"
        
        sample_tables = [
            core.RestaurantTable(
                id=str(uuid.uuid4()),
                account_id=demo_account_id,
                table_number="T1",
                capacity=2,
                status="AVAILABLE",
                zone="Window Side",
                x_position=100,
                y_position=100
            ),
            core.RestaurantTable(
                id=str(uuid.uuid4()),
                account_id=demo_account_id,
                table_number="T2",
                capacity=4,
                status="AVAILABLE",
                zone="Center",
                x_position=300,
                y_position=150
            ),
            core.RestaurantTable(
                id=str(uuid.uuid4()),
                account_id=demo_account_id,
                table_number="T3",
                capacity=6,
                status="OCCUPIED",
                zone="VIP Section",
                x_position=500,
                y_position=200
            ),
        ]
        
        for table in sample_tables:
            db.add(table)
        
        db.commit()
        print(f"✅ Added {len(sample_tables)} sample tables!")
    else:
        print(f"\n✅ Database already has {existing_tables} tables!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()

print("\n" + "="*60)
print("Database initialization complete!")
print("="*60)
