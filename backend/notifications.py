from fastapi import APIRouter, HTTPException, Request
from database import supabase
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationBase(BaseModel):
    id: UUID
    title: str
    message: str
    type: str # info, success, warning, error
    is_read: bool
    created_at: datetime

def create_notification(user_id: str, title: str, message: str, type: str = "info", data: dict = {}):
    """
    Helper to create a notification.
    Designed to be used internally by other modules.
    """
    try:
        payload = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": type,
            "data": data,
            "is_read": False
        }
        res = supabase.from_("notifications").insert(payload).execute()
        return res
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None

@router.get("", response_model=List[NotificationBase])
def get_notifications(request: Request):
    try:
        user = request.state.user
        
        # specific policy should handle filtering by user_id
        res = supabase.from_("notifications")\
            .select("*")\
            .eq("user_id", user.id)\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()
            
        return res.data or []
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []

@router.post("/{notification_id}/read")
def mark_read(notification_id: str, request: Request):
    try:
        user = request.state.user
        
        res = supabase.from_("notifications")\
            .update({"is_read": True})\
            .eq("id", notification_id)\
            .eq("user_id", user.id)\
            .execute()
            
        return {"status": "success"}
    except Exception as e:
         raise HTTPException(status_code=500, detail="Failed to mark as read")

@router.post("/read-all")
def mark_all_read(request: Request):
    try:
        user = request.state.user
        
        res = supabase.from_("notifications")\
            .update({"is_read": True})\
            .eq("user_id", user.id)\
            .execute()
            
        return {"status": "success"}
    except Exception as e:
         raise HTTPException(status_code=500, detail="Failed to mark all as read")
