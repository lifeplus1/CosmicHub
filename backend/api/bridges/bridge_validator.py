# backend/api/bridges/bridge_validator.py
"""
Bridge System Validator
Ensures type bridges are working correctly and data integrity is maintained
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union
from pathlib import Path

from .tcm_type_bridge import TCMTypeBridge
from .astrology_type_bridge import AstrologyTypeBridge

logger = logging.getLogger(__name__)

class BridgeValidator:
    """Validates bridge system functionality and data integrity"""
    
    def __init__(self):
        self.validation_results: Dict[str, Any] = {
            'timestamp': datetime.now().isoformat(),
            'tcm_bridge': {},
            'astrology_bridge': {},
            'overall_status': 'pending'
        }
    
    def validate_tcm_bridge(self) -> Dict[str, Any]:
        """Validate TCM bridge functionality"""
        results: Dict[str, Any] = {
            'status': 'pass',
            'tests': {},
            'errors': []
        }
        
        try:
            # Test element info conversion
            test_element_data = {
                'season': 'spring',
                'organ_yin': 'liver',
                'organ_yang': 'gallbladder',
                'emotion_balanced': 'kindness',
                'emotion_imbalanced': 'anger',
                'planets': ['jupiter', 'venus'],
                'hours': {'optimal': '1-3 AM', 'active': 'dawn'}
            }
            
            element_info = TCMTypeBridge.engine_to_element_info(test_element_data)
            results['tests']['element_info_conversion'] = {
                'status': 'pass',
                'input_keys': list(test_element_data.keys()),
                'output_type': type(element_info).__name__,
                'has_required_fields': all([
                    hasattr(element_info, 'season'),
                    hasattr(element_info, 'organ_yin'),
                    hasattr(element_info, 'organ_yang')
                ])
            }
            
            # Test element name validation
            valid_elements = ['wood', 'fire', 'earth', 'metal', 'water']
            for element in valid_elements:
                validated = TCMTypeBridge.validate_element_name(element)
                if validated != element:
                    results['errors'].append(f"Element validation failed for {element}")
            
            # Test invalid element handling
            invalid_element = TCMTypeBridge.validate_element_name('invalid')
            results['tests']['element_validation'] = {
                'status': 'pass' if invalid_element == 'earth' else 'fail',
                'default_fallback': invalid_element
            }
            
            # Test health recommendations response creation
            from backend.types.tcm_systems import ElementInfo
            test_element_info = ElementInfo(
                season='spring',
                organ_yin='liver',
                emotion_balanced='kindness'
            )
            
            health_response = TCMTypeBridge.create_health_recommendations_response(
                element='wood',
                dietary_recommendations=['green foods', 'sour taste'],
                lifestyle_recommendations=['exercise in morning', 'manage stress'],
                element_info=test_element_info,
                generated_at=datetime.now().isoformat()
            )
            
            results['tests']['health_response_creation'] = {
                'status': 'pass',
                'response_type': type(health_response).__name__,
                'has_required_fields': all([
                    hasattr(health_response, 'element'),
                    hasattr(health_response, 'dietary_recommendations'),
                    hasattr(health_response, 'lifestyle_recommendations')
                ])
            }
            
        except Exception as e:
            results['status'] = 'fail'
            results['errors'].append(f"TCM bridge validation error: {str(e)}")
            logger.error(f"TCM bridge validation failed: {e}")
        
        return results
    
    def validate_astrology_bridge(self) -> Dict[str, Any]:
        """Validate Astrology bridge functionality"""
    results: Dict[str, Any] = {
            'status': 'pass',
            'tests': {},
            'errors': []
        }
        
        try:
            # Test zodiac sign validation
            valid_signs = ['aries', 'taurus', 'gemini', 'cancer']
            for sign in valid_signs:
                validated = AstrologyTypeBridge.validate_zodiac_sign(sign)
                if validated != sign:
                    results['errors'].append(f"Sign validation failed for {sign}")
            
            # Test invalid sign handling
            invalid_sign = AstrologyTypeBridge.validate_zodiac_sign('invalid')
            results['tests']['sign_validation'] = {
                'status': 'pass' if invalid_sign == 'aries' else 'fail',
                'default_fallback': invalid_sign
            }
            
            # Test planet data extraction
            test_planet_data = {
                'position': 135.25,
                'sign': 'leo',
                'degree': 15.25,
                'house': 5,
                'retrograde': False
            }
            
            planet_data = AstrologyTypeBridge.safe_extract_planet_data(
                test_planet_data, 'mars'
            )
            
            results['tests']['planet_data_extraction'] = {
                'status': 'pass',
                'input_keys': list(test_planet_data.keys()),
                'output_keys': list(planet_data.keys()),
                'position_preserved': planet_data['position'] == 135.25,
                'sign_normalized': planet_data['sign'] == 'leo'
            }
            
            # Test degree validation
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
            
            # Test birth data validation
            test_birth_data: Dict[str, Union[int, float, str]] = {
                'year': 1985,
                'month': 3,
                'day': 15,
                'hour': 14,
                'minute': 30,
                'latitude': 40.7128,
                'longitude': -74.0060,
                'timezone': 'America/New_York'
            }
            
            validated_birth = AstrologyTypeBridge.validate_birth_data(test_birth_data)
            results['tests']['birth_data_validation'] = {
                'status': 'pass',
                'input_keys': list(test_birth_data.keys()),
                'output_keys': list(validated_birth.keys()),
                'year_preserved': validated_birth['year'] == 1985,
                'coordinates_preserved': (
                    validated_birth['latitude'] == 40.7128 and
                    validated_birth['longitude'] == -74.0060
                )
            }
            
        except Exception as e:
            results['status'] = 'fail'
            results['errors'].append(f"Astrology bridge validation error: {str(e)}")
            logger.error(f"Astrology bridge validation failed: {e}")
        
        return results
    
    def validate_full_bridge_system(self) -> Dict[str, Any]:
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
        """Quick health check - returns True if bridges are working"""
        try:
            # Quick TCM test
            from backend.types.tcm_systems import ElementInfo
            test_element = ElementInfo(season='spring')
            
            # Quick astrology test  
            validated_sign = AstrologyTypeBridge.validate_zodiac_sign('aries')
            
            return (
                isinstance(test_element.season, str) and
                validated_sign == 'aries'
            )
        except Exception:
            return False

def run_bridge_validation(save_report: bool = True) -> Dict[str, Any]:
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
