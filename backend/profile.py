from fastapi import APIRouter, HTTPException, Request
from database import supabase
from schemas import UserProfile, UserProfileUpdate, ChangePasswordRequest
from email_service import send_email

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("/me", response_model=UserProfile)
def get_my_profile(request: Request):
    try:
        user = request.state.user
        role = user.user_metadata.get("role", "patient")
        
        profile_data = {
            "id": user.id,
            "email": user.email,
            "role": role,
            "full_name": user.user_metadata.get("full_name"),
            "phone": user.user_metadata.get("phone")  # Standardize phone storage in metadata for consistency if possible
        }

        if role == "doctor":
            # For doctors, we rely mostly on auth metadata, but check stats table if needed
            # For now, return what we have in auth + metadata
            pass
            
        elif role == "patient":
            # Fetch from patients table for authoritative data
            patient_res = supabase.from_("patients").select("*").eq("auth_user_id", user.id).maybe_single().execute()
            if patient_res.data:
                p_data = patient_res.data
                profile_data["full_name"] = p_data.get("full_name")
                profile_data["phone"] = p_data.get("phone")
                # Add other patient specific fields if needed
        
        return profile_data

    except Exception as e:
        print(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.put("/me")
def update_my_profile(payload: UserProfileUpdate, request: Request):
    try:
        user = request.state.user
        role = user.user_metadata.get("role", "patient")
        
        update_data = {}
        if payload.full_name is not None:
            update_data["full_name"] = payload.full_name
        if payload.phone is not None:
            update_data["phone"] = payload.phone
            
        if not update_data:
            return {"message": "No changes requested"}

        # 1. Update Auth Metadata (Best practice to keep basic info in sync)
        try:
            supabase.auth.update_user({
                "data": update_data
            })
        except Exception as e:
            print(f"Warning: Failed to update auth metadata: {e}")

        # 2. Update Role-specific tables
        if role == "patient":
            # Map simplified keys to table keys if they differ
            table_update = {}
            if payload.full_name: table_update["full_name"] = payload.full_name
            if payload.phone: table_update["phone"] = payload.phone
            
            if table_update:
                supabase.from_("patients").update(table_update).eq("auth_user_id", user.id).execute()
        
        elif role == "doctor":
            # Doctors might implement a table update later if we add a robust doctors table
            # For now, auth metadata is the primary store for name/phone for doctors in this system
            pass

        return {"status": "success", "message": "Profile updated successfully"}

    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, request: Request):
    try:
        user = request.state.user
        
        # 1. Verify old password by attempting to sign in
        try:
            res = supabase.auth.sign_in_with_password({
                "email": user.email,
                "password": payload.old_password
            })
            
            if not res.user or not res.session:
                raise HTTPException(status_code=400, detail="Incorrect current password")
                
        except Exception as e:
            # Need to catch potential auth errors from supabase client
            print(f"Password verification failed: {e}")
            raise HTTPException(status_code=400, detail="Incorrect current password")
            
        # 2. Update to new password
        try:
            update_res = supabase.auth.update_user({
                "password": payload.new_password
            })
            
            if not update_res.user:
                 raise Exception("Update user returned no user")
            
            # 3. Send Email Alert
            try:
                send_email(
                    to=user.email,
                    subject="Security Alert: Password Changed",
                    content=f"Hello,\n\nYour password for PhysioCheck was successfully changed.\n\nIf this wasn't you, please contact support immediately."
                )
            except Exception as e:
                print(f"Failed to send password change alert: {e}")

        except Exception as e:
            print(f"Failed to update password: {e}")
            raise HTTPException(status_code=500, detail="Failed to update password")
            
        return {"status": "success", "message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail="Failed to change password")
