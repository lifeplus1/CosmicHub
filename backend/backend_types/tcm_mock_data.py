"""
Mock data generators for Traditional Chinese Medicine (TCM) analytics
"""

from typing import TYPE_CHECKING, Dict, Any, Optional, cast, Literal
import random
from datetime import datetime, timedelta

if TYPE_CHECKING:
    from .tcm_analytics_schema import TCMAnalyticsRecord
    from .tcm_api_types import (
        TCMAnalysisResponse, 
        ElementalBalanceResult, 
        ConstitutionResult
    )
else:
    # Runtime fallbacks
    TCMAnalyticsRecord = Any  # type: ignore
    TCMAnalysisResponse = Any  # type: ignore
    ElementalBalanceResult = Any  # type: ignore
    ConstitutionResult = Any  # type: ignore


# ===== MOCK DATA GENERATORS =====

class TCMMockDataGenerator:
    """
    Generate realistic mock data for TCM analysis testing.
    Optimized for development, testing, and analytics validation.
    """
    
    ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water']
    CONSTITUTION_TYPES = [
        'qi_deficient', 'yang_deficient', 'yin_deficient', 'blood_stasis',
        'phlegm_dampness', 'damp_heat', 'qi_stagnation', 'special_constitution',
        'balanced_constitution'
    ]
    SEASONS = ['spring', 'summer', 'late_summer', 'autumn', 'winter']
    ORGANS = {
        'wood': {'yin': 'liver', 'yang': 'gallbladder'},
        'fire': {'yin': 'heart', 'yang': 'small_intestine'},
        'earth': {'yin': 'spleen', 'yang': 'stomach'},
        'metal': {'yin': 'lungs', 'yang': 'large_intestine'},
        'water': {'yin': 'kidneys', 'yang': 'bladder'}
    }
    
    @classmethod
    def generate_balanced_elemental_balance(cls) -> Dict[str, float]:
        """Generate realistic elemental balance (sums to 1.0)"""
        # Generate random values
        raw_values = [random.uniform(0.1, 0.4) for _ in cls.ELEMENTS]
        total = sum(raw_values)
        
        # Normalize to sum to 1.0
        return {
            element: round(value / total, 3) 
            for element, value in zip(cls.ELEMENTS, raw_values)
        }
    
    @classmethod
    def generate_dominant_element_balance(cls, dominant_element: str) -> Dict[str, float]:
        """Generate balance with a dominant element (for testing patterns)"""
        balance = {}
        
        # Dominant element gets 40-60% 
        dominant_pct = random.uniform(0.4, 0.6)
        balance[dominant_element] = dominant_pct
        
        # Distribute remaining among other elements
        remaining = 1.0 - dominant_pct
        other_elements = [e for e in cls.ELEMENTS if e != dominant_element]
        
        for i, element in enumerate(other_elements):
            if i == len(other_elements) - 1:  # Last element gets remainder
                balance[element] = remaining
            else:
                pct = random.uniform(0.05, remaining * 0.4)
                balance[element] = round(pct, 3)
                remaining -= pct
        
        return balance
    
    @classmethod
    def generate_mock_analytics_record(
        cls, 
        user_id: Optional[str] = None,
        dominant_element: Optional[str] = None
    ) -> TCMAnalyticsRecord:
        """Generate mock analytics record for testing/development"""
        
        # Generate balanced or dominant element balance
        if dominant_element and dominant_element in cls.ELEMENTS:
            element_balance = cls.generate_dominant_element_balance(dominant_element)
        else:
            element_balance = cls.generate_balanced_elemental_balance()
        
        # Determine primary element
        primary_element_raw = max(element_balance.items(), key=lambda x: x[1])[0]
        # Cast to ensure it matches the expected Literal type
        primary_element = cast(Literal['wood', 'fire', 'earth', 'metal', 'water'], primary_element_raw)
        
        # Generate realistic birth data
        birth_year = random.randint(1950, 2020)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)  # Safe for all months
        
        return TCMAnalyticsRecord(
            # Metadata
            timestamp=datetime.now().isoformat(),
            user_id_hash=user_id or f"test_user_{random.randint(1000, 9999)}",
            session_id=f"session_{random.randint(100000, 999999)}",
            processing_time_ms=random.uniform(50.0, 500.0),
            success=random.choice([True, True, True, False]),  # 75% success rate
            
            # Birth data
            birth_year=birth_year,
            birth_month=birth_month,
            birth_day=birth_day,
            birth_hour=random.randint(0, 23),
            birth_minute=random.randint(0, 59),
            birth_latitude=random.uniform(-60.0, 60.0),  # Most populated regions
            birth_longitude=random.uniform(-120.0, 120.0),
            
            # TCM results
            primary_element=primary_element,
            primary_element_strength=element_balance[primary_element],
            constitutional_type=random.choice(cls.CONSTITUTION_TYPES),
            balance_score=random.uniform(0.6, 0.95),
            analysis_confidence=random.uniform(0.7, 0.98),
            
            # Element percentages
            wood_percentage=element_balance['wood'],
            fire_percentage=element_balance['fire'],
            earth_percentage=element_balance['earth'],
            metal_percentage=element_balance['metal'],
            water_percentage=element_balance['water'],
            
            # Health metrics
            recommendation_count=random.randint(3, 8),
            dietary_rec_count=random.randint(2, 5),
            lifestyle_rec_count=random.randint(1, 4),
            constitution_trait_count=random.randint(3, 7),
            vulnerability_count=random.randint(1, 4),
            
            # Context
            detailed_analysis_requested=random.choice([True, True, False]),
            chart_context_available=random.choice([True, False]),
        )
    
    @classmethod
    def generate_mock_api_response(
        cls,
        dominant_element: Optional[str] = None
    ) -> TCMAnalysisResponse:
        """Generate mock API response for testing"""
        
        if dominant_element and dominant_element in cls.ELEMENTS:
            element_balance = cls.generate_dominant_element_balance(dominant_element)
        else:
            element_balance = cls.generate_balanced_elemental_balance()
        
        primary_element_raw = max(element_balance.items(), key=lambda x: x[1])[0]
        # Cast to ensure it matches the expected Literal type
        primary_element = cast(Literal['wood', 'fire', 'earth', 'metal', 'water'], primary_element_raw)
        
        return TCMAnalysisResponse(
            elemental_balance=ElementalBalanceResult(**element_balance),
            constitution=ConstitutionResult(
                primary_element=primary_element,
                constitutional_type=random.choice(cls.CONSTITUTION_TYPES),
                element_strength=element_balance[primary_element],
                traits=[
                    f"{primary_element}_dominant_trait_{i}" 
                    for i in range(random.randint(2, 5))
                ]
            ),
            balance_score=random.uniform(0.6, 0.95),
            analysis_confidence=random.uniform(0.7, 0.98),
            dietary_recommendations=[
                f"Dietary recommendation {i} for {primary_element} element"
                for i in range(random.randint(2, 4))
            ],
            lifestyle_recommendations=[
                f"Lifestyle recommendation {i} for {primary_element} element"
                for i in range(random.randint(1, 3))
            ],
            optimal_season=cls.SEASONS[cls.ELEMENTS.index(primary_element)],
            processing_time_ms=random.uniform(50.0, 300.0),
        )
    
    @classmethod
    def generate_batch_mock_data(
        cls, 
        count: int = 100,
        date_range_days: int = 30
    ) -> list[TCMAnalyticsRecord]:
        """Generate batch of mock data for analytics testing"""
        
        records = []
        start_date = datetime.now() - timedelta(days=date_range_days)
        
        for i in range(count):
            # Random timestamp within date range
            random_offset = random.randint(0, date_range_days * 24 * 60)  # minutes
            timestamp = start_date + timedelta(minutes=random_offset)
            
            # Generate record with varying dominant elements for diversity
            dominant_element = random.choice(cls.ELEMENTS) if i % 3 == 0 else None
            
            record = cls.generate_mock_analytics_record(
                user_id=f"batch_user_{i % 20}",  # 20 unique users
                dominant_element=dominant_element
            )
            record.timestamp = timestamp.isoformat()
            
            records.append(record)
        
        return records


# ===== TESTING UTILITIES =====

class TCMTestDataValidator:
    """Validate TCM data integrity for testing"""
    
    @staticmethod
    def validate_elemental_balance(balance: Dict[str, float], tolerance: float = 0.01) -> bool:
        """Validate that elemental balance sums to 1.0 within tolerance"""
        total = sum(balance.values())
        return abs(total - 1.0) <= tolerance
    
    @staticmethod
    def validate_analytics_record(record: TCMAnalyticsRecord) -> Dict[str, bool]:
        """Comprehensive validation of analytics record"""
        validations = {
            'element_balance_sum': TCMTestDataValidator.validate_elemental_balance({
                'wood': record.wood_percentage,
                'fire': record.fire_percentage, 
                'earth': record.earth_percentage,
                'metal': record.metal_percentage,
                'water': record.water_percentage,
            }),
            'primary_element_matches_highest': (
                record.primary_element_strength == max([
                    record.wood_percentage, record.fire_percentage,
                    record.earth_percentage, record.metal_percentage, 
                    record.water_percentage
                ])
            ),
            'birth_date_valid': (
                1900 <= record.birth_year <= 2100 and
                1 <= record.birth_month <= 12 and
                1 <= record.birth_day <= 31
            ),
            'coordinates_valid': (
                -90.0 <= record.birth_latitude <= 90.0 and
                -180.0 <= record.birth_longitude <= 180.0
            ),
            'percentages_in_range': all([
                0.0 <= record.wood_percentage <= 1.0,
                0.0 <= record.fire_percentage <= 1.0,
                0.0 <= record.earth_percentage <= 1.0,
                0.0 <= record.metal_percentage <= 1.0,
                0.0 <= record.water_percentage <= 1.0,
                0.0 <= record.balance_score <= 1.0,
                0.0 <= record.analysis_confidence <= 1.0,
            ])
        }
        
        return validations


# Export mock data utilities
__all__ = [
    "TCMMockDataGenerator",
    "TCMTestDataValidator",
]
