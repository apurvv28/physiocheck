import os
from database import supabase
import json

def check_schemas():
    print("--- Checking Schemas ---")
    try:
        # Patients
        print("\n[PATIENTS]")
        p_res = supabase.from_("patients").select("*").limit(1).execute()
        if p_res.data:
            keys = list(p_res.data[0].keys())
            print(f"Columns: {keys}")
            if "full_name" in keys:
                print("SUCCESS: 'full_name' exists")
            elif "name" in keys:
                print("FOUND: 'name' exists (instead of full_name?)")
            else:
                print("WARNING: Neither 'full_name' nor 'name' found")
        else:
            print("No patients found")

        # Doctors
        print("\n[DOCTORS]")
        d_res = supabase.from_("doctors").select("*").limit(1).execute()
        if d_res.data:
            keys = list(d_res.data[0].keys())
            print(f"Columns: {keys}")
            if "full_name" in keys:
                print("SUCCESS: 'full_name' exists")
            elif "name" in keys:
                print("FOUND: 'name' exists (instead of full_name?)")
            else:
                print("WARNING: Neither 'full_name' nor 'name' found")
        else:
            print("No doctors found")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schemas()
