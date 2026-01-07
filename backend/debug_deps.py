import httpx
import gotrue
import supabase
import sys

print(f"Python: {sys.version}")
print(f"HTTPX version: {httpx.__version__}")
try:
    c = httpx.Client(proxy="http://test")
    print("httpx.Client(proxy=...) succeeded")
except Exception as e:
    print(f"httpx.Client(proxy=...) failed: {e}")

try:
    c = httpx.Client(proxies={"http://": "http://test"})
    print("httpx.Client(proxies=...) succeeded")
except Exception as e:
    print(f"httpx.Client(proxies=...) failed: {e}")

print(f"GoTrue version: {gotrue.__version__ if hasattr(gotrue, '__version__') else 'unknown'}")
