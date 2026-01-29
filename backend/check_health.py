
import httpx
import asyncio

async def check_health():
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("http://localhost:8000/api/v1/health")
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_health())
