from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from database import supabase
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Map patient_id -> WebSocket
        self.patient_connections: dict[str, WebSocket] = {}
        # Map patient_id -> List[WebSocket] (multiple doctors might monitor same patient)
        self.doctor_connections: dict[str, list[WebSocket]] = {}

    async def connect_patient(self, patient_id: str, websocket: WebSocket):
        await websocket.accept()
        self.patient_connections[patient_id] = websocket

    async def disconnect_patient(self, patient_id: str):
        if patient_id in self.patient_connections:
            del self.patient_connections[patient_id]
        # Notify doctors?
        
    async def connect_doctor(self, patient_id: str, websocket: WebSocket):
        await websocket.accept()
        if patient_id not in self.doctor_connections:
            self.doctor_connections[patient_id] = []
        self.doctor_connections[patient_id].append(websocket)
        print(f"DEBUG: Doctor connected for {patient_id}. Total docs: {len(self.doctor_connections[patient_id])}. Active keys: {list(self.doctor_connections.keys())}")

    def disconnect_doctor(self, patient_id: str, websocket: WebSocket):
        if patient_id in self.doctor_connections:
            if websocket in self.doctor_connections[patient_id]:
                self.doctor_connections[patient_id].remove(websocket)
            if not self.doctor_connections[patient_id]:
                del self.doctor_connections[patient_id]
        print(f"DEBUG: Doctor disconnected for {patient_id}. Active keys: {list(self.doctor_connections.keys())}")

    async def signal_to_doctor(self, patient_id: str, message: dict):
        # Patient sends signal to doctor(s)
        if patient_id in self.doctor_connections:
            # print(f"DEBUG: Signaling doctor for patient {patient_id}, type={message.get('type')}")
            for socket in self.doctor_connections[patient_id]:
                try:
                    await socket.send_json(message)
                except Exception as e:
                    print(f"Error signaling doctor: {e}")
        else:
            print(f"DEBUG: No doctor connected for patient {patient_id}. Active keys: {list(self.doctor_connections.keys())}")

    async def signal_to_patient(self, patient_id: str, message: dict):
        # Doctor sends signal to patient
        if patient_id in self.patient_connections:
            # print(f"DEBUG: Signaling patient {patient_id}, type={message.get('type')}")
            try:
                await self.patient_connections[patient_id].send_json(message)
            except Exception as e:
                print(f"Error signaling patient: {e}")
        else:
            print(f"DEBUG: Patient {patient_id} not connected/found for signal. Active keys: {list(self.patient_connections.keys())}")

manager = ConnectionManager()

@router.websocket("/ws/doctor/monitor/{session_id}")
async def monitor_patient(
    websocket: WebSocket, 
    session_id: str,
    token: Optional[str] = Query(None)
):
    print(f"DEBUG: Entering monitor_patient for session_id={session_id}")
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
        role = user.user.user_metadata.get("role")
        if role != "doctor":
            await websocket.close(code=1008, reason="Unauthorized: Doctor access only")
            return
        
        # Fetch session to get patient_id
        session_res = supabase.from_("exercise_sessions")\
            .select("patient_id, patients(full_name)")\
            .eq("id", session_id)\
            .limit(1)\
            .execute()
        
        if not session_res.data or len(session_res.data) == 0:
            print("DEBUG: Session not found")
            await websocket.close(code=1008, reason="Session not found")
            return
            
        session_data = session_res.data[0]
        patient_id = session_data["patient_id"]
        # Handle potential nested dict from join or manual extraction
        patient_name = session_data.get("patients", {}).get("full_name", "Unknown Patient")
        
    except Exception as e:
        print(f"WebSocket auth error: {e}")
        import traceback
        traceback.print_exc()
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Connection authenticated, proceed with monitoring
    doctor_name = user.user.user_metadata.get("full_name", "Doctor")
    print(f"DEBUG: Authentication successful for patient {patient_id} by {doctor_name}, accepting connection")
    await manager.connect_doctor(patient_id, websocket)
    
    # Notify patient that doctor has joined
    await manager.signal_to_patient(patient_id, {
        "type": "doctor_connected",
        "doctor_name": doctor_name
    })
    
    try:
        # Send initial connection confirmation to doctor
        await websocket.send_json({
            "type": "connected",
            "patient_id": patient_id,
            "patient_name": patient_name,
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
                
                elif message.get("type") == "signal":
                    # Forward WebRTC signal to patient
                    await manager.signal_to_patient(patient_id, message)

                elif message.get("type") == "request_update":
                    # Send current patient status
                     await websocket.send_json({
                        "type": "status_update",
                        "patient_id": patient_id,
                        "status": "monitoring"
                    })

                elif message.get("type") == "session_ended":
                    await manager.signal_to_patient(patient_id, {
                         "type": "session_ended",
                         "reason": "Doctor ended session"
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
        manager.disconnect_doctor(patient_id, websocket)
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
            .limit(1)\
            .execute()
        
        if not patient.data or len(patient.data) == 0:
            await websocket.close(code=1008, reason="Patient profile not found")
            return
        
        patient_id = patient.data[0]["id"]
        
    except Exception as e:
        print(f"WebSocket auth error: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    await manager.connect_patient(patient_id, websocket)
    
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
                    
                    # ALSO broadcast data to doctor for live preview (simulated stats)
                    # In real app, we'd process analysis here
                    await manager.signal_to_doctor(patient_id, {
                        **message,
                        "type": "exercise_update" 
                    })

                elif message.get("type") == "session_ended":
                    await manager.signal_to_doctor(patient_id, {
                        "type": "session_ended",
                        "reason": "Patient ended session"
                    })

                elif message.get("type") == "signal":
                    # Forward WebRTC signal to doctor
                    await manager.signal_to_doctor(patient_id, message)
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Error in patient session WebSocket: {e}")
                break
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await manager.disconnect_patient(patient_id)
        try:
            await websocket.close()
        except:
            pass