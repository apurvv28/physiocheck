from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from database import supabase
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, patient_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[patient_id] = websocket

    def disconnect(self, patient_id: str):
        if patient_id in self.active_connections:
            del self.active_connections[patient_id]

    async def send_message(self, patient_id: str, message: dict):
        if patient_id in self.active_connections:
            try:
                await self.active_connections[patient_id].send_json(message)
            except Exception as e:
                print(f"Error sending message to {patient_id}: {e}")
                self.disconnect(patient_id)

manager = ConnectionManager()

@router.websocket("/ws/doctor/monitor/{patient_id}")
async def monitor_patient(
    websocket: WebSocket, 
    patient_id: str,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for doctors to monitor patient exercise sessions in real-time.
    Requires authentication token as query parameter.
    """
    # Authenticate the connection
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    try:
        # Verify the token
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            await websocket.close(code=1008, reason="Invalid authentication token")
            return
        
        # Verify user is a doctor
        if user.user.user_metadata.get("role") != "doctor":
            await websocket.close(code=1008, reason="Unauthorized: Doctor access only")
            return
        
        # Verify patient belongs to this doctor
        patient = supabase.from_("patients")\
            .select("id, full_name")\
            .eq("id", patient_id)\
            .eq("doctor_id", user.user.id)\
            .single()\
            .execute()
        
        if not patient.data:
            await websocket.close(code=1008, reason="Patient not found or unauthorized")
            return
        
    except Exception as e:
        print(f"WebSocket auth error: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Connection authenticated, proceed with monitoring
    await manager.connect(patient_id, websocket)
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "patient_id": patient_id,
            "patient_name": patient.data["full_name"],
            "timestamp": None
        })
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Receive data from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                
                elif message.get("type") == "request_update":
                    # Send current patient status
                    # In a real app, fetch latest session data
                    await websocket.send_json({
                        "type": "status_update",
                        "patient_id": patient_id,
                        "status": "monitoring"
                    })
                    
            except WebSocketDisconnect:
                print(f"WebSocket disconnected for patient {patient_id}")
                break
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                print(f"Error in WebSocket loop: {e}")
                break
                
    except Exception as e:
        print(f"WebSocket error for patient {patient_id}: {e}")
    finally:
        manager.disconnect(patient_id)
        try:
            await websocket.close()
        except:
            pass

@router.websocket("/ws/patient/session")
async def patient_session(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for patients to stream exercise session data.
    Requires authentication token as query parameter.
    """
    # Authenticate the connection
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    try:
        # Verify the token
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            await websocket.close(code=1008, reason="Invalid authentication token")
            return
        
        # Get patient record
        patient = supabase.from_("patients")\
            .select("id")\
            .eq("auth_user_id", user.user.id)\
            .single()\
            .execute()
        
        if not patient.data:
            await websocket.close(code=1008, reason="Patient profile not found")
            return
        
        patient_id = patient.data["id"]
        
    except Exception as e:
        print(f"WebSocket auth error: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    await websocket.accept()
    
    try:
        await websocket.send_json({
            "type": "connected",
            "patient_id": patient_id
        })
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle exercise data streaming
                if message.get("type") == "exercise_data":
                    # Process and potentially broadcast to monitoring doctors
                    # For now, just acknowledge receipt
                    await websocket.send_json({
                        "type": "acknowledged",
                        "timestamp": message.get("timestamp")
                    })
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Error in patient session WebSocket: {e}")
                break
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass