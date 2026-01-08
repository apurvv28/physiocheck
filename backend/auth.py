from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import supabase

router = APIRouter(tags=["Auth"])

class AuthBody(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "patient"
    full_name: Optional[str] = None

@router.post("/login")
async def login(body: AuthBody):
    try:
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        if not res.user or not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get additional user info if doctor
        user_metadata = res.user.user_metadata or {}
        doctor_id = None
        
        if user_metadata.get("role") == "doctor":
            # Get doctor record if exists
            try:
                doctor_res = supabase.from_("doctors").select("id").eq("auth_user_id", res.user.id).maybe_single().execute()
                if doctor_res.data:
                    doctor_id = doctor_res.data["id"]
                else:
                    # Auto-create doctor profile if missing
                    new_doc = supabase.from_("doctors").insert({"auth_user_id": res.user.id}).execute()
                    if new_doc.data:
                        doctor_id = new_doc.data[0]["id"]
            except Exception as e:
                print(f"Error fetching/creating doctor profile: {e}")
                pass
        
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "expires_in": res.session.expires_in,
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "role": user_metadata.get("role", "patient"),
                "doctor_id": doctor_id
            }
        }
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/register")
async def register(body: AuthBody):
    try:
        role = body.role or "patient"
        
        auth_props = {
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "role": role,
                    "full_name": body.full_name
                }
            }
        }
        
        res = supabase.auth.sign_up(auth_props)
        
        if not res.user:
            raise HTTPException(status_code=400, detail="Registration failed")
            
        # Create profile based on role
        try:
            if role == "doctor":
                supabase.from_("doctors").insert({"auth_user_id": res.user.id}).execute()
            elif role == "patient":
                supabase.from_("patients").insert({
                    "auth_user_id": res.user.id,
                    "full_name": body.full_name or body.email.split('@')[0],
                    "email": body.email,
                    "status": "active" # Assuming default status
                }).execute()
        except Exception as e:
             print(f"Failed to create {role} profile: {e}")
             # We might want to rollback auth user here if possible, but hard with Supabase.
             # User exists but no profile.
             
        return {
            "message": "Registered successfully",
            "user_id": res.user.id,
            "email": res.user.email
        }
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail="Registration failed. Email may already be in use.")