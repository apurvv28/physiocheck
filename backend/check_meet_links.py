import os
from database import supabase
import json

def check_meet_links():
    print("--- Checking Appointments for Meet Links ---")
    try:
        res = supabase.from_("appointments").select("id, appointment_mode, google_meet_link, appointment_date, start_time").execute()
        
        print(f"\nTotal appointments: {len(res.data)}")
        
        for appt in res.data:
            mode = appt.get('appointment_mode')
            link = appt.get('google_meet_link')
            date = appt.get('appointment_date')
            time = appt.get('start_time')
            
            print(f"\n{date} {time} - {mode}")
            if mode == 'virtual':
                if link:
                    print(f"  ✅ Has Meet link: {link[:50]}...")
                else:
                    print(f"  ❌ Missing Meet link!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_meet_links()
