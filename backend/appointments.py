from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from database import supabase
import httpx
import os
import datetime
import json
from notifications import create_notification

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/oauth2/callback")

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# --- Schemas ---
class CreateAppointmentPayload(BaseModel):
    patient_id: str
    appointment_mode: str  # 'virtual' or 'in_clinic'
    appointment_date: str  # YYYY-MM-DD
    start_time: str        # HH:MM
    end_time: str          # HH:MM
    notes: Optional[str] = None

class UpdateAppointmentPayload(BaseModel):
    appointment_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: Optional[str] = None # scheduled, completed, cancelled
    notes: Optional[str] = None

# --- Helper: Google Calendar ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

async def create_google_calendar_event(doctor_id: str, appointment: dict, patient_email: str):
    """
    Creates a Google Calendar event with Meet link.
    Requires doctor to have a stored refresh_token.
    """
    try:
        # 1. Get Doctor's Google Refresh Token
        # NOTE: This assumes the 'doctors' table has 'google_refresh_token'.
        # If not present, this will fail or return None.
        doc_res = supabase.from_("doctors").select("google_refresh_token").eq("id", doctor_id).single().execute()
        
        refresh_token = None
        if doc_res.data:
            refresh_token = doc_res.data.get("google_refresh_token")
            
        if not refresh_token:
            print(f"No Google refresh token found for doctor {doctor_id}")
            # We will generate a mock link if no token is found, to allow testing without real auth.
            # In production, this should raise an error.
            return {"id": "mock_event_id", "meet_link": "https://meet.google.com/mock-link-abc-def"}

        # 2. Refresh Access Token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(token_url, data=data)
            if resp.status_code != 200:
                print(f"Failed to refresh token: {resp.text}")
                return None
            
            access_token = resp.json()["access_token"]
            
        # 3. Create Event
        event_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1"
        
        start_datetime = f"{appointment['appointment_date']}T{appointment['start_time']}:00"
        end_datetime = f"{appointment['appointment_date']}T{appointment['end_time']}:00"
        
        event_body = {
            "summary": "PhysioCheck Appointment",
            "description": f"Appointment with patient. Notes: {appointment.get('notes', '')}",
            "start": {
                "dateTime": start_datetime,
                "timeZone": "UTC" # Should ideally be doctor's timezone
            },
            "end": {
                "dateTime": end_datetime,
                "timeZone": "UTC"
            },
            "attendees": [
                {"email": patient_email}
            ],
            "conferenceData": {
                "createRequest": {
                    "requestId": f"meet-{appointment['patient_id']}-{datetime.datetime.now().timestamp()}",
                    "conferenceSolutionKey": {"type": "hangoutsMeet"}
                }
            }
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(event_url, json=event_body, headers=headers)
            if resp.status_code != 200:
                print(f"Failed to create event: {resp.text}")
                return None
            
            event_data = resp.json()
            return {
                "id": event_data["id"],
                "meet_link": event_data.get("conferenceData", {}).get("entryPoints", [{}])[0].get("uri")
            }
            
    except Exception as e:
        print(f"Google Calendar Error: {e}")
        return None

# --- Endpoints ---

class GoogleAuthRequest(BaseModel):
    code: str

@router.post("/google-auth/exchange")
async def exchange_google_code(payload: GoogleAuthRequest, request: Request):
    """
    Exchanges the authorization code for an access token and refresh token,
    and stores the refresh token in the doctor's profile.
    """
    try:
        current_user = request.state.user
        role = current_user.user_metadata.get("role")
        
        if role != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can link Google Calendar")

        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
             raise HTTPException(status_code=500, detail="Google credentials not configured on server")

        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": payload.code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(token_url, data=data)
        
        if resp.status_code != 200:
            print(f"Token exchange failed: {resp.text}")
            raise HTTPException(status_code=400, detail=f"Failed to exchange code")

        tokens = resp.json()
        refresh_token = tokens.get("refresh_token")
        
        if refresh_token:
            # Update doctor profile
            # 1. Get doctor ID from auth_user_id
            doc_res = supabase.from_("doctors").select("id").eq("auth_user_id", current_user.id).single().execute()
            if doc_res.data:
                 doctor_id = doc_res.data["id"]
                 # 2. Update
                 supabase.table("doctors").update({"google_refresh_token": refresh_token}).eq("id", doctor_id).execute()
        
        return {"status": "success", "connected": True}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google Auth Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_appointment(payload: CreateAppointmentPayload, request: Request):
    try:
        current_user = request.state.user
        role = current_user.user_metadata.get("role")
        
        if role != "doctor":
            raise HTTPException(status_code=403, detail="Only doctors can create appointments")
            
        # Get doctor DB ID
        doc_res = supabase.from_("doctors").select("id").eq("auth_user_id", current_user.id).single().execute()
        if not doc_res.data:
             raise HTTPException(status_code=404, detail="Doctor profile not found")
        doctor_id = doc_res.data["id"]
        
        # Prepare Data
        appt_data = {
            "patient_id": payload.patient_id,
            "doctor_id": doctor_id,
            "appointment_mode": payload.appointment_mode,
            "appointment_date": payload.appointment_date,
            "start_time": payload.start_time,
            "end_time": payload.end_time,
            "notes": payload.notes,
            "status": "scheduled"
        }
        
        # Google Calendar Logic (if virtual)
        if payload.appointment_mode == "virtual":
            # Fetch patient email for invite
            pat_res = supabase.from_("patients").select("email").eq("id", payload.patient_id).single().execute()
            if pat_res.data:
                patient_email = pat_res.data["email"]
                
                # Call helper
                g_event = await create_google_calendar_event(doctor_id, appt_data, patient_email)
                
                if g_event:
                    appt_data["google_event_id"] = g_event.get("id")
                    appt_data["google_meet_link"] = g_event.get("meet_link")
                else:
                    # If failed, maybe warn? For now we proceed but without link, or use mock.
                    pass
        
        # Insert into DB
        res = supabase.from_("appointments").insert(appt_data).execute()
        
        if not res.data:
             raise HTTPException(status_code=500, detail="Failed to create appointment")
             
        # Notify Patient
        try:
            # Get patient auth id
            p_auth_res = supabase.from_("patients").select("auth_user_id").eq("id", payload.patient_id).single().execute()
            if p_auth_res.data:
                create_notification(
                    user_id=p_auth_res.data["auth_user_id"],
                    title="New Appointment",
                    message=f"You have a new appointment on {payload.appointment_date} at {payload.start_time}",
                    type="info"
                )
        except Exception as e:
            print(f"Notification error: {e}")
            
        return res.data[0]
        
    except Exception as e:
        print(f"Error creating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def list_appointments(request: Request, patient_id: Optional[str] = None, doctor_id: Optional[str] = None):
    try:
        current_user = request.state.user
        role = current_user.user_metadata.get("role")
        
        query = supabase.from_("appointments").select("*, patients(full_name)")
        
        if role == "doctor":
            # If specifically asking for a patient's appointments
            if patient_id:
                query = query.eq("patient_id", patient_id)
            else:
                # Get this doctor's appointments
                doc_res = supabase.from_("doctors").select("id").eq("auth_user_id", current_user.id).single().execute()
                if doc_res.data:
                     query = query.eq("doctor_id", doc_res.data["id"])
        elif role == "patient":
            # Only see own appointments
            pat_res = supabase.from_("patients").select("id").eq("auth_user_id", current_user.id).single().execute()
            if pat_res.data:
                query = query.eq("patient_id", pat_res.data["id"])
                
        # Order by date/time
        query = query.order("appointment_date", desc=True).order("start_time", desc=True)
        
        res = query.execute()
        return res.data or []
        
    except Exception as e:
        print(f"List appointments error: {e}")
        return []

@router.patch("/{appointment_id}")
async def update_appointment(appointment_id: str, payload: UpdateAppointmentPayload, request: Request):
    try:
        # Just basic update for now
        data = {k: v for k, v in payload.dict().items() if v is not None}
        res = supabase.from_("appointments").update(data).eq("id", appointment_id).execute()
        return res.data
    except Exception as e:
        print(f"Update error: {e}")
        raise HTTPException(status_code=500, detail="Update failed")

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: str, request: Request):
    try:
        # TODO: Delete from Google Calendar if exists
        res = supabase.from_("appointments").delete().eq("id", appointment_id).execute()
        return {"status": "success"}
    except Exception as e:
        print(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail="Delete failed")
