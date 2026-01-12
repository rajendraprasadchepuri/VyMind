import requests

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
PRODUCTS_URL = f"{BASE_URL}/products/"

def login():
    try:
        response = requests.post(LOGIN_URL, json={
            "company_name": "VyaparMind Demo Store",
            "username": "admin",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        print(f"Login failed: {response.text}")
        return None
    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def seed_products(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    products = [
        {"name": "Organic Milk", "category": "Dairy", "price": 4.50, "cost_price": 2.50, "stock_quantity": 50},
        {"name": "Whole Wheat Bread", "category": "Bakery", "price": 3.00, "cost_price": 1.20, "stock_quantity": 30},
        {"name": "Free Range Eggs", "category": "Dairy", "price": 5.00, "cost_price": 3.00, "stock_quantity": 40},
        {"name": "Apple (Fuji)", "category": "Produce", "price": 0.80, "cost_price": 0.40, "stock_quantity": 100},
        {"name": "Banana", "category": "Produce", "price": 0.50, "cost_price": 0.20, "stock_quantity": 150},
        {"name": "Orange Juice", "category": "Beverages", "price": 6.00, "cost_price": 3.50, "stock_quantity": 25},
        {"name": "Cheddar Cheese", "category": "Dairy", "price": 7.50, "cost_price": 4.00, "stock_quantity": 20},
        {"name": "Coffee Beans", "category": "Pantry", "price": 12.00, "cost_price": 7.00, "stock_quantity": 15},
    ]
    
    for p in products:
        try:
            res = requests.post(PRODUCTS_URL, json=p, headers=headers)
            if res.status_code == 200:
                print(f"Created: {p['name']}")
            else:
                print(f"Failed to create {p['name']}: {res.text}")
        except Exception as e:
             print(f"Error creating {p['name']}: {e}")

if __name__ == "__main__":
    token = login()
    if token:
        seed_products(token)
    else:
        print("Detailed Login Debug:")
        # Try a direct check
        try:
            import json
            print("Payload:", json.dumps({
                "company_name": "VyaparMind Demo Store",
                "username": "admin",
                "password": "admin123"
            }))
        except: pass
