from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import supabase

router = APIRouter(prefix="/auth", tags=["Auth"])

class AuthBody(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def login(body: AuthBody):
    try:
        res = supabase.auth.sign_in_with_password(body.model_dump())
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
        # Default role to doctor for now (or make it selectable)
        if "options" not in body.model_dump():
             # Initialize metadata with role if not present
             body.email = body.email # dummy touch
        
        # We need to pass metadata. Currently pydantic model doesn't support it directly in signature.
        # Let's use the underlying call.
        
        # Force doctor role for registration for this app context
        auth_props = {
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "role": "doctor"
                }
            }
        }
        
        res = supabase.auth.sign_up(auth_props)
        
        if not res.user:
            raise HTTPException(status_code=400, detail="Registration failed")
            
        # Auto-create doctor profile
        try:
             supabase.from_("doctors").insert({"auth_user_id": res.user.id}).execute()
        except Exception as e:
             print(f"Failed to create doctor profile: {e}")
             
        return {
            "message": "Registered successfully",
            "user_id": res.user.id,
            "email": res.user.email
        }
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail="Registration failed. Email may already be in use.")