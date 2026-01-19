from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# --- Base Schemas ---

class DoctorBase(BaseModel):
    pass

class PatientBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    conditions: List[str] = []
    allergies: List[str] = []
    medications: List[str] = []
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    notes: Optional[str] = None

class ExerciseBase(BaseModel):
    name: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    repetitions: Optional[int] = None

class SessionBase(BaseModel):
    exercise_id: UUID
    duration_seconds: Optional[int] = None
    repetitions: Optional[int] = None
    notes: Optional[str] = None
    status: str = "in_progress"

# --- Database Models (Response Schemas) ---

class Doctor(DoctorBase):
    id: UUID
    auth_user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class Patient(PatientBase):
    id: UUID
    doctor_id: UUID
    auth_user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class Exercise(ExerciseBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ExerciseSession(SessionBase):
    id: UUID
    patient_id: UUID
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- API Payload Schemas ---

class CreatePatientRequest(PatientBase):
    sendCredentials: bool = True

class UserProfile(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    phone: Optional[str] = None
    # Common fields that might be useful
    avatar_url: Optional[str] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    # Add other updatable fields as needed

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class MessageCreate(BaseModel):
    recipient_id: UUID
    content: str
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None

class Message(BaseModel):
    id: UUID
    sender_id: UUID
    recipient_id: UUID
    content: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None
    created_at: datetime
    is_read: bool
    sender_role: str
    recipient_role: str
    
    class Config:
        from_attributes = True

