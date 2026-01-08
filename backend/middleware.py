from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from database import supabase

async def supabase_auth_middleware(request: Request, call_next):
    # Skip auth for public routes
    public_routes = [
        "/api/v1/docs", 
        "/api/v1/openapi.json", 
        "/api/v1/login", 
        "/api/v1/register",
        "/api/v1/exercises",  # Add this if exercises should be public
        "/api/v1/ws", # WebSocket handshake handles its own auth via query param
        "/favicon.ico"
    ]
    
    # Allow OPTIONS requests for CORS preflight
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response
    
    # Check if route starts with public prefix
    is_public = request.url.path == "/" or any(request.url.path.startswith(route) for route in public_routes)
    
    if is_public:
        return await call_next(request)
        
    print(f"MIDDLEWARE AUTH CHECK: {request.method} {request.url.path} (Public: {is_public})")
    
    # Check Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Missing or invalid authorization header"})
    
    token = auth_header.replace("Bearer ", "")
    
    try:
        # Verify token with Supabase
        user_data = supabase.auth.get_user(token)
        
        if not user_data or not user_data.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})
        
        # Store user in request state
        request.state.user = user_data.user
        
    except Exception as e:
        with open("debug_auth.log", "a") as f:
            f.write(f"Auth error: {str(e)}\nToken start: {token[:10] if token else 'None'}\n")
        print(f"Auth middleware error: {e}")
        return JSONResponse(status_code=401, content={"detail": f"Authentication failed: {str(e)}"})
    
    response = await call_next(request)
    return response