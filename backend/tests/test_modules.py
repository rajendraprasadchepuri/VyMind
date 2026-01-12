import pytest

def get_auth_headers(client):
    # Use Demo Admin
    login_payload = {
        "company_name": "VyaparMind Demo Store",
        "username": "admin",
        "password": "admin123"
    }
    response = client.post("/auth/login", json=login_payload)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_supplier_workflow(client):
    headers = get_auth_headers(client)
    
    # 1. Create Supplier
    supplier_data = {
        "name": "Test Supplier",
        "contact_person": "John Doe",
        "phone": "555-0199",
        "category_specialty": "Fresh Produce"
    }
    res = client.post("/modules/suppliers", json=supplier_data, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Test Supplier"
    supplier_id = data["id"]
    
    # 2. Get Suppliers
    res = client.get("/modules/suppliers", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1
    
    # 3. Create PO
    po_data = {
        "supplier_id": supplier_id,
        "expected_date": "2026-02-01",
        "notes": "Urgent"
    }
    res = client.post("/modules/purchase-orders", json=po_data, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "PENDING"

def test_staff_workflow(client):
    headers = get_auth_headers(client)
    
    # 1. Create Staff
    staff_data = {
        "name": "Jane Staff",
        "role": "Server",
        "hourly_rate": 15.0
    }
    res = client.post("/modules/staff", json=staff_data, headers=headers)
    assert res.status_code == 200
    staff_id = res.json()["id"]
    
    # 2. Add Shift
    shift_data = {
        "staff_id": staff_id,
        "date": "2026-01-20",
        "slot": "Morning"
    }
    res = client.post("/modules/shifts", json=shift_data, headers=headers)
    assert res.status_code == 200
    assert res.json()["slot"] == "Morning"
