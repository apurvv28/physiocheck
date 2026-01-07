
import sys
import os
import httpx
import json
import secrets

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

TEMP_EMAIL = f"debug_doc_{secrets.token_hex(4)}@test.com"
PWD = "TempPassword123!"

print(f"Creating temp doctor: {TEMP_EMAIL}")

try:
    with httpx.Client() as client:
        # Register (which auto-creates doctor profile now in auth.py)
        auth_res = client.post("http://127.0.0.1:8000/api/v1/auth/register", json={
            "email": TEMP_EMAIL,
            "password": PWD,
            "options": {"data": {"role": "doctor"}}
        })
        
        if auth_res.status_code not in [200, 201]:
            print("Register failed, trying login...")
            
        # Login
        login_res = client.post("http://127.0.0.1:8000/api/v1/auth/login", json={
            "email": TEMP_EMAIL,
            "password": PWD
        })
        
        if login_res.status_code != 200:
            print(f"Login failed: {login_res.text}")
            sys.exit(1)
            
        token = login_res.json()["access_token"]
        print("Logged in successfully.")
        
        # 2. Call patients endpoint
        headers = {"Authorization": f"Bearer {token}"}
        print("Fetching patients list...")
        patients_res = client.get("http://127.0.0.1:8000/api/v1/doctor/patients", headers=headers)
        
        print(f"Status Code: {patients_res.status_code}")
        print("Response Body:")
        try:
            data = patients_res.json()
            print(json.dumps(data, indent=2))
            
            if isinstance(data, list):
                print("SUCCESS: Response is a list.")
            else:
                print("FAILURE: Response is NOT a list.")
                
        except Exception as e:
            print(f"Failed to parse JSON: {patients_res.text}")


except Exception as e:
    print(f"An error occurred: {e}")
