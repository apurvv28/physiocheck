import os
from database import supabase
import json

def check_appointments():
    print("--- Fetching Appointments ---")
    try:
        # Fetch all appointments
        res = supabase.from_("appointments").select("*, patients(full_name), doctors(full_name)").execute()
        
        print(f"Count: {len(res.data)}")
        if res.data:
            print(json.dumps(res.data, indent=2, default=str))
        else:
            print("No appointments found.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_appointments()
