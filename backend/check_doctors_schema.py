
import json
from database import supabase

def check_doctors_schema():
    print("Checking doctors table schema...")
    try:
        # Get one doctor
        response = supabase.from_("doctors").select("*").limit(1).execute()
        if response.data:
            print("Doctors table columns:")
            print(json.dumps(response.data[0], indent=2))
        else:
            print("No doctors found, cannot infer schema.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_doctors_schema()
