from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from middleware import supabase_auth_middleware
from auth import router as auth_router
from doctor import router as doctor_router
from patients import router as patient_router
from exercises import router as exercises_router
from sessions import router as sessions_router
from websocket import router as websocket_router

app = FastAPI(
    title="PhysioCheck Backend",
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json"
)

# Auth middleware
app.middleware("http")(supabase_auth_middleware)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# API routers with prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(doctor_router, prefix="/api/v1")
app.include_router(patient_router, prefix="/api/v1")
app.include_router(exercises_router, prefix="/api/v1")
app.include_router(sessions_router, prefix="/api/v1")
app.include_router(websocket_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"status": "PhysioCheck backend running"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy"}