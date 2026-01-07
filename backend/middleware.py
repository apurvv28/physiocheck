from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from database import supabase

async def supabase_auth_middleware(request: Request, call_next):
    # Skip auth for public routes
    public_routes = [
        "/api/v1/docs", 
        "/api/v1/openapi.json", 
        "/api/v1/auth/login", 
        "/api/v1/auth/register",
        "/api/v1/exercises",  # Add this if exercises should be public
        "/favicon.ico"
    ]
    
    # Allow OPTIONS requests for CORS preflight
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response
    
    # Check if route starts with public prefix
    if request.url.path == "/" or any(request.url.path.startswith(route) for route in public_routes):
        response = await call_next(request)
        return response
    
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
        print(f"Auth middleware error: {e}")
        return JSONResponse(status_code=401, content={"detail": "Authentication failed"})
    
    response = await call_next(request)
    return response