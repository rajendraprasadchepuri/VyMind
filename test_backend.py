"""
Backend API Test Script
Tests all critical endpoints to verify the backend is working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed:", response.json())
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running on port 8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_login():
    """Test login endpoint"""
    print("\nTesting /auth/login endpoint...")
    try:
        payload = {
            "company_name": "VyaparMind Demo Store",
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   Token: {data.get('access_token', 'N/A')[:50]}...")
            return data.get('access_token')
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_dashboard_stats(token):
    """Test dashboard stats endpoint"""
    print("\nTesting /dashboard/stats endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Dashboard stats retrieved successfully!")
            print(f"   Products: {data.get('product_count', 0)}")
            print(f"   Transactions: {data.get('total_sales_count', 0)}")
            print(f"   Revenue: ₹{data.get('total_revenue', 0)}")
            return True
        else:
            print(f"❌ Dashboard stats failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_restaurant_tables(token):
    """Test restaurant tables endpoint"""
    print("\nTesting /restaurant/tables endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/restaurant/tables", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Restaurant tables retrieved successfully! Found {len(data)} tables")
            return True
        else:
            print(f"❌ Restaurant tables failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_churn_risk(token):
    """Test churn risk endpoint"""
    print("\nTesting /modules/churn-risk endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/modules/churn-risk", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Churn risk data retrieved successfully! Found {len(data)} customers")
            return True
        else:
            print(f"❌ Churn risk failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("VyMind Backend API Test Suite")
    print("=" * 60)
    
    # Test 1: Health Check
    if not test_health():
        print("\n🚨 Backend is not accessible. Please check:")
        print("   1. Is the backend running? (python -m uvicorn backend.main:app --reload)")
        print("   2. Is it running on port 8000?")
        print("   3. Is there a firewall blocking the connection?")
        return
    
    # Test 2: Login
    token = test_login()
    if not token:
        print("\n🚨 Login failed. Cannot proceed with authenticated tests.")
        return
    
    # Test 3: Dashboard Stats
    test_dashboard_stats(token)
    
    # Test 4: Restaurant Tables
    test_restaurant_tables(token)
    
    # Test 5: Churn Risk
    test_churn_risk(token)
    
    print("\n" + "=" * 60)
    print("Test suite completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
