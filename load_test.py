import urllib.request
import urllib.parse
import json
import time
import concurrent.futures
import random

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
DASHBOARD_URL = f"{BASE_URL}/dashboard/stats"
PRODUCTS_URL = f"{BASE_URL}/products/"

NUM_USERS = 50  # Number of concurrent users to simulate
REQUESTS_PER_USER = 5

def login():
    try:
        data = json.dumps({
            "company_name": "VyaparMind Demo Store",
            "username": "admin",
            "password": "admin123"
        }).encode('utf-8')
        
        req = urllib.request.Request(LOGIN_URL, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                body = response.read().decode('utf-8')
                return json.loads(body)["access_token"]
    except Exception as e:
        # print(f"Login failed: {e}")
        return None

def user_session(user_id):
    token = login()
    if not token:
        return 0, 1 # success, fail
    
    headers = {"Authorization": f"Bearer {token}"}
    success = 0
    fail = 0
    
    for _ in range(REQUESTS_PER_USER):
        try:
            # Randomly choose an action
            action = random.choice(["dashboard", "products"])
            
            if action == "dashboard":
                req = urllib.request.Request(DASHBOARD_URL, headers=headers)
                with urllib.request.urlopen(req, timeout=5) as res:
                    if res.status == 200: success += 1
                    else: fail += 1
            else:
                req = urllib.request.Request(PRODUCTS_URL, headers=headers)
                with urllib.request.urlopen(req, timeout=5) as res:
                    if res.status == 200: success += 1
                    else: fail += 1
            
            time.sleep(random.uniform(0.1, 0.5)) # Think time
            
        except Exception as e:
            fail += 1
            
    return success, fail

def run_load_test():
    print(f"Starting Load Test: {NUM_USERS} users, {REQUESTS_PER_USER} requests each...")
    start_time = time.time()
    
    total_success = 0
    total_fail = 0
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(user_session, i) for i in range(NUM_USERS)]
        
        for future in concurrent.futures.as_completed(futures):
            s, f = future.result()
            total_success += s
            total_fail += f
            
    duration = time.time() - start_time
    total_requests = total_success + total_fail
    rps = total_requests / duration
    
    print(f"\n--- Load Test Results ---")
    print(f"Total Requests: {total_requests}")
    print(f"Successful: {total_success}")
    print(f"Failed: {total_fail}")
    print(f"Duration: {duration:.2f}s")
    print(f"Requests/Sec: {rps:.2f}")
    
    if total_fail == 0:
        print("RESULT: PASS")
    else:
        print("RESULT: WARNING (Some failures occurred)")

if __name__ == "__main__":
    run_load_test()
