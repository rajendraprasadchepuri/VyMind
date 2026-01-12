import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
PRODUCTS_URL = f"{BASE_URL}/products/"

def login():
    try:
        data = json.dumps({
            "company_name": "VyaparMind Demo Store",
            "username": "admin",
            "password": "admin123"
        }).encode('utf-8')
        
        req = urllib.request.Request(LOGIN_URL, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                body = response.read().decode('utf-8')
                return json.loads(body)["access_token"]
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def seed_products(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
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
            data = json.dumps(p).encode('utf-8')
            req = urllib.request.Request(PRODUCTS_URL, data=data, headers=headers)
            with urllib.request.urlopen(req) as res:
                if res.status == 200:
                    print(f"Created: {p['name']}")
        except Exception as e:
             # Ignore duplicate errors or similar
             print(f"Note: {p['name']} might already exist or failed: {e}")

if __name__ == "__main__":
    token = login()
    if token:
        seed_products(token)
    else:
        print("Login failed, cannot seed products.")
