import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:3000/api"

def test_proxy_auth():
    print(f"Testing Proxy Auth against {BASE_URL}")
    try:
        # 1. Login
        login_payload = json.dumps({
            "company_name": "VyaparMind Demo Store",
            "username": "admin",
            "password": "admin123"
        }).encode('utf-8')
        
        print("Attempting Login via Proxy...")
        req = urllib.request.Request(
            f"{BASE_URL}/auth/login", 
            data=login_payload, 
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as res:
            if res.status != 200:
                print(f"Login failed: {res.status}")
                return
            body = res.read().decode('utf-8')
            data = json.loads(body)
            token = data.get("access_token")
            print(f"Login Successful. Token: {token[:20]}...")
            
        # 2. Try POST /products
        product_payload = json.dumps({
            "name": "Proxy Debug Product",
            "category": "Debug",
            "price": 100,
            "cost_price": 50,
            "stock_quantity": 10
        }).encode('utf-8')
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print("\nAttempting Create Product via Proxy...")
        req = urllib.request.Request(
            f"{BASE_URL}/products", 
            data=product_payload, 
            headers=headers,
            method="POST"
        )
        
        with urllib.request.urlopen(req) as res:
            print(f"Status Code: {res.status}")
            print(f"Response: {res.read().decode('utf-8')}")
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        try:
            print(f"Error Body: {e.read().decode('utf-8')}")
        except:
            pass
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_proxy_auth()
