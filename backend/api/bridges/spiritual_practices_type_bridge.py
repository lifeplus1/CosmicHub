# backend/api/bridges/spiritual_practices_type_bridge.py
"""
Spiritual Practices Type Bridge - Safe conversion for spiritual practice data
Handles meditation guides, tarot readings, and tree of life connections
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger(__name__)

class SpiritualPracticesTypeBridge:
    """
    Type-safe bridge for spiritual practices data
    """
    
    @staticmethod
    def safe_list_conversion(value: Any) -> List[str]:
        """
        Safely convert various types to List[str] for spiritual practice data
        Handles the mypy union type checking issues
        """
        if value is None:
            return []
        
        if isinstance(value, list):
            # Already a list, ensure all items are strings with type suppression for Any handling
            result: List[str] = []
            for item in value:  # type: ignore[misc]
                if item is not None:
                    result.append(str(item))  # type: ignore[arg-type]
            return result
        
        if isinstance(value, str):
            # Single string, convert to list
            return [value]
        
        if isinstance(value, dict):
            # Dict type, extract meaningful string representations
            return [str(v) for v in value.values() if v is not None]  # type: ignore[arg-type]
        
        # Fallback for any other type
        return [str(value)]  # type: ignore[arg-type]
    
    @staticmethod
    def safe_meditation_dict_creation(
        selected_card: str,
        meditation_type: str,
        preparation: Any,
        meditation_guide: Any,
        tree_connection: Any,
        integration_prompts: Any,
        user_level: Any,
        duration_override: Optional[int] = None
    ) -> Dict[str, Union[str, List[str]]]:
        """
        Create meditation dictionary with proper type safety
        Resolves mypy union type checking issues
        """
        # Safely convert all potentially problematic union types
        safe_preparation = SpiritualPracticesTypeBridge.safe_list_conversion(preparation)
        safe_meditation_guide = SpiritualPracticesTypeBridge.safe_list_conversion(meditation_guide)
        safe_tree_connection = SpiritualPracticesTypeBridge.safe_list_conversion(tree_connection)
        safe_integration_prompts = SpiritualPracticesTypeBridge.safe_list_conversion(integration_prompts)
        
        # Determine duration based on user level
        if duration_override is not None:
            duration = str(duration_override)
        else:
            # Safe level checking
            level_str = str(user_level).lower() if user_level else "beginner"
            duration = "15" if "beginner" in level_str else "25"
        
        return {
            "card": selected_card,
            "meditation_type": meditation_type,
            "preparation": safe_preparation,
            "meditation_guide": safe_meditation_guide,
            "tree_of_life_connection": safe_tree_connection,
            "integration_prompts": safe_integration_prompts,
            "duration_minutes": duration,
            "safety_notes": ["Maintain grounding throughout", "Journal insights immediately"]
        }
    
    @staticmethod
    def safe_gematria_work_conversion(gematria_work: Any) -> List[str]:
        """
        Safely convert gematria work data to List[str]
        Handles complex union types with dict containing int | list[str]
        """
        if gematria_work is None:
            return []
        
        if isinstance(gematria_work, list):
            # Already a list, ensure all items are strings
            return [str(item) for item in gematria_work if item is not None]  # type: ignore[arg-type]
        
        if isinstance(gematria_work, str):
            # Single string, convert to list
            return [gematria_work]
        
        if isinstance(gematria_work, dict):
            # Dict with mixed int/list values
            result: List[str] = []
            for key, value in gematria_work.items():  # type: ignore[attr-defined]
                if isinstance(value, list):
                    # List of strings
                    result.extend([str(item) for item in value if item is not None])  # type: ignore[arg-type]
                elif isinstance(value, (int, float)):
                    # Numeric value
                    result.append(f"{key}: {value}")  # type: ignore[arg-type]
                else:
                    # Other type
                    result.append(f"{key}: {str(value)}")  # type: ignore[arg-type]
            return result
        
        # Fallback for any other type
        return [str(gematria_work)]  # type: ignore[arg-type]
    
    @staticmethod
    def create_safe_spiritual_response(
        meditation_data: Dict[str, Any],
        gematria_data: Optional[Any] = None,
        additional_practices: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create a type-safe spiritual practices response
        """
        response: Dict[str, Any] = {
            "meditation": meditation_data,
            "timestamp": datetime.now().isoformat(),
            "practices": additional_practices or []
        }
        
        if gematria_data is not None:
            response["gematria_work"] = SpiritualPracticesTypeBridge.safe_gematria_work_conversion(gematria_data)
        
        return response
    
    @staticmethod
    def validate_practice_level(level: Any) -> str:
        """
        Validate and normalize practice level
        """
        if level is None:
            return "beginner"
        
        level_str = str(level).lower().strip()
        valid_levels = ["beginner", "intermediate", "advanced", "expert"]
        
        for valid_level in valid_levels:
            if valid_level in level_str:
                return valid_level
        
        return "beginner"
    
    @staticmethod
    def safe_tarot_card_selection(cards_data: Any) -> str:
        """
        Safely select tarot card from various data formats
        """
        if not cards_data:
            return "The Fool"  # Default card
        
        if isinstance(cards_data, list) and cards_data:
            # List of cards, take first
            first_card = cards_data[0]  # type: ignore[misc]
            if isinstance(first_card, dict):
                return str(first_card.get('name', first_card.get('card', 'The Fool')))  # type: ignore[arg-type]
            return str(first_card)  # type: ignore[arg-type]
        
        if isinstance(cards_data, dict):
            # Single card dict
            return str(cards_data.get('name', cards_data.get('card', 'The Fool')))  # type: ignore[arg-type]
        
        # Fallback
        return str(cards_data) if cards_data else "The Fool"  # type: ignore[arg-type]


# Helper functions for direct use in spiritual_practices.py
def safe_convert_to_list(value: Any) -> List[str]:
    """Direct helper function for safe list conversion"""
    return SpiritualPracticesTypeBridge.safe_list_conversion(value)

def safe_create_meditation_dict(
    selected_card: str,
    meditation_type: str,
    preparation: Any,
    meditation_guide: Any,
    tree_connection: Any,
    integration_prompts: Any,
    user_level: Any,
    duration_override: Optional[int] = None
) -> Dict[str, Union[str, List[str]]]:
    """Direct helper function for creating meditation dictionaries"""
    return SpiritualPracticesTypeBridge.safe_meditation_dict_creation(
        selected_card, meditation_type, preparation, meditation_guide,
        tree_connection, integration_prompts, user_level, duration_override
    )

def safe_convert_gematria_work(gematria_work: Any) -> List[str]:
    """Direct helper function for gematria work conversion"""
    return SpiritualPracticesTypeBridge.safe_gematria_work_conversion(gematria_work)
