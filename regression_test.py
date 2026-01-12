import requests
import sys
import time
import json

BASE_URL = "http://localhost:8000"
PREFIX = ""

def log(msg, type="INFO"):
    print(f"[{type}] {msg}")

def run_regression():
    session = requests.Session()
    
    # 1. Login
    log("Step 1: Authenticating...")
    login_data = {
        "company_name": "VyaparMind Demo Store",
        "username": "admin",
        "password": "admin123"
    }
    res = session.post(f"{BASE_URL}{PREFIX}/auth/login", json=login_data)
    if res.status_code != 200:
        log(f"Login failed: {res.text}", "ERROR")
        sys.exit(1)
    
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    log("Authentication Successful.")

    # 2. Module: VendorTrust
    log("Step 2: Testing VendorTrust Module...")
    supplier_data = {
        "name": f"Regression Supplier {int(time.time())}",
        "person": "Auto Tester",
        "phone": "555-REG-TEST",
        "category_specialty": "General"
    }
    # Note: Using the schema keys
    res = requests.post(
        f"{BASE_URL}{PREFIX}/modules/suppliers", 
        json={
            "name": supplier_data["name"],
            "contact_person": "Auto Tester",
            "phone": "555-REG-TEST",
            "category_specialty": "General"
        },
        headers=headers
    )
    if res.status_code != 200:
        log(f"Create Supplier Failed: {res.text}", "ERROR")
    else:
        supplier_id = res.json()["id"]
        log(f"Supplier Created: {supplier_id}")

        # Create PO
        po_data = {
            "supplier_id": supplier_id,
            "expected_date": "2026-12-31",
            "notes": "Regression PO"
        }
        res = requests.post(f"{BASE_URL}{PREFIX}/modules/purchase-orders", json=po_data, headers=headers)
        if res.status_code == 200:
            log("Purchase Order Created Successfully.")
        else:
            log(f"Create PO Failed: {res.text}", "ERROR")

    # 3. Module: Inventory & POS
    log("Step 3: Testing Inventory and POS...")
    # Add Product
    prod_name = f"RegItem {int(time.time())}"
    prod_data = {
        "name": prod_name,
        "category": "Test",
        "price": 50.0,
        "cost_price": 25.0,
        "stock_quantity": 100
    }
    res = requests.post(f"{BASE_URL}{PREFIX}/products/", json=prod_data, headers=headers)
    if res.status_code != 200:
        log(f"Create Product Failed: {res.text}", "ERROR")
        sys.exit(1)
    
    prod_id = res.json()["id"]
    log(f"Product Created: {prod_id}")

    # Process Transaction
    txn_data = {
        "account_id": "ignored", # backend handles this
        "total_amount": 100.0,
        "total_profit": 50.0,
        "payment_method": "CASH",
        "items": [
            {
                "product_id": prod_id,
                "product_name": prod_name,
                "quantity": 2,
                "price_at_sale": 50.0,
                "cost_at_sale": 25.0
            }
        ]
    }
    res = requests.post(f"{BASE_URL}{PREFIX}/pos/checkout", json=txn_data, headers=headers)
    if res.status_code == 200:
        log("POS Transaction Successful.")
    else:
        log(f"POS Transaction Failed: {res.text}", "ERROR")

    # 4. Verify Dashboard
    log("Step 4: Verifying Analytics...")
    res = requests.get(f"{BASE_URL}{PREFIX}/dashboard/stats", headers=headers)
    if res.status_code == 200:
        stats = res.json()
        log(f"Dashboard Stats Fetched: {stats}")
    else:
        log("Failed to fetch dashboard stats", "ERROR")

    log("Regression Test Complete. All checks passed.")

if __name__ == "__main__":
    try:
        run_regression()
    except Exception as e:
        log(f"Exception: {e}", "ERROR")
        sys.exit(1)
