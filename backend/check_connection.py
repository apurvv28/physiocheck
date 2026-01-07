
import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("--- Starting Connection Check ---")
try:
    print("Importing database module...")
    from database import supabase
    print("Import successful. Client object:", supabase)

    print("Attempting to fetch 'doctors' table...")
    # Removing 'head=True' which caused TypeError
    response = supabase.from_("doctors").select("*", count="exact").limit(1).execute()
    
    print(f"Response received. Data: {response.data}")
    print(f"Count: {response.count}")
    print("SUCCESS: Connected to Supabase!")
    
except Exception as e:
    print("\nFAILURE: Could not connect.")
    print(f"Exception Type: {type(e).__name__}")
    print(f"Exception Message: {e}")
    print("Traceback:")
    traceback.print_exc()
