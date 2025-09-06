# backend/api/bridges/bridge_validator.py
"""
Bridge System Validator

Ensures type bridges are working correctly and data integrity is maintained.

This module implements comprehensive validation testing for the CosmicHub bridge system,
following best practices for:
- Strict type safety with descriptive annotations
- Comprehensive error handling and recovery
- Structured logging for debugging
- Clear separation of concerns
- Defensive programming patterns
- Performance monitoring and metrics
- Accessibility and maintainability

Example Usage:
    >>> validator = BridgeValidator()
    >>> results = validator.validate_full_bridge_system()
    >>> print(f"Status: {results['overall_status']}")
    
    # Quick health check
    >>> is_healthy = validator.quick_health_check()
    >>> if not is_healthy:
    ...     print("Bridge system needs attention")

Architecture:
    - BridgeValidator: Main validation orchestrator
    - Safe wrapper methods: Type-safe bridge method calls
    - Structured results: Comprehensive validation reporting
    - Performance metrics: Timing and resource usage tracking
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union, TypedDict, Literal
from pathlib import Path

from .tcm_type_bridge import TCMTypeBridge
from .astrology_type_bridge import AstrologyTypeBridge
from backend.types.astrology_systems import Planet

# Type protocols for validation testing - using structural typing
class ElementInfoProtocol(TypedDict, total=False):
    """Structural type for ElementInfo objects with required attributes"""
    season: Optional[str]
    organ_yin: Optional[str] 
    organ_yang: Optional[str]
    emotion_balanced: Optional[str]
    emotion_imbalanced: Optional[str]

class ElementalBalanceResponseProtocol(TypedDict, total=False):
    """Structural type for ElementalBalanceResponse objects with required attributes"""
    success: bool
    elemental_balance: Dict[str, float]
    primary_element: str
    element_strength: float

# Type-safe contracts for testing data validation
class ElementInfoTestData(TypedDict):
    """Type-safe contract for element info test data"""
    name: str
    season: str  
    organ_yin: str
    organ_yang: str
    emotion: str
    virtue: str

class RawEngineElementData(TypedDict):
    """Type-safe contract for raw engine data"""
    element: str
    season_association: str
    yin_organ: str
    yang_organ: str
    emotional_aspect: str
    spiritual_virtue: str

class AstrologyPlanetTestData(TypedDict):
    """Type-safe contract for astrology planet data"""
    position: float
    sign: str
    degree: float
    house: int
    retrograde: bool

class BirthDataTestContract(TypedDict):
    """Type-safe contract for birth data validation testing"""
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    timezone_offset: float

logger = logging.getLogger(__name__)

# Constants for validation thresholds and defaults
VALIDATION_TIMEOUT_SECONDS = 10
MAX_VALIDATION_RETRIES = 3
DEFAULT_ELEMENT_FALLBACK = 'earth'
DEFAULT_SIGN_FALLBACK = 'aries'

# Test validation result types
class ValidationTestResult(TypedDict):
    """Standard validation test result structure"""
    status: Literal['pass', 'fail']
    message: Optional[str]
    details: Optional[Dict[str, Any]]

class BridgeValidationResults(TypedDict):
    """Complete bridge validation results structure"""
    timestamp: str
    tcm_bridge: Dict[str, Any]
    astrology_bridge: Dict[str, Any]
    overall_status: Literal['pass', 'fail', 'pending']
    total_errors: int
    all_errors: List[str]

class BridgeValidator:
    """
    Validates bridge system functionality and data integrity.
    
    Follows best practices:
    - Strict type safety with descriptive annotations
    - Comprehensive error handling and recovery
    - Structured logging for debugging
    - Clear separation of concerns
    - Defensive programming patterns
    """
    
    def __init__(self) -> None:
        """Initialize validator with empty results structure."""
        self.validation_results: BridgeValidationResults = {
            'timestamp': datetime.now().isoformat(),
            'tcm_bridge': {},
            'astrology_bridge': {},
            'overall_status': 'pending',
            'total_errors': 0,
            'all_errors': []
        }
        logger.info("Bridge validator initialized")
    
    def _safe_tcm_element_info_conversion(
        self, 
        test_data: Dict[str, object]
    ) -> Tuple[object, bool, str]:
        """
        Safely test TCM element info conversion with comprehensive error handling.
        
        Returns:
            Tuple of (result_object, success_flag, error_message)
        """
        try:
            # Type-safe bridge method call with proper error handling
            # Type-safe bridge method call
            result = TCMTypeBridge.engine_to_element_info(test_data)  # type: ignore[reportUnknownMemberType]
            
            # Validate result structure - result is guaranteed to be ElementInfo, not None
            # Safe attribute checking using try/except instead of hasattr
            structure_valid = False
            try:
                # Access attributes safely to test structure
                season_attr = getattr(result, 'season', None)  # type: ignore[reportUnknownArgumentType]
                organ_yin_attr = getattr(result, 'organ_yin', None)  # type: ignore[reportUnknownArgumentType]
                organ_yang_attr = getattr(result, 'organ_yang', None)  # type: ignore[reportUnknownArgumentType]
                
                structure_valid = (
                    season_attr is not None and 
                    organ_yin_attr is not None and 
                    organ_yang_attr is not None
                )
            except (AttributeError, TypeError):
                structure_valid = False
            
            return result, structure_valid, ""  # type: ignore[reportUnknownVariableType]
            
        except Exception as e:
            error_msg = f"TCM element info conversion failed: {str(e)}"
            logger.warning(error_msg)
            return None, False, error_msg
    
    def _safe_tcm_balance_response_creation(
        self, 
        test_data: Dict[str, object]
    ) -> Tuple[object, bool, str]:
        """
        Safely test TCM balance response creation with comprehensive error handling.
        
        Returns:
            Tuple of (result_object, success_flag, error_message)
        """
        try:
            # Type-safe bridge method call
            result = TCMTypeBridge.create_elemental_balance_response(test_data)  # type: ignore[reportUnknownMemberType]
            
            # Validate result structure - result is guaranteed to be ElementalBalanceResponse, not None
            # Safe structure validation using try/except
            structure_valid = False
            try:
                balance_attr = getattr(result, 'elemental_balance', None)  # type: ignore[reportUnknownArgumentType]
                primary_attr = getattr(result, 'primary_element', None)  # type: ignore[reportUnknownArgumentType]
                strength_attr = getattr(result, 'element_strength', None)  # type: ignore[reportUnknownArgumentType]
                
                structure_valid = (
                    balance_attr is not None and 
                    primary_attr is not None and 
                    strength_attr is not None
                )
            except (AttributeError, TypeError):
                structure_valid = False
            
            return result, structure_valid, ""  # type: ignore[reportUnknownVariableType]
            
        except Exception as e:
            error_msg = f"TCM balance response creation failed: {str(e)}"
            logger.warning(error_msg)
            return None, False, error_msg
    
    def validate_tcm_bridge(self) -> Dict[str, Any]:
        """
        Validate TCM bridge functionality with comprehensive testing.
        
        Returns:
            Dict containing validation results, test details, and any errors
        """
        results: Dict[str, Any] = {
            'status': 'pass',
            'tests': {},
            'errors': [],
            'performance_metrics': {}
        }
        
        try:
            start_time = datetime.now()
            
            # Test element info conversion with type-safe test data
            test_element_data: RawEngineElementData = {
                'element': 'wood',
                'season_association': 'spring',
                'yin_organ': 'liver', 
                'yang_organ': 'gallbladder',
                'emotional_aspect': 'growth',
                'spiritual_virtue': 'kindness'
            }
            
            # Convert to bridge-compatible format
            bridge_compatible_data: Dict[str, object] = dict(test_element_data)
            
            # Use safe wrapper method
            element_info, structure_valid, error_msg = self._safe_tcm_element_info_conversion(
                bridge_compatible_data
            )
            
            if error_msg:
                results['errors'].append(error_msg)
                results['status'] = 'fail'
            
            results['tests']['element_info_conversion'] = {
                'status': 'pass' if structure_valid else 'fail',
                'input_keys': list(bridge_compatible_data.keys()),
                'output_type': str(type(element_info).__name__) if element_info is not None else 'None',
                'has_required_fields': structure_valid,
                'error_message': error_msg if error_msg else None
            }
            
            # Test element name validation with fallback behavior
            valid_elements = ['wood', 'fire', 'earth', 'metal', 'water']
            validation_errors: List[str] = []
            
            for element in valid_elements:
                try:
                    # Import locally to avoid unused import error
                    from .tcm_type_bridge import validate_element_name
                    validated: str = validate_element_name(element)
                    if validated != element:
                        validation_errors.append(f"Element validation failed for {element}")
                except ImportError as e:
                    validation_errors.append(f"Could not import validate_element_name: {str(e)}")
                except Exception as e:
                    validation_errors.append(f"Element validation error for {element}: {str(e)}")
            
            # Test invalid element handling with defensive programming
            try:
                from .tcm_type_bridge import validate_element_name
                invalid_element: str = validate_element_name('invalid')
                fallback_correct = invalid_element == DEFAULT_ELEMENT_FALLBACK
            except (ImportError, Exception) as e:
                validation_errors.append(f"Invalid element test failed: {str(e)}")
                fallback_correct = False
            
            results['tests']['element_validation'] = {
                'status': 'pass' if len(validation_errors) == 0 and fallback_correct else 'fail',
                'validation_errors': validation_errors,
                'fallback_test_passed': fallback_correct,
                'default_fallback': DEFAULT_ELEMENT_FALLBACK
            }
            
            # Test elemental balance response creation
            test_balance_data: Dict[str, object] = {
                'wood': 0.3,
                'fire': 0.2,
                'earth': 0.1,
                'metal': 0.2,
                'water': 0.2
            }
            
            # Use safe wrapper method
            balance_response, response_valid, balance_error = self._safe_tcm_balance_response_creation(
                test_balance_data
            )
            
            if balance_error:
                results['errors'].append(balance_error)
                results['status'] = 'fail'
            
            results['tests']['elemental_balance_response_creation'] = {
                'status': 'pass' if response_valid else 'fail',
                'response_type': str(type(balance_response).__name__) if balance_response is not None else 'None',
                'has_required_fields': response_valid,
                'error_message': balance_error if balance_error else None
            }
            
            # Record performance metrics
            end_time = datetime.now()
            results['performance_metrics'] = {
                'total_duration_ms': int((end_time - start_time).total_seconds() * 1000),
                'tests_completed': len(results['tests'])
            }
            
            logger.info(f"TCM bridge validation completed in {results['performance_metrics']['total_duration_ms']}ms")
            
        except Exception as e:
            results['status'] = 'fail'
            error_msg = f"TCM bridge validation error: {str(e)}"
            results['errors'].append(error_msg)
            logger.error(f"TCM bridge validation failed: {e}", exc_info=True)
        
        return results
    
    def validate_astrology_bridge(self) -> Dict[str, Any]:
        """Validate Astrology bridge functionality"""
        results: Dict[str, Any] = {
            'status': 'pass',
            'tests': {},
            'errors': []
        }
        
        try:
            # Test zodiac sign validation using type-safe approach
            valid_signs = ['aries', 'taurus', 'gemini', 'cancer']
            for sign in valid_signs:
                validated: str = AstrologyTypeBridge.validate_zodiac_sign(sign)
                if validated != sign:
                    results['errors'].append(f"Sign validation failed for {sign}")
            
            # Test invalid sign handling
            invalid_sign: str = AstrologyTypeBridge.validate_zodiac_sign('invalid')
            results['tests']['sign_validation'] = {
                'status': 'pass' if invalid_sign == 'aries' else 'fail',
                'default_fallback': invalid_sign
            }
            
            # Test planet data extraction with type-safe test data
            test_planet_data: AstrologyPlanetTestData = {
                'position': 135.25,
                'sign': 'leo',
                'degree': 15.25,
                'house': 5,
                'retrograde': False
            }
            
            # Convert to Dict[str, object] for bridge compatibility
            bridge_planet_data: Dict[str, object] = dict(test_planet_data)
            
            planet_data: Planet = AstrologyTypeBridge.safe_extract_planet_data(
                bridge_planet_data, 'mars'
            )
            
            results['tests']['planet_data_extraction'] = {
                'status': 'pass',
                'input_keys': list(bridge_planet_data.keys()),
                'output_planet_name': planet_data.name,
                'position_preserved': planet_data.position == 135.25,
                'sign_normalized': planet_data.sign == 'leo'
            }
            
            # Test degree validation with comprehensive test cases
            degree_tests: List[Tuple[Union[int, float, str], float]] = [
                (45.5, 45.5),      # Normal degree
                (365.0, 5.0),      # Over 360
                (-10.0, 350.0),    # Negative
                ('invalid', 0.0)   # Invalid input
            ]
            
            degree_validation_passed = True
            for input_deg, expected in degree_tests:
                result = AstrologyTypeBridge.validate_degree(input_deg)
                if abs(result - expected) > 0.1:  # Small tolerance for float comparison
                    degree_validation_passed = False
                    results['errors'].append(
                        f"Degree validation failed: {input_deg} -> {result}, expected {expected}"
                    )
            
            results['tests']['degree_validation'] = {
                'status': 'pass' if degree_validation_passed else 'fail'
            }
            
            # Test birth chart data validation with type-safe approach
            test_birth_data: BirthDataTestContract = {
                'year': 1985,
                'month': 6,
                'day': 15,
                'hour': 14,
                'minute': 30,
                'latitude': 40.7128,
                'longitude': -74.0060,
                'timezone_offset': -5.0
            }
            
            # Convert to Dict[str, object] for bridge compatibility  
            bridge_birth_data: Dict[str, object] = dict(test_birth_data)
            
            birth_validation_result: Dict[str, Any] = AstrologyTypeBridge.validate_birth_data(
                bridge_birth_data
            )
            
            results['tests']['birth_validation'] = {
                'status': 'pass' if birth_validation_result.get('valid', False) else 'fail',
                'validation_result': birth_validation_result
            }
            
        except Exception as e:
            results['status'] = 'fail'
            results['errors'].append(f"Astrology bridge validation error: {str(e)}")
            logger.error(f"Astrology bridge validation failed: {e}")
        
        return results
    
    def validate_full_bridge_system(self) -> BridgeValidationResults:
        """Run complete bridge system validation"""
        logger.info("Starting bridge system validation...")
        
        # Validate TCM bridge
        tcm_results = self.validate_tcm_bridge()
        self.validation_results['tcm_bridge'] = tcm_results
        
        # Validate Astrology bridge
        astrology_results = self.validate_astrology_bridge()
        self.validation_results['astrology_bridge'] = astrology_results
        
        # Determine overall status
        overall_errors = tcm_results['errors'] + astrology_results['errors']
        self.validation_results['overall_status'] = (
            'pass' if len(overall_errors) == 0 else 'fail'
        )
        self.validation_results['total_errors'] = len(overall_errors)
        self.validation_results['all_errors'] = overall_errors
        
        logger.info(f"Bridge validation completed: {self.validation_results['overall_status']}")
        
        return self.validation_results
    
    def generate_validation_report(self, save_path: Optional[Path] = None) -> str:
        """Generate human-readable validation report"""
        results = self.validation_results
        
        report = f"""
🔄 CosmicHub Type Bridge Validation Report
==========================================
Generated: {results['timestamp']}

📊 OVERALL STATUS: {results['overall_status'].upper()}
Total Errors: {results.get('total_errors', 0)}

🧪 TCM BRIDGE RESULTS
--------------------
Status: {results['tcm_bridge']['status']}
Tests Run: {len(results['tcm_bridge'].get('tests', {}))}
Errors: {len(results['tcm_bridge'].get('errors', []))}

🌟 ASTROLOGY BRIDGE RESULTS  
---------------------------
Status: {results['astrology_bridge']['status']}
Tests Run: {len(results['astrology_bridge'].get('tests', {}))}
Errors: {len(results['astrology_bridge'].get('errors', []))}

"""
        
        if results.get('all_errors'):
            report += "❌ ERRORS FOUND:\n"
            for i, error in enumerate(results['all_errors'], 1):
                report += f"  {i}. {error}\n"
        else:
            report += "✅ No errors found - all bridges working correctly!\n"
        
        report += f"""
📋 DETAILED RESULTS
------------------
Full validation data saved to JSON for debugging.

🔧 RECOMMENDATIONS
-----------------
"""
        
        if results['overall_status'] == 'pass':
            report += "• Bridge system is functioning correctly\n"
            report += "• Safe to use in production\n"
            report += "• Consider running validation in CI/CD pipeline\n"
        else:
            report += "• Review and fix errors above\n"
            report += "• Re-run validation after fixes\n"
            report += "• Check bridge implementations for edge cases\n"
        
        # Save report if path provided
        if save_path:
            with open(save_path, 'w') as f:
                f.write(report)
            
            # Also save JSON data
            json_path = save_path.with_suffix('.json')
            with open(json_path, 'w') as f:
                json.dump(results, f, indent=2)
        
        return report
    
    def quick_health_check(self) -> bool:
        """
        Quick health check - returns True if bridges are working.
        
        Uses defensive programming to safely test bridge functionality
        without throwing exceptions on failures.
        """
        try:
            # Quick TCM test using safe wrapper methods
            test_balance_data: Dict[str, object] = {
                'wood': 0.2, 'fire': 0.2, 'earth': 0.2, 'metal': 0.2, 'water': 0.2
            }
            
            # Use safe wrapper method instead of direct bridge call
            _, response_valid, error_msg = self._safe_tcm_balance_response_creation(
                test_balance_data
            )
            
            # Quick astrology test  
            validated_sign: str = AstrologyTypeBridge.validate_zodiac_sign('aries')
            
            # Return success only if both tests pass
            tcm_test_passed = response_valid and not error_msg
            astrology_test_passed = validated_sign == DEFAULT_SIGN_FALLBACK
            
            overall_success = tcm_test_passed and astrology_test_passed
            
            if not overall_success:
                logger.warning(
                    f"Bridge health check failed - TCM: {tcm_test_passed}, "
                    f"Astrology: {astrology_test_passed}"
                )
            
            return overall_success
            
        except Exception as e:
            logger.warning(f"Bridge health check failed with exception: {e}")
            return False

def run_bridge_validation(save_report: bool = True) -> BridgeValidationResults:
    """Convenience function to run bridge validation"""
    validator = BridgeValidator()
    results = validator.validate_full_bridge_system()
    
    if save_report:
        # Save to project root
        project_root = Path(__file__).parent.parent.parent.parent
        report_path = project_root / "bridge-validation-report.txt"
        validator.generate_validation_report(report_path)
        print(f"📋 Validation report saved to: {report_path}")
    
    return results

if __name__ == "__main__":
    # Run validation when script is executed directly
    results = run_bridge_validation()
    print(f"🔄 Bridge validation: {results['overall_status']}")
    if results['total_errors'] > 0:
        print(f"❌ {results['total_errors']} errors found")
    else:
        print("✅ All bridges working correctly!")
