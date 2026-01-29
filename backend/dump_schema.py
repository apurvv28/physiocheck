import os
from database import supabase
import json

def dump_schema():
    output = []
    try:
        # Patients
        p_res = supabase.from_("patients").select("*").limit(1).execute()
        if p_res.data:
            keys = sorted(list(p_res.data[0].keys()))
            output.append(f"PATIENTS columns: {keys}")
        else:
            output.append("PATIENTS table empty or not accessible")

        # Doctors
        d_res = supabase.from_("doctors").select("*").limit(1).execute()
        if d_res.data:
            keys = sorted(list(d_res.data[0].keys()))
            output.append(f"DOCTORS columns: {keys}")
        else:
            output.append("DOCTORS table empty or not accessible")

    except Exception as e:
        output.append(f"Error: {e}")

    with open("schema_dump.txt", "w") as f:
        f.write("\n".join(output))
    print("Schema dumped to schema_dump.txt")

if __name__ == "__main__":
    dump_schema()
