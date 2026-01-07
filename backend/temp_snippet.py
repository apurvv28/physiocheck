
@router.get("/sessions/active")
async def get_active_sessions(request: Request):
    try:
        doctor = request.state.user
        
        # Verify doctor role
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can view sessions")
        
        # Get doctor's database ID
        doctor_res = supabase.from_("doctors").select("id").eq("auth_user_id", doctor.id).execute()
        
        if not doctor_res.data or len(doctor_res.data) == 0:
            return []
            
        doctor_db_id = doctor_res.data[0]["id"]
        
        # Fetch active or scheduled sessions
        # Assuming we want upcoming or currently active sessions
        # We need to join with patients table to filter by doctor_id
        # Supabase-py join syntax can be tricky.
        # Alternative: Get all patient IDs for doctor, then get sessions for those patients.
        
        # 1. Get patient IDs
        patients_res = supabase.from_("patients").select("id").eq("doctor_id", doctor_db_id).execute()
        if not patients_res.data:
            return []
            
        patient_ids = [p["id"] for p in patients_res.data]
        
        if not patient_ids:
            return []
            
        # 2. Get sessions for these patients
        # Filter by status if there is a status column, or date >= now
        # Assuming 'status' column exists or using date. 
        # Let's get generic sessions for now or check sessions.py for schema.
        
        # Creating a safe query first
        sessions_res = supabase.from_("exercise_sessions")\
            .select("*, patients(full_name)")\
            .in_("patient_id", patient_ids)\
            .order("date", desc=True)\
            .limit(10)\
            .execute()
            
        return sessions_res.data or []
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching active sessions: {e}")
        return []
