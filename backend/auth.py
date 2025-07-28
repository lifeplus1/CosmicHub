
from fastapi import HTTPException, Request
from firebase_admin import auth

async def verify_firebase_token(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    id_token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
