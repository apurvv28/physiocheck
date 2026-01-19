import asyncio
# import websockets
import json
from database import supabase
import sys

async def check_database():
    print("Checking 'messages' table...")
    try:
        # Try to select
        res = supabase.from_("messages").select("id").limit(1).execute()
        print("Success: 'messages' table exists.")
    except Exception as e:
        print(f"Error: 'messages' table check failed. It might not exist. Details: {e}")
        return False
    return True

async def check_websocket():
    print("Checking WebSocket connection...")
    # We need a token. Let's try to sign in a test user or just fail if we can't.
    # Actually, we can't easily get a valid token without a real user in the script.
    # But we can try to connect without token and expect a 1008 (Auth required).
    # If we get ConnectionRefused, the server is down.
    # If we get 1008, the endpoint is up!
    
    uri = "ws://127.0.0.1:8000/api/v1/ws/chat"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! (Unexpected, expected auth failure)")
    except websockets.exceptions.InvalidStatusCode as e:
        if e.status_code == 403 or e.status_code == 1008: # 403 Forbidden / 1008 Policy Violation
             print(f"Success: WebSocket endpoint reachable (Status {e.status_code} as expected for missing token).")
        else:
             print(f"Error: WebSocket status {e.status_code}")
    except Exception as e:
        print(f"Error connecting to WebSocket: {e}")

if __name__ == "__main__":
    import platform
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    # Check DB
    loop.run_until_complete(check_database())
    
    # Check WS
    # loop.run_until_complete(check_websocket())
