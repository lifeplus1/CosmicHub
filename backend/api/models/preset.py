from pydantic import BaseModel


class PresetCreate(BaseModel):
    frequency: float
    binaural_offset: float = 0.0
    waveform: str = "sine"
    name: str


class Preset(PresetCreate):
    id: str
