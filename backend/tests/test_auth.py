def test_register_and_login(client):
    from backend.models import core
    from backend.database_config import SessionLocal # Use the session from the app or better create a new one bound to the test engine? 
    # Actually, client uses the override_get_db fixture which uses TestingSessionLocal.
    # We can access the DB via a dedicated session or just assume the backend logic works if we use a pre-existing ACTIVE account?
    # Better: Let's use the Demo account. 
    
    # BUT, conftest setup creates valid empty tables. The Demo seed happens in startup event.
    # TestClient(app) triggers startup event? Yes.
    
    # 2. Login as Demo Admin (should allow login)
    login_payload = {
        "company_name": "VyaparMind Demo Store",
        "username": "admin",
        "password": "admin123"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    
    token = token_data["access_token"]

    # 3. Access Protected Route
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["username"] == "admin"
    assert user_data["role"] == "super_admin"
