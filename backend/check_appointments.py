
import asyncio
from database import supabase

def check_table():
    print("Checking if appointments table exists...")
    try:
        # Try to select from the table. If it doesn't exist, it should throw an error.
        response = supabase.from_("appointments").select("id").limit(1).execute()
        print("Table 'appointments' exists.")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Error accessing table: {e}")
        print("Table likely does not exist yet.")

if __name__ == "__main__":
    check_table()
