from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, UploadFile, File
from typing import Optional, List, Dict
from database import supabase
from schemas import MessageCreate, Message
import json
from datetime import datetime
import uuid
import logging
import sys

# Configure logging explicitly for this module
logger = logging.getLogger("chat_module")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler('chat_debug.log')
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(message)s'))
logger.addHandler(handler)

router = APIRouter(tags=["Chat"])

class ChatConnectionManager:
    def __init__(self):
        # Map user_id -> List[WebSocket] (user might have multiple tabs/devices)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.debug(f"DEBUG: User {user_id} connected to chat. Active sessions: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.debug(f"DEBUG: User {user_id} disconnected from chat.")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.debug(f"Error sending message to {user_id}: {e}")

manager = ChatConnectionManager()

@router.websocket("/ws/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time chat.
    Authentication via Supabase token.
    """
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return

    try:
        # Verify token
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            await websocket.close(code=1008, reason="Invalid authentication token")
            return
        
        user_id = user.user.id
        
        # Determine sender role (doctor or patient)
        # In a real app we might cache this or check DB, 
        # but for now we trust metadata or just use ID for routing.
        # Ideally we want to know if they are 'doctor' or 'patient' to fill DB fields properly.
        user_role = user.user.user_metadata.get("role", "patient")

        await manager.connect(user_id, websocket)

        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Expecting: { recipient_id: str, content: str, type: 'text'|'attachment', ... }
                logger.debug(f"DEBUG: Received chat message from {user_id}: {message_data}")
                
                start_time = datetime.utcnow()
                
                # 1. Save to Database
                recipient_id = message_data.get("recipient_id")
                content = message_data.get("content")
                
                if not recipient_id:
                     logger.debug("DEBUG: Missing recipient_id")
                     continue

                new_msg = {
                    "sender_id": user_id,
                    "recipient_id": recipient_id,
                    "content": content,
                    "sender_role": user_role,
                    "recipient_role": "patient" if user_role == "doctor" else "doctor", 
                    "created_at": start_time.isoformat()
                }

                logger.debug(f"DEBUG: Attempting to insert msg: {new_msg}")

                # Save to Supabase
                try:
                    db_res = supabase.from_("messages").insert(new_msg).execute()
                    logger.debug(f"DEBUG: Insert result: {db_res}")
                except Exception as db_err:
                    logger.debug(f"DEBUG: Database insert error: {db_err}")
                    # If table doesn't exist or policy fails
                    continue
                
                if db_res.data:
                    saved_msg = db_res.data[0]
                    logger.debug(f"DEBUG: Message saved, broadcasting to {recipient_id}")
                    
                    # 2. Forward to Recipient
                    await manager.send_personal_message({
                        "type": "new_message",
                        "message": saved_msg
                    }, recipient_id)
                    
                    # 3. Echo back to Sender
                    await manager.send_personal_message({
                        "type": "message_sent",
                        "message": saved_msg
                    }, user_id)
                else:
                    logger.debug("DEBUG: No data returned from insert")

        except WebSocketDisconnect:
            manager.disconnect(user_id, websocket)
        except Exception as e:
            logger.debug(f"Error in chat loop: {e}")
            manager.disconnect(user_id, websocket)
            
    except Exception as e:
        logger.debug(f"Chat Auth Error: {e}")
        await websocket.close(code=1008, reason="Authentication failed")

@router.get("/chat/history/{other_user_id}")
async def get_chat_history(other_user_id: str, token: str = Query(...)):
    """
    Fetch chat history between current user and other_user_id
    """
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    current_user_id = user.user.id
    
    # Fetch messages where (sender=me AND recipient=other) OR (sender=other AND recipient=me)
    # Supabase doesn't support complex OR queries easily in one go with JS/Python client sometimes without raw SQL or 'or' filter string.
    # .or_(f"and(sender_id.eq.{current_user_id},recipient_id.eq.{other_user_id}),and(sender_id.eq.{other_user_id},recipient_id.eq.{current_user_id})")
    
    try:
        # Fetch sent messages
        sent_res = supabase.from_("messages")\
            .select("*")\
            .eq("sender_id", current_user_id)\
            .eq("recipient_id", other_user_id)\
            .execute()
            
        # Fetch received messages
        received_res = supabase.from_("messages")\
            .select("*")\
            .eq("sender_id", other_user_id)\
            .eq("recipient_id", current_user_id)\
            .execute()
            
        all_messages = sent_res.data + received_res.data
        # Sort by created_at. ISO strings sort correctly.
        all_messages.sort(key=lambda x: x['created_at'])
        
        return all_messages
    except Exception as e:
        logger.debug(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat history")

@router.post("/chat/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    token: str = Query(...) # In form data, might need specific handling
):
    # TODO: Implement file upload to Supabase Storage
    # For now, return a mock URL
    return {"url": f"https://mock-storage.com/{file.filename}", "type": file.content_type}
