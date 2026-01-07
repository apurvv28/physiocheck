
import sys
import os
import json
from database import supabase

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("--- Checking Patients Table ---")
try:
    # Just get one patient
    response = supabase.from_("patients").select("*").limit(1).execute()
    
    print(f"Data count: {len(response.data)}")
    
    if response.data:
        print("First patient record:")
        print(json.dumps(response.data[0], indent=2))
        
        # Check for phone field
        if "phone" in response.data[0]:
            print(f"Phone field present: {response.data[0]['phone']}")
        else:
            print("WARNING: 'phone' field MISSING!")
    else:
        print("No patients found in database.")
        
except Exception as e:
    print(f"Error querying table: {e}")
