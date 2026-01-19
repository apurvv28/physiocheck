from fastapi import APIRouter, HTTPException, Request
from database import supabase

router = APIRouter(prefix="/patient", tags=["Patient"])

@router.get("/my_exercises")
def my_exercises(request: Request):
    try:
        user = request.state.user
        
        # Get patient record first
        patient_res = supabase.from_("patients").select("id").eq("auth_user_id", user.id).single().execute()
        
        if not patient_res.data:
            raise HTTPException(404, "Patient profile not found")
        
        patient_id = patient_res.data["id"]
        
        exercises = supabase.from_("assigned_exercises")\
            .select("*, exercises(*)")\
            .eq("patient_id", patient_id)\
            .execute()
        
        if exercises.data:
            # print("Debugging my_exercises: First item:", exercises.data[0])
            # for ex in exercises.data:
            #     print(f"AssignID: {ex.get('id')} -> ExerciseID: {ex.get('exercise_id')}")
            pass

        return exercises.data or []
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching exercises: {e}")
        raise HTTPException(500, "Failed to fetch exercises")

@router.get("/session/history")
def session_history(request: Request):
    try:
        user = request.state.user
        
        # Get patient record first
        patient_res = supabase.from_("patients").select("id").eq("auth_user_id", user.id).single().execute()
        
        if not patient_res.data:
            raise HTTPException(404, "Patient profile not found")
        
        patient_id = patient_res.data["id"]
        
        # Get session history for this patient only, including exercise details
        sessions = supabase.from_("exercise_sessions")\
            .select("*, exercises(*)")\
            .eq("patient_id", patient_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return sessions.data or []
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching session history: {e}")
        raise HTTPException(500, "Failed to fetch session history")

@router.get("/dashboard/stats")
def dashboard(request: Request):
    try:
        user = request.state.user
        
        # Get patient record
        patient_res = supabase.from_("patients").select("id").eq("auth_user_id", user.id).single().execute()
        
        if not patient_res.data:
            return {"completed_sessions": 0, "total_exercises": 0}
        
        patient_id = patient_res.data["id"]
        
        # Get stats
        sessions = supabase.from_("exercise_sessions")\
            .select("*", count="exact")\
            .eq("patient_id", patient_id)\
            .eq("status", "completed")\
            .execute()
        
        exercises = supabase.from_("assigned_exercises")\
            .select("*", count="exact")\
            .eq("patient_id", patient_id)\
            .execute()
        
        return {
            "completed_sessions": sessions.count or 0,
            "total_exercises": exercises.count or 0
        }
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        return {"completed_sessions": 0, "total_exercises": 0}

@router.get("/my-doctor")
def get_my_doctor(request: Request):
    try:
        user = request.state.user
        
        # Get patient record
        patient_res = supabase.from_("patients").select("doctor_id").eq("auth_user_id", user.id).single().execute()
        
        if not patient_res.data or not patient_res.data.get("doctor_id"):
            return None
            
        doctor_id = patient_res.data["doctor_id"]
        
        # Get Doctor info
        doctor_res = supabase.from_("doctors").select("id, auth_user_id").eq("id", doctor_id).single().execute()
        
        if not doctor_res.data:
            return None
            
        doctor_data = doctor_res.data
        doctor_auth_id = doctor_data["auth_user_id"]
        
        # Get Doctor Name from Auth (using Admin/Service Role if possible, or just user_metadata if visible)
        # Since we use service role key in backend, we might be able to fetch. 
        # But supabase-py client.auth.admin.get_user_by_id might be needed.
        # However, supabase-py client initialized with service key acts as admin?
        # Let's try to fetch user metadata.
        
        doctor_name = "Dr. Physiotherapist"
        try:
             # This requires the client to be initialized with service_role_key which it is in database.py
             doc_user = supabase.auth.admin.get_user_by_id(doctor_auth_id)
             if doc_user and doc_user.user and doc_user.user.user_metadata:
                 meta = doc_user.user.user_metadata
                 if meta.get("full_name"):
                     doctor_name = meta.get("full_name")
        except Exception as e:
            print(f"Failed to fetch doctor auth details: {e}")
            
        return {
            "id": doctor_data["id"],
            "auth_user_id": doctor_auth_id,
            "name": doctor_name,
            "role": "doctor"
        }

    except Exception as e:
        print(f"Error fetching my doctor: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch doctor details")
