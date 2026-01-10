import os
from dotenv import load_dotenv
import httpx
# Monkey patch to fix compatibility issue between Supabase/GoTrue and installed HTTPX
# The installed httpx claims to be 0.25.2 but rejects 'proxy' arg, accepting 'proxies' instead.
original_client_init = httpx.Client.__init__

def patched_client_init(self, *args, **kwargs):
    if "proxy" in kwargs:
        kwargs["proxies"] = kwargs.pop("proxy")
    original_client_init(self, *args, **kwargs)

httpx.Client.__init__ = patched_client_init


from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing Supabase environment variables")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)
