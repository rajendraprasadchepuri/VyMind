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

def verify_crud(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 1. Create
    print("Testing CREATE...")
    new_product = {
        "name": "Test CRUD Product",
        "category": "Test",
        "price": 10.0,
        "cost_price": 5.0,
        "stock_quantity": 100
    }
    
    product_id = None
    try:
        data = json.dumps(new_product).encode('utf-8')
        req = urllib.request.Request(PRODUCTS_URL, data=data, headers=headers)
        with urllib.request.urlopen(req) as res:
            if res.status == 200:
                body = json.loads(res.read().decode('utf-8'))
                product_id = body["id"]
                print(f"Created Product ID: {product_id}")
            else:
                print(f"Create failed: {res.status}")
                return
    except Exception as e:
        print(f"Create Exception: {e}")
        return

    # 2. Update
    print("Testing UPDATE...")
    update_data = {
        "price": 15.0,
        "stock_quantity": 90
    }
    try:
        url = f"{PRODUCTS_URL}{product_id}"
        data = json.dumps(update_data).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method="PUT")
        with urllib.request.urlopen(req) as res:
            if res.status == 200:
                body = json.loads(res.read().decode('utf-8'))
                if body["price"] == 15.0 and body["stock_quantity"] == 90:
                    print("Update Successful")
                else:
                    print("Update Mismatch:", body)
            else:
                print(f"Update failed: {res.status}")
    except Exception as e:
        print(f"Update Exception: {e}")

    # 3. Delete
    print("Testing DELETE...")
    try:
        url = f"{PRODUCTS_URL}{product_id}"
        req = urllib.request.Request(url, headers=headers, method="DELETE")
        with urllib.request.urlopen(req) as res:
            if res.status == 200:
                print("Delete Successful")
            else:
                print(f"Delete failed: {res.status}")
    except Exception as e:
        print(f"Delete Exception: {e}")
        
    # 4. Verify Gone
    print("Verifying Deletion...")
    try:
        url = f"{PRODUCTS_URL}{product_id}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as res:
            print("Product still exists! (Fail)")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("Product confirmed deleted (Success)")
        else:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    token = login()
    if token:
        verify_crud(token)
    else:
        print("Login failed")
