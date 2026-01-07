from fastapi import APIRouter, HTTPException, Request
from database import supabase

router = APIRouter(prefix="/exercises", tags=["Exercises"])

@router.get("")
def list_exercises(request: Request):
    """Get all available exercises"""
    try:
        exercises = supabase.from_("exercises")\
            .select("*")\
            .order("name")\
            .execute()
        
        return exercises.data or []
    except Exception as e:
        print(f"Error fetching exercises: {e}")
        raise HTTPException(500, "Failed to fetch exercises")

@router.get("/{id}")
def exercise_details(id: str, request: Request):
    """Get detailed information about a specific exercise"""
    try:
        exercise = supabase.from_("exercises")\
            .select("*")\
            .eq("id", id)\
            .single()\
            .execute()
        
        if not exercise.data:
            raise HTTPException(404, "Exercise not found")
        
        return exercise.data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching exercise details: {e}")
        raise HTTPException(500, "Failed to fetch exercise details")