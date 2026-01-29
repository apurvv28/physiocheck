
import asyncio
from database import supabase

async def verify_deployment():
    print("Verifying deployment...")
    all_good = True
    
    # 1. Check appointments table
    try:
        # Try to select from appointments (even if empty)
        res = supabase.from_("appointments").select("id").limit(1).execute()
        print("✅ 'appointments' table exists.")
    except Exception as e:
        print(f"❌ 'appointments' table check failed: {e}")
        all_good = False

    # 2. Check doctors table for google_refresh_token
    try:
        # Try to select the specific column
        res = supabase.from_("doctors").select("google_refresh_token").limit(1).execute()
        print("✅ 'doctors' table has 'google_refresh_token' column.")
    except Exception as e:
        print(f"❌ 'doctors' table missing 'google_refresh_token' column: {e}")
        print("   -> Please run 'backend/update_doctors_schema.sql' in Supabase.")
        all_good = False

    if all_good:
        print("\n🎉 SYSTEM READY! You can now use the feature.")
    else:
        print("\n⚠️ SYSTEM NOT READY. Please check errors above.")

if __name__ == "__main__":
    asyncio.run(verify_deployment())
