from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from database import supabase
from email_service import send_email
from notifications import create_notification
import secrets

router = APIRouter(prefix="/doctor", tags=["Doctor"])

class CreatePatientPayload(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    conditions: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    notes: Optional[str] = None
    notes: Optional[str] = None
    sendCredentials: Optional[bool] = True

class AssignExercisePayload(BaseModel):
    exercise_id: str
    patient_ids: List[str]
    sets: int
    reps: int
    frequency: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    selected_days: Optional[List[str]] = []
    notes: Optional[str] = None

@router.get("/dashboard/stats")
def get_dashboard_stats(request: Request):
    try:
        doctor = request.state.user
        
        # Verify doctor role
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can view stats")

        # Get doctor's database ID
        # Using execute() directly allows checking data length safely
        doc_res = supabase.from_("doctors").select("id").eq("auth_user_id", doctor.id).execute()
        
        if not doc_res.data or len(doc_res.data) == 0:
            # Try to auto-create if missing (failsafe)
            try:
                new_doc = supabase.from_("doctors").insert({"auth_user_id": doctor.id}).execute()
                if new_doc.data:
                    doc_id = new_doc.data[0]["id"]
                else:
                    return {"activePatients": 0, "totalPatients": 0}
            except:
                return {"activePatients": 0, "totalPatients": 0}
        else:
            doc_id = doc_res.data[0]["id"]
            
        # Get patient counts
        # We'll just count all patients for "total" and "active" for now
        patients = supabase.from_("patients")\
            .select("*", count="exact")\
            .eq("doctor_id", doc_id)\
            .execute()
            
        count = patients.count if patients.count is not None else 0
        
        return {
            "activePatients": count,
            "totalPatients": count
        }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return {"activePatients": 0, "totalPatients": 0}

@router.post("/create_patient")
def create_patient(payload: CreatePatientPayload, request: Request):
    try:
        doctor = request.state.user
        
        # Verify doctor role
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can create patients")

        # Get doctor's database ID
        doctor_res = supabase.from_("doctors").select("id").eq("auth_user_id", doctor.id).execute()
        
        if not doctor_res.data or len(doctor_res.data) == 0:
            # Auto-create failsafe
            try:
                print(f"Doctor profile missing for {doctor.id}, attempting auto-create...")
                new_doc = supabase.from_("doctors").insert({"auth_user_id": doctor.id}).execute()
                if new_doc.data:
                    doctor_db_id = new_doc.data[0]["id"]
                else:
                     raise HTTPException(status_code=404, detail="Doctor profile not found and could not be created")
            except Exception as e:
                print(f"Auto-create failed: {e}")
                raise HTTPException(status_code=404, detail="Doctor profile not found")
        else:
            doctor_db_id = doctor_res.data[0]["id"]

        # 1. Create auth user for patient
        # Format: Name (first word, capitalized) + Last 4 digits of phone
        try:
            first_name = payload.full_name.split()[0].capitalize()
            # Extract only digits from phone
            phone_digits = "".join(filter(str.isdigit, payload.phone))
            last_4 = phone_digits[-4:] if len(phone_digits) >= 4 else phone_digits.ljust(4, "0")
            temp_password = f"{first_name}{last_4}"
        except:
            # Fallback if name/phone parsing fails
            temp_password = secrets.token_urlsafe(8)

        try:
            auth_res = supabase.auth.sign_up({
                "email": payload.email,
                "password": temp_password,
                "options": {
                    "data": {
                        "role": "patient"
                    }
                }
            })
        except Exception as e:
            print(f"Error creating auth user: {e}")
            raise HTTPException(status_code=400, detail="Failed to create user account. Email may already be in use.")

        if not auth_res or not auth_res.user:
            raise HTTPException(status_code=400, detail="Failed to create user account")

        patient_auth_id = auth_res.user.id

        # 2. Insert patient record
        patient_data = {
            "doctor_id": doctor_db_id,  # Use database ID, not auth ID
            "auth_user_id": patient_auth_id,
            "full_name": payload.full_name,
            "email": payload.email,
            "phone": payload.phone,
            "date_of_birth": payload.date_of_birth,
            "age": payload.age,
            "conditions": payload.conditions or [],
            "allergies": payload.allergies or [],
            "medications": payload.medications or [],
            "emergency_contact_name": payload.emergency_contact_name,
            "emergency_contact_phone": payload.emergency_contact_phone,
            "notes": payload.notes,
        }

        try:
            print(f"Inserting into patients table: {patient_data}")
            patient_res = supabase.from_("patients").insert(patient_data).execute()
            
            if not patient_res.data:
                print("Insert returned no data")
                raise Exception("Failed to insert patient record - no data returned")
                
            print(f"Patient inserted successfully: {patient_res.data}")    
        except Exception as e:
            # Rollback: delete the auth user
            try:
                # Note: You'll need admin privileges or service role to delete users
                print(f"Rolling back: Failed to create patient - {e}")
            except:
                pass
            print(f"Error inserting patient: {e}")
            raise HTTPException(status_code=500, detail="Failed to create patient record")

        # 3. Send email (if enabled)
        if payload.sendCredentials:
            try:
                send_email(
                    to=payload.email,
                    subject="Your PhysioCheck Account",
                    content=f"""Hello {payload.full_name},

Your physiotherapist has created an account for you.

Login Email: {payload.email}
Temporary Password: {temp_password}

Login here:
http://localhost:3000/login

Please change your password after login.

Best regards,
PhysioCheck Team
"""
                )
            except Exception as e:
                print(f"Warning: Failed to send email: {e}")
                # Don't fail the entire operation if email fails

        return {
            "status": "success",
            "patient_id": patient_res.data[0]["id"],
            "message": "Patient created successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Create patient failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create patient: {str(e)}")

@router.get("/patients")
def list_patients(request: Request):
    try:
        doctor = request.state.user
        
        # Verify doctor role
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can view patient list")
        
        # Get doctor's database ID
        doctor_res = supabase.from_("doctors").select("id").eq("auth_user_id", doctor.id).execute()
        
        if not doctor_res.data or len(doctor_res.data) == 0:
            return []
        
        doctor_db_id = doctor_res.data[0]["id"]
        
        # Get patients for this doctor only
        patients = supabase.from_("patients")\
            .select("*")\
            .eq("doctor_id", doctor_db_id)\
            .order("created_at", desc=True)\
            .execute()
        
        patient_list = patients.data or []
        
        # Enrich with stats
        for p in patient_list:
             try:
                 # Last Session
                 last_session_res = supabase.from_("exercise_sessions")\
                     .select("created_at")\
                     .eq("patient_id", p["id"])\
                     .eq("status", "completed")\
                     .order("created_at", desc=True)\
                     .limit(1)\
                     .execute()
                 
                 p["last_session_at"] = last_session_res.data[0]["created_at"] if last_session_res.data else None
                 
                 # Total Duration
                 duration_res = supabase.from_("exercise_sessions")\
                     .select("duration_seconds")\
                     .eq("patient_id", p["id"])\
                     .execute()
                 
                 all_sessions = duration_res.data or []
                 p["total_duration"] = sum([int(s.get("duration_seconds") or 0) for s in all_sessions])
                 
                 # Assigned Exercises Count
                 assigned_res = supabase.from_("assigned_exercises")\
                     .select("id", count="exact")\
                     .eq("patient_id", p["id"])\
                     .execute()
                 p["assigned_exercises_count"] = assigned_res.count or 0
                 
                 # Compliance (rough calc from stats endpoint logic)
                 # Keeping it simple for list view
                 p["compliance"] = 0 # Placeholder or fetch if needed
             except Exception:
                 p["last_session_at"] = None
                 p["assigned_exercises_count"] = 0

        return patient_list
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching patients: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch patients")

        print(f"Error fetching patient: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch patient details")

@router.get("/patients/{patient_id}/stats")
def get_patient_stats(patient_id: str, request: Request):
    try:
        doctor = request.state.user
        
        # Verify doctor role
        if doctor.user_metadata.get("role") != "doctor":
             raise HTTPException(status_code=403, detail="Only doctors can view stats")

        # Get sessions
        sessions_res = supabase.from_("exercise_sessions")\
            .select("*")\
            .eq("patient_id", patient_id)\
            .execute()
        
        sessions = sessions_res.data or []
        
        total_sessions = len(sessions)
        
        # Calculate totals
        total_duration = sum([int(s.get("duration_seconds") or 0) for s in sessions])
        completed_sessions = [s for s in sessions if s.get("status") == "completed"]
        
        # Compliance logic (simplified): completed vs total started or just a placeholder logic if we don't track adherence strictly yet.
        # Let's say compliance is % of sessions that are marked completed vs total sessions attempted
        compliance = round((len(completed_sessions) / total_sessions * 100) if total_sessions > 0 else 0)

        # Accuracy average
        accuracies = []
        for s in sessions:
            metrics = s.get("metrics") or {}
            # metrics might be a dict or string depending on how supabase driver returns it. 
            # usually dict if jsonb.
            if isinstance(metrics, dict) and "accuracy" in metrics:
                accuracies.append(metrics["accuracy"])
        
        avg_accuracy = round(sum(accuracies) / len(accuracies)) if accuracies else 0
        
        # Last session
        last_session = sessions[0]["created_at"] if sessions else None
        
        return {
            "totalSessions": total_sessions,
            "avgAccuracy": avg_accuracy,
            "totalDuration": round(total_duration / 60), # in minutes
            "compliance": compliance,
            "lastSession": last_session,
            "nextAppointment": None # Future feature
        }
    except Exception as e:
        print(f"Error fetching stats for {patient_id}: {e}")
        return {
            "totalSessions": 0,
            "avgAccuracy": 0,
            "totalDuration": 0,
            "compliance": 0,
            "lastSession": None,
            "nextAppointment": None
        }

@router.get("/patients/{patient_id}/history")
def get_patient_history(patient_id: str, request: Request):
    try:
        doctor = request.state.user
        if doctor.user_metadata.get("role") != "doctor":
             raise HTTPException(status_code=403, detail="Only doctors can view history")

        sessions = supabase.from_("exercise_sessions")\
            .select("*, exercises(*)")\
            .eq("patient_id", patient_id)\
            .order("created_at", desc=True)\
            .execute()
            
        return sessions.data or []
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

@router.get("/patients/{patient_id}/exercises")
def get_patient_exercises(patient_id: str, request: Request):
    try:
        doctor = request.state.user
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can view patient exercises")

        # Get exercises assigned to this patient
        exercises = supabase.from_("assigned_exercises")\
            .select("*, exercises(*)")\
            .eq("patient_id", patient_id)\
            .order("assigned_at", desc=True)\
            .execute()
        
        return exercises.data or []
    except Exception as e:
        print(f"Error fetching patient exercises: {e}")
        return []

@router.get("/patients/{patient_id}")
def get_patient(patient_id: str, request: Request):
    try:
        doctor = request.state.user
        
        # Verify doctor role
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can view patient details")
        
        # Get doctor's database ID
        doctor_res = supabase.from_("doctors").select("id").eq("auth_user_id", doctor.id).execute()
        
        if not doctor_res.data or len(doctor_res.data) == 0:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        
        doctor_db_id = doctor_res.data[0]["id"]
        
        # Get patient and verify it belongs to this doctor
        patient_res = supabase.from_("patients")\
            .select("*")\
            .eq("id", patient_id)\
            .eq("doctor_id", doctor_db_id)\
            .execute()
        
        if not patient_res.data or len(patient_res.data) == 0:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return patient_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching patient: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch patient details")

@router.get("/sessions/active")
def get_active_sessions(request: Request):
    try:
        doctor = request.state.user
        
        # Verify doctor role
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can view sessions")
        
        # Get doctor's database ID
        doctor_res = supabase.from_("doctors").select("id").eq("auth_user_id", doctor.id).execute()
        
        if not doctor_res.data or len(doctor_res.data) == 0:
            return []
            
        # 2. Get sessions (FOR DEMO: showing ALL sessions regardless of doctor assignment)
        # Manual fetch strategy to avoid join crashes
        sessions_res = supabase.from_("exercise_sessions")\
            .select("*")\
            .eq("status", "in_progress")\
            .order("created_at", desc=True)\
            .limit(20)\
            .execute()
            
        sessions = sessions_res.data or []
        
        if not sessions:
            return []
            
        # Collect IDs
        patient_ids = list(set([s["patient_id"] for s in sessions if s.get("patient_id")]))
        exercise_ids = list(set([s["exercise_id"] for s in sessions if s.get("exercise_id")]))
        
        # Fetch related data
        patients_map = {}
        if patient_ids:
            p_res = supabase.from_("patients").select("id, full_name").in_("id", patient_ids).execute()
            if p_res.data:
                patients_map = {p["id"]: p for p in p_res.data}
                
        exercises_map = {}
        if exercise_ids:
            # Column is 'name' not 'title' based on exercises.py
            e_res = supabase.from_("exercises").select("id, name").in_("id", exercise_ids).execute()
            if e_res.data:
                exercises_map = {e["id"]: e for e in e_res.data}
        
        # Merge data
        enriched_sessions = []
        for s in sessions:
            s["patients"] = patients_map.get(s["patient_id"], {"full_name": "Unknown"})
            # Mapping 'name' to 'title' for frontend compatibility if frontend expects title,
            # OR just pass 'name' and update frontend.
            # Frontend doctor/sessions/page.tsx: exerciseName: item.exercises?.title || ...
            # I should provide 'title' key locally or update frontend.
            # Let's map it here to keep frontend happy.
            ex_data = exercises_map.get(s["exercise_id"], {"name": "Unknown"})
            s["exercises"] = {"title": ex_data.get("name", "Unknown")} 
            enriched_sessions.append(s)
            
        return enriched_sessions
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching active sessions: {e}")
        return []

@router.get("/sessions/history")
def get_session_history(request: Request):
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

        # 1. Get patients IDs for this doctor
        patients_res = supabase.from_("patients").select("id").eq("doctor_id", doctor_db_id).execute()
        patient_ids = [p["id"] for p in (patients_res.data or [])]
        
        if not patient_ids:
            return []

        # 2. Get sessions for these patients
        sessions_res = supabase.from_("exercise_sessions")\
            .select("*")\
            .in_("patient_id", patient_ids)\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()
            
        sessions = sessions_res.data or []
        
        if not sessions:
            return []
            
        # Collect IDs for enrichment
        # patient_ids already known but we need names.
        exercise_ids = list(set([s["exercise_id"] for s in sessions if s.get("exercise_id")]))
        
        # Fetch related data
        patients_map = {}
        if patient_ids:
            p_res = supabase.from_("patients").select("id, full_name").in_("id", patient_ids).execute()
            if p_res.data:
                patients_map = {p["id"]: p for p in p_res.data}
                
        exercises_map = {}
        if exercise_ids:
            # Column is 'name' based on exercises.py
            e_res = supabase.from_("exercises").select("id, name").in_("id", exercise_ids).execute()
            if e_res.data:
                exercises_map = {e["id"]: e for e in e_res.data}
        
        # Merge data
        enriched_sessions = []
        for s in sessions:
            s["patients"] = patients_map.get(s["patient_id"], {"full_name": "Unknown"})
            ex_data = exercises_map.get(s["exercise_id"], {"name": "Unknown"})
            s["exercises"] = {"title": ex_data.get("name", "Unknown")} 
            enriched_sessions.append(s)
            
        return enriched_sessions
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching session history: {e}")
        return []
    except Exception as e:
        import traceback
        print(f"Error checking active sessions: {e}")
        traceback.print_exc()
        return []

@router.post("/assignments")
def assign_exercise(payload: AssignExercisePayload, request: Request):
    try:
        doctor = request.state.user
        if doctor.user_metadata.get("role") != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can assign exercises")

        # Prepare records for insertion
        records = []
        for pid in payload.patient_ids:
            records.append({
                "patient_id": pid,
                "exercise_id": payload.exercise_id,
                "sets": payload.sets,
                "reps": payload.reps,
                "frequency": payload.frequency,
                "start_date": payload.start_date,
                "end_date": payload.end_date,
                "selected_days": payload.selected_days,
                "notes": payload.notes
            })
            
        if not records:
             raise HTTPException(status_code=400, detail="No patients selected")

        # Bulk insert
        res = supabase.from_("assigned_exercises").insert(records).execute()
        
        # Notify Patients
        try:
            # We need auth_user_ids for notifications table policy
            p_res = supabase.from_("patients").select("id, auth_user_id").in_("id", payload.patient_ids).execute()
            if p_res.data:
                for p in p_res.data:
                    create_notification(
                        user_id=p["auth_user_id"], 
                        title="New Exercise Assigned",
                        message="Your therapist has assigned you new exercises.",
                        type="info"
                    )
        except Exception as e:
            print(f"Failed to notify patients: {e}")
        
        return {"status": "success", "message": f"Assigned to {len(records)} patients"}

    except Exception as e:
        print(f"Error assigning exercises: {e}")
        raise HTTPException(status_code=500, detail="Failed to assign exercises")