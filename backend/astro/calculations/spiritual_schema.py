# backend/astro/calculations/spiritual_schema.py
"""
Database schema definitions for spiritual systems (Tarot + Kabbalah)
Following existing Firestore patterns from database.py
"""

from typing import Any, Dict, List, Optional, TypedDict
from datetime import datetime
from uuid import uuid4

# ===== TYPE DEFINITIONS =====

class TarotCard(TypedDict):
    """Tarot card data structure"""
    number: int
    name: str
    hebrew_letter: str
    tree_path: int
    astrology: str
    numerology: int
    connects: str
    meaning: str
    keywords: List[str]
    suit: Optional[str]  # For Minor Arcana
    element: Optional[str]  # For suit associations

class Sephirah(TypedDict):
    """Kabbalah Sephirah data structure"""
    number: int
    name: str
    hebrew: str
    english: str
    astrology: str
    tarot_association: str
    element: str
    gematria: int
    meaning: str
    keywords: List[str]
    position: str

class TreePath(TypedDict):
    """Tree of Life path data structure"""
    path: int
    connects: List[str]
    hebrew_letter: str
    major_arcana: str
    
class SpiritualReading(TypedDict):
    """Spiritual reading result structure"""
    reading_id: str
    user_id: str
    birth_date: str
    calculation_date: str
    tarot: Dict[str, Any]
    kabbalah: Dict[str, Any]
    correspondences: Dict[str, Any]
    synthesis: Dict[str, Any]

class CorrespondenceMapping(TypedDict):
    """Cross-system correspondence mapping"""
    system_1: str  # e.g., "tarot", "kabbalah", "astrology"
    element_1: str  # e.g., "The Fool", "Kether", "Aries"
    system_2: str
    element_2: str
    relationship: str  # e.g., "corresponds_to", "influences", "connects"
    traditional_source: str  # e.g., "Golden Dawn", "Sefer Yetzirah"

# ===== FIRESTORE COLLECTION STRUCTURES =====

SPIRITUAL_COLLECTIONS = {
    "tarot_cards": {
        "description": "Complete 78-card tarot deck with correspondences",
        "structure": {
            "major_arcana": "22 cards with Tree of Life path associations",
            "minor_arcana": "56 cards with sephirot associations",
            "correspondences": "Hebrew letters, astrology, numerology"
        }
    },
    "kabbalah_sephirot": {
        "description": "10 Sephirot of the Tree of Life",
        "structure": {
            "divine_emanations": "10 levels from Kether to Malkuth", 
            "planetary_associations": "Traditional astrological correspondences",
            "tarot_mappings": "Court cards and numbered cards"
        }
    },
    "tree_paths": {
        "description": "22 paths connecting the Sephirot",
        "structure": {
            "hebrew_letters": "22 Hebrew alphabet letters",
            "major_arcana": "Complete Major Arcana correspondences",
            "connections": "Which Sephirot each path connects"
        }
    },
    "spiritual_readings": {
        "description": "User spiritual analysis results", 
        "structure": {
            "user_data": "Birth information and calculation parameters",
            "results": "Tarot, Kabbalah, and cross-system analysis",
            "timestamp": "When reading was generated"
        }
    },
    "correspondence_mappings": {
        "description": "Cross-system spiritual correspondences",
        "structure": {
            "traditional_mappings": "Historical Hermetic correspondences",
            "modern_interpretations": "Contemporary spiritual synthesis",
            "source_validation": "Traditional text references"
        }
    }
}

# ===== DATABASE OPERATION SCHEMAS =====

async def create_spiritual_collections() -> Dict[str, bool]:
    """
    Create Firestore collections for spiritual systems
    Returns status of each collection creation
    """
    # This would be implemented to create the collections in Firestore
    # Following the pattern from database.py
    
    creation_status = {}
    
    for collection_name, collection_info in SPIRITUAL_COLLECTIONS.items():
        try:
            # Collection creation logic would go here
            # For now, we'll just document the structure
            creation_status[collection_name] = True
            logger.info(f"Spiritual collection '{collection_name}' schema defined")
        except Exception as e:
            logger.error(f"Error defining {collection_name} schema: {e}")
            creation_status[collection_name] = False
            
    return creation_status

def validate_tarot_card_data(card_data: Dict[str, Any]) -> bool:
    """Validate tarot card data against schema"""
    required_fields = ["number", "name", "hebrew_letter", "tree_path", "astrology", "numerology", "meaning", "keywords"]
    
    for field in required_fields:
        if field not in card_data:
            return False
            
    if not isinstance(card_data["keywords"], list):
        return False
        
    return True

def validate_sephirah_data(seph_data: Dict[str, Any]) -> bool:
    """Validate sephirah data against schema"""
    required_fields = ["number", "name", "hebrew", "english", "astrology", "meaning", "keywords"]
    
    for field in required_fields:
        if field not in seph_data:
            return False
            
    if not isinstance(seph_data["keywords"], list):
        return False
        
    return True

def generate_spiritual_reading_id() -> str:
    """Generate unique ID for spiritual readings"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"spiritual_{timestamp}_{uuid4().hex[:8]}"

# ===== DATA SEEDING FUNCTIONS =====

def get_initial_tarot_data() -> List[TarotCard]:
    """Get initial tarot card data for database seeding"""
    # This would return the MAJOR_ARCANA data from spiritual.py
    # formatted for database insertion
    return []

def get_initial_sephirot_data() -> List[Sephirah]:
    """Get initial sephirot data for database seeding"""  
    # This would return the SEPHIROT data from spiritual.py
    # formatted for database insertion
    return []

def get_initial_path_data() -> List[TreePath]:
    """Get initial Tree of Life path data for database seeding"""
    # This would return the TREE_PATHS data from spiritual.py
    # formatted for database insertion
    return []

def get_traditional_correspondences() -> List[CorrespondenceMapping]:
    """Get traditional Hermetic correspondence mappings"""
    # This would return verified traditional correspondences
    # from Golden Dawn and other authentic sources
    return []

# ===== INTEGRATION WITH EXISTING SYSTEM =====

def extend_chart_data_schema(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extend existing chart data structure to include spiritual systems"""
    
    if "spiritual_systems" not in chart_data:
        chart_data["spiritual_systems"] = {
            "tarot": {},
            "kabbalah": {},
            "correspondences": {},
            "synthesis": {}
        }
        
    return chart_data

def create_spiritual_user_profile(user_id: str, birth_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create spiritual profile data structure for user"""
    
    return {
        "user_id": user_id,
        "spiritual_profile": {
            "life_path_tarot": {},
            "primary_sephirah": {},
            "secondary_sephirah": {},
            "active_paths": [],
            "spiritual_focus": "",
            "last_updated": datetime.now().isoformat()
        },
        "preferences": {
            "tarot_deck_style": "traditional",
            "kabbalah_tradition": "golden_dawn",
            "correspondence_system": "hermetic",
            "daily_guidance": True
        }
    }

# ===== LOGGING =====

import logging
logger = logging.getLogger(__name__)

# ===== EXPORTS =====

__all__ = [
    "TarotCard",
    "Sephirah", 
    "TreePath",
    "SpiritualReading",
    "CorrespondenceMapping",
    "SPIRITUAL_COLLECTIONS",
    "create_spiritual_collections",
    "validate_tarot_card_data",
    "validate_sephirah_data",
    "generate_spiritual_reading_id",
    "extend_chart_data_schema",
    "create_spiritual_user_profile"
]
