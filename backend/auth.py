# backend/auth.py
from fastapi import HTTPException, Depends
from firebase_admin import auth
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
  try:
    token = credentials.credentials
    decoded_token = auth.verify_id_token(token)
    return decoded_token['uid']
  except Exception as e:
    raise HTTPException(status_code=401, detail="Invalid token")