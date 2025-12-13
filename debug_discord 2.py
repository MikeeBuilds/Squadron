import os
import requests
from dotenv import load_dotenv

# Load env from the Squadron-Repo folder
load_dotenv(dotenv_path="/Users/algohussle/Documents/builds/money-bot/Squadron-Repo/.env")

url = os.getenv("DISCORD_WEBHOOK_URL")
print(f"DEBUG: Loaded URL: {url[:30]}... (masked)" if url else "DEBUG: URL is None")

if not url:
    print("❌ Error: No webhook URL found in .env")
    exit(1)

payload = {
    "username": "Squadron Debugger",
    "content": "🔔 Test message from debug script!"
}

print("Attempting to send request...")
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code in [200, 204]:
        print("✅ Success! Discord webhook is working.")
    else:
        print("❌ Failed to send.")
except Exception as e:
    print(f"❌ Exception: {e}")
