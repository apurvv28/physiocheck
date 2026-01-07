from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import supabase

router = APIRouter(prefix="/sessions", tags=["Sessions"])

class CreateSessionPayload(BaseModel):
    exercise_id: str
    duration_seconds: Optional[int] = None
    repetitions: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = "in_progress"

@router.post("")
def create_session(payload: CreateSessionPayload, request: Request):
    """Create a new exercise session"""
    try:
        user = request.state.user
        
        # Get patient record
        patient_res = supabase.from_("patients")\
            .select("id")\
            .eq("auth_user_id", user.id)\
            .single()\
            .execute()
        
        if not patient_res.data:
            raise HTTPException(404, "Patient profile not found")
        
        patient_id = patient_res.data["id"]
        
        # Verify exercise exists
        exercise = supabase.from_("exercises")\
            .select("id")\
            .eq("id", payload.exercise_id)\
            .single()\
            .execute()
        
        if not exercise.data:
            raise HTTPException(404, "Exercise not found")
        
        # Create session
        session_data = {
            "patient_id": patient_id,
            "exercise_id": payload.exercise_id,
            "duration_seconds": payload.duration_seconds,
            "repetitions": payload.repetitions,
            "notes": payload.notes,
            "status": payload.status,
            "started_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.from_("exercise_sessions")\
            .insert(session_data)\
            .execute()
        
        if not result.data:
            raise Exception("Failed to create session")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating session: {e}")
        raise HTTPException(500, "Failed to create exercise session")

@router.patch("/{session_id}")
def update_session(session_id: str, payload: dict, request: Request):
    """Update an existing exercise session"""
    try:
        user = request.state.user
        
        # Get patient record
        patient_res = supabase.from_("patients")\
            .select("id")\
            .eq("auth_user_id", user.id)\
            .single()\
            .execute()
        
        if not patient_res.data:
            raise HTTPException(404, "Patient profile not found")
        
        patient_id = patient_res.data["id"]
        
        # Verify session belongs to this patient
        session = supabase.from_("exercise_sessions")\
            .select("*")\
            .eq("id", session_id)\
            .eq("patient_id", patient_id)\
            .single()\
            .execute()
        
        if not session.data:
            raise HTTPException(404, "Session not found")
        
        # Update session
        update_data = {}
        if "duration_seconds" in payload:
            update_data["duration_seconds"] = payload["duration_seconds"]
        if "repetitions" in payload:
            update_data["repetitions"] = payload["repetitions"]
        if "notes" in payload:
            update_data["notes"] = payload["notes"]
        if "status" in payload:
            update_data["status"] = payload["status"]
            if payload["status"] == "completed":
                update_data["completed_at"] = datetime.utcnow().isoformat()
        
        result = supabase.from_("exercise_sessions")\
            .update(update_data)\
            .eq("id", session_id)\
            .execute()
        
        if not result.data:
            raise Exception("Failed to update session")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating session: {e}")
        raise HTTPException(500, "Failed to update exercise session")

@router.get("/{session_id}")
def get_session(session_id: str, request: Request):
    """Get details of a specific session"""
    try:
        user = request.state.user
        
        # Get patient record
        patient_res = supabase.from_("patients")\
            .select("id")\
            .eq("auth_user_id", user.id)\
            .single()\
            .execute()
        
        if not patient_res.data:
            raise HTTPException(404, "Patient profile not found")
        
        patient_id = patient_res.data["id"]
        
        # Get session
        session = supabase.from_("exercise_sessions")\
            .select("*, exercises(*)")\
            .eq("id", session_id)\
            .eq("patient_id", patient_id)\
            .single()\
            .execute()
        
        if not session.data:
            raise HTTPException(404, "Session not found")
        
        return session.data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching session: {e}")
        raise HTTPException(500, "Failed to fetch session details")