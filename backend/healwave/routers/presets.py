# This file makes the astro directory a Python package.
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from ..models.preset import PresetCreate, Preset
from ...auth import get_current_user
from ...database import get_db

router = APIRouter()

@router.post("/presets", response_model=dict)
async def create_preset(preset: PresetCreate, user=Depends(get_current_user), db=Depends(get_db)):
    if not user.get("is_premium", False):
        raise HTTPException(status_code=403, detail="Premium feature required")
    doc_ref = db.collection("users").document(user["uid"]).collection("presets").document()
    doc_ref.set(preset.dict())
    return {"id": doc_ref.id, "message": "Preset saved"}

@router.get("/presets", response_model=list[Preset])
async def get_presets(user=Depends(get_current_user), db=Depends(get_db)):
    docs = db.collection("users").document(user["uid"]).collection("presets").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]