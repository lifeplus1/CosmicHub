# This file makes the astro directory a Python package.
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from ..models.preset import PresetCreate, Preset
from auth import get_current_user
from database import get_firestore_client

router = APIRouter()

@router.post("/presets", response_model=Preset)
async def create_preset(
    preset: PresetCreate,
    user: Dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_firestore_client)
):
    if not user.get("is_premium", False):
        raise HTTPException(status_code=403, detail="Premium feature required")
    doc_ref = db.collection("users").document(user["uid"]).collection("presets").document()
    # Pydantic v2: dict() deprecated -> use model_dump()
    doc_ref.set(preset.model_dump())
    return Preset(id=doc_ref.id, **preset.model_dump())

@router.get("/presets", response_model=List[Preset])
async def get_presets(
    user: Dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_firestore_client)
):
    docs = db.collection("users").document(user["uid"]).collection("presets").stream()
    return [Preset(id=doc.id, **doc.to_dict()) for doc in docs]