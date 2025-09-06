# backend/astro/calculations/sacred_geometry.py
"""
Sacred Geometry & Cosmometry Calculation Engine
SPIRITUAL-003.5 Implementation

This module implements sacred geometric calculations and cosmometry analysis
as an enhancement to the TCM Wellness Bridge (SPIRITUAL-003).

Key Features:
- Golden Ratio (φ) calculations from astrological patterns
- Fibonacci sequence timing optimization
- Platonic solid correspondences with TCM 5-element theory
- Personalized sacred mandala generation
- Geometric meditation tools and wellness applications

Cultural Sensitivity:
- Respects traditional sacred geometry principles
- Authentic mathematical foundations
- Cross-cultural synthesis without appropriation
"""

import logging
import math
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

# ===== MATHEMATICAL CONSTANTS =====

PHI = (1 + math.sqrt(5)) / 2  # Golden Ratio (φ ≈ 1.618033988749)
PHI_INVERSE = 1 / PHI  # φ⁻¹ ≈ 0.618033988749
PI = math.pi
TAU = 2 * PI  # Full circle in radians

# Fibonacci sequence for timing calculations
FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597]

# ===== PLATONIC SOLIDS CORRESPONDENCES =====

class PlatonicSolid(Enum):
    """Five Platonic Solids with mathematical properties"""
    TETRAHEDRON = "tetrahedron"    # 4 faces, Fire element (traditional), Wood (TCM)
    CUBE = "cube"                  # 6 faces, Earth element (both systems)
    OCTAHEDRON = "octahedron"      # 8 faces, Air element (traditional), Fire (TCM)
    ICOSAHEDRON = "icosahedron"    # 20 faces, Water element (traditional), Metal (TCM)
    DODECAHEDRON = "dodecahedron"  # 12 faces, Spirit/Ether (traditional), Water (TCM)

@dataclass
class PlatonicSolidProperties:
    """Mathematical properties of Platonic solids"""
    name: str
    faces: int
    vertices: int
    edges: int
    dihedral_angle: float  # Internal angle between faces (degrees)
    solid_angle: float     # Solid angle at each vertex (steradians)
    surface_area_ratio: float  # Surface area to circumscribed sphere
    volume_ratio: float    # Volume to circumscribed sphere
    tcm_element: str       # TCM 5-element correspondence
    chakra_correspondence: Optional[int] = None  # Chakra number (1-7)

# Mathematical properties of Platonic solids
PLATONIC_SOLID_DATA = {
    PlatonicSolid.TETRAHEDRON: PlatonicSolidProperties(
        name="tetrahedron", faces=4, vertices=4, edges=6,
        dihedral_angle=70.528779, solid_angle=math.pi * (3 - math.sqrt(5)),
        surface_area_ratio=math.sqrt(3), volume_ratio=math.sqrt(2) / 12,
        tcm_element="wood", chakra_correspondence=3  # Solar plexus
    ),
    PlatonicSolid.CUBE: PlatonicSolidProperties(
        name="cube", faces=6, vertices=8, edges=12,
        dihedral_angle=90.0, solid_angle=math.pi / 2,
        surface_area_ratio=3, volume_ratio=1/6,
        tcm_element="earth", chakra_correspondence=1  # Root
    ),
    PlatonicSolid.OCTAHEDRON: PlatonicSolidProperties(
        name="octahedron", faces=8, vertices=6, edges=12,
        dihedral_angle=109.471221, solid_angle=4 * math.asin(1/3),
        surface_area_ratio=2 * math.sqrt(3), volume_ratio=math.sqrt(2) / 6,
        tcm_element="fire", chakra_correspondence=4  # Heart
    ),
    PlatonicSolid.ICOSAHEDRON: PlatonicSolidProperties(
        name="icosahedron", faces=20, vertices=12, edges=30,
        dihedral_angle=138.189685, solid_angle=math.pi * (5 - math.sqrt(5)),
        surface_area_ratio=5 * math.sqrt(3), volume_ratio=5 * (3 + math.sqrt(5)) / 24,
        tcm_element="metal", chakra_correspondence=5  # Throat
    ),
    PlatonicSolid.DODECAHEDRON: PlatonicSolidProperties(
        name="dodecahedron", faces=12, vertices=20, edges=30,
        dihedral_angle=116.565051, solid_angle=math.pi * (3 - math.sqrt(5)) / 2,
        surface_area_ratio=15 * math.sqrt(3) / math.sqrt(10 + 2 * math.sqrt(5)),
        volume_ratio=(15 + 5 * math.sqrt(5)) / 24,
        tcm_element="water", chakra_correspondence=7  # Crown
    )
}

# ===== DATA STRUCTURES =====

@dataclass
class GeometricPattern:
    """Represents a sacred geometric pattern"""
    name: str
    ratio: float
    angle_degrees: float
    frequency_hz: Optional[float] = None
    element_correspondence: Optional[str] = None
    chakra_correspondence: Optional[int] = None
    
@dataclass
class GoldenRatioAnalysis:
    """Results of Golden Ratio analysis from astrological chart"""
    primary_phi_ratio: float
    phi_aspects: List[Tuple[str, str, float]]  # (planet1, planet2, phi_ratio)
    harmonic_ratios: List[float]
    resonance_strength: float  # 0-1 scale
    optimal_meditation_times: List[str]

@dataclass
class FibonacciTiming:
    """Fibonacci-based timing recommendations"""
    sequence_position: int
    days_from_start: int
    optimal_date: datetime
    activity_type: str
    lunar_phase_alignment: Optional[str] = None

@dataclass
class MandalaData:
    """Sacred mandala generation data"""
    center_point: Tuple[float, float]
    primary_radius: float
    golden_ratio_rings: List[float]
    symmetry_order: int  # Number of symmetrical divisions
    color_harmonics: List[str]  # Hex colors based on elements
    geometric_elements: List[str]  # Shape descriptions
    meditation_focus: str

@dataclass
class SacredGeometryAnalysis:
    """Complete sacred geometry analysis result"""
    user_id: str
    birth_data: Dict[str, Any]
    golden_ratio_analysis: GoldenRatioAnalysis
    fibonacci_timing: List[FibonacciTiming]
    platonic_solid_correspondences: Dict[str, PlatonicSolid]
    mandala_data: MandalaData
    tcm_geometric_integration: Dict[str, Any]
    wellness_applications: List[str]
    analysis_confidence: float
    generated_at: str

# ===== SACRED GEOMETRY CALCULATION ENGINE =====

class SacredGeometryEngine:
    """
    Sacred Geometry & Cosmometry Calculation Engine
    
    Implements authentic sacred geometric principles for spiritual development
    and wellness applications, integrated with TCM and astrological systems.
    """
    
    def __init__(self):
        self.phi = PHI
        self.fibonacci = FIBONACCI_SEQUENCE
        self.platonic_solids = PLATONIC_SOLID_DATA
        
    def calculate_sacred_geometry_analysis(
        self,
        year: int,
        month: int,
        day: int,
        hour: int = 12,
        minute: int = 0,
        lat: float = 0.0,
        lon: float = 0.0,
        timezone: str = "UTC",
        tcm_data: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> SacredGeometryAnalysis:
        """
        Calculate complete sacred geometry analysis
        
        Args:
            year, month, day, hour, minute: Birth date/time
            lat, lon: Geographic coordinates
            timezone: Timezone string
            tcm_data: Optional TCM analysis data for integration
            user_id: User identifier
            
        Returns:
            Complete sacred geometry analysis with all calculations
        """
        try:
            logger.info(f"Calculating sacred geometry analysis for {year}-{month}-{day}")
            
            # Get astrological context for geometric calculations
            chart_data = self._get_astrological_context(
                year, month, day, hour, minute, lat, lon, timezone
            )
            
            # Calculate Golden Ratio patterns from planetary aspects
            golden_ratio_analysis = self._calculate_golden_ratio_patterns(chart_data)
            
            # Generate Fibonacci timing sequences
            fibonacci_timing = self._calculate_fibonacci_timing(
                year, month, day, chart_data
            )
            
            # Determine Platonic solid correspondences
            platonic_correspondences = self._calculate_platonic_correspondences(
                chart_data, tcm_data
            )
            
            # Generate personalized mandala data
            mandala_data = self._generate_mandala_data(
                chart_data, golden_ratio_analysis, tcm_data
            )
            
            # Integrate with TCM data if available
            tcm_integration = self._integrate_tcm_geometry(tcm_data, platonic_correspondences)
            
            # Generate wellness applications
            wellness_apps = self._generate_wellness_applications(
                golden_ratio_analysis, fibonacci_timing, tcm_integration
            )
            
            # Calculate analysis confidence
            confidence = self._calculate_analysis_confidence(
                chart_data, golden_ratio_analysis, tcm_data
            )
            
            return SacredGeometryAnalysis(
                user_id=user_id or "anonymous",
                birth_data={
                    "year": year, "month": month, "day": day,
                    "hour": hour, "minute": minute,
                    "lat": lat, "lon": lon, "timezone": timezone
                },
                golden_ratio_analysis=golden_ratio_analysis,
                fibonacci_timing=fibonacci_timing,
                platonic_solid_correspondences=platonic_correspondences,
                mandala_data=mandala_data,
                tcm_geometric_integration=tcm_integration,
                wellness_applications=wellness_apps,
                analysis_confidence=confidence,
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Sacred geometry calculation failed: {e}")
            raise
    
    def _get_astrological_context(
        self, year: int, month: int, day: int, hour: int,
        minute: int, lat: float, lon: float, timezone: str
    ) -> Dict[str, Any]:
        """Get astrological chart for geometric calculations"""
        try:
            # This would integrate with existing chart calculation
            # For now, return mock structure with planetary positions
            return {
                "planets": {
                    "sun": {"longitude": 85.5, "sign": "gemini"},
                    "moon": {"longitude": 32.3, "sign": "taurus"},
                    "mercury": {"longitude": 78.9, "sign": "gemini"},
                    "venus": {"longitude": 105.2, "sign": "cancer"},
                    "mars": {"longitude": 210.7, "sign": "scorpio"},
                    "jupiter": {"longitude": 156.4, "sign": "virgo"},
                    "saturn": {"longitude": 282.1, "sign": "capricorn"}
                },
                "aspects": [
                    {"planet1": "sun", "planet2": "jupiter", "angle": 71.1, "aspect": "unknown"},
                    {"planet1": "moon", "planet2": "venus", "angle": 72.9, "aspect": "unknown"},
                    {"planet1": "mercury", "planet2": "mars", "angle": 131.8, "aspect": "unknown"}
                ],
                "birth_time": f"{year}-{month}-{day} {hour}:{minute}",
                "location": {"lat": lat, "lon": lon, "timezone": timezone}
            }
        except Exception as e:
            logger.warning(f"Chart calculation failed, using fallback: {e}")
            return {"planets": {}, "aspects": [], "birth_time": "", "location": {}}
    
    def _calculate_golden_ratio_patterns(self, chart_data: Dict[str, Any]) -> GoldenRatioAnalysis:
        """Calculate Golden Ratio patterns from planetary aspects"""
        
        phi_aspects = []
        harmonic_ratios = []
        
        aspects = chart_data.get("aspects", [])
        planets = chart_data.get("planets", {})
        
        # Analyze planetary aspects for Golden Ratio relationships
        for aspect in aspects:
            if all(key in aspect for key in ["planet1", "planet2", "angle"]):
                planet1 = aspect["planet1"]
                planet2 = aspect["planet2"]
                angle = aspect["angle"]
                
                # Calculate phi ratio from angular relationship
                phi_ratio = self._calculate_phi_ratio_from_angle(angle)
                
                if abs(phi_ratio - self.phi) < 0.1:  # Close to golden ratio
                    phi_aspects.append((planet1, planet2, phi_ratio))
                
                # Calculate harmonic ratios
                harmonic = self._calculate_harmonic_ratio(angle)
                if harmonic:
                    harmonic_ratios.append(harmonic)
        
        # Calculate primary phi ratio from chart
        primary_phi = self._calculate_primary_phi_ratio(planets)
        
        # Calculate resonance strength
        resonance = len(phi_aspects) / max(len(aspects), 1) if aspects else 0.5
        
        # Generate optimal meditation times based on phi cycles
        meditation_times = self._calculate_phi_meditation_times(primary_phi)
        
        return GoldenRatioAnalysis(
            primary_phi_ratio=primary_phi,
            phi_aspects=phi_aspects,
            harmonic_ratios=harmonic_ratios,
            resonance_strength=resonance,
            optimal_meditation_times=meditation_times
        )
    
    def _calculate_fibonacci_timing(
        self, year: int, month: int, day: int, chart_data: Dict[str, Any]
    ) -> List[FibonacciTiming]:
        """Calculate Fibonacci-based timing for spiritual practices"""
        
        fibonacci_timings = []
        base_date = datetime(year, month, day)
        
        # Generate Fibonacci timing sequences for next year
        for i, fib_num in enumerate(self.fibonacci[:12]):  # First 12 Fibonacci numbers
            target_date = base_date.replace(year=base_date.year + 1)
            
            # Calculate days based on Fibonacci sequence
            days_offset = fib_num * 7  # Weekly cycles
            timing_date = base_date + timedelta(days=days_offset)
            
            # Determine activity type based on Fibonacci position
            activity = self._get_fibonacci_activity_type(i, fib_num)
            
            # Check lunar phase alignment (simplified)
            lunar_phase = self._estimate_lunar_phase(timing_date)
            
            fibonacci_timings.append(FibonacciTiming(
                sequence_position=i,
                days_from_start=days_offset,
                optimal_date=timing_date,
                activity_type=activity,
                lunar_phase_alignment=lunar_phase
            ))
        
        return fibonacci_timings
    
    def _calculate_platonic_correspondences(
        self, chart_data: Dict[str, Any], tcm_data: Optional[Dict[str, Any]]
    ) -> Dict[str, PlatonicSolid]:
        """Determine Platonic solid correspondences with TCM elements"""
        
        correspondences = {}
        
        # Get elemental balance from TCM data if available
        if tcm_data and "elemental_balance" in tcm_data:
            elemental_balance = tcm_data["elemental_balance"]
            
            # Map elements to Platonic solids
            element_mapping = {
                "wood": PlatonicSolid.TETRAHEDRON,
                "fire": PlatonicSolid.OCTAHEDRON,
                "earth": PlatonicSolid.CUBE,
                "metal": PlatonicSolid.ICOSAHEDRON,
                "water": PlatonicSolid.DODECAHEDRON
            }
            
            for element, strength in elemental_balance.items():
                if element in element_mapping and strength > 0.15:  # Significant strength
                    solid = element_mapping[element]
                    correspondences[element] = solid
        
        # Add astrological correspondences
        planets = chart_data.get("planets", {})
        if planets:
            # Sun → Dodecahedron (Spirit/Unity)
            if "sun" in planets:
                correspondences["solar_principle"] = PlatonicSolid.DODECAHEDRON
            
            # Earth-based planets → Cube
            if any(p in planets for p in ["saturn", "venus"]):
                correspondences["earth_principle"] = PlatonicSolid.CUBE
        
        return correspondences
    
    def _generate_mandala_data(
        self,
        chart_data: Dict[str, Any],
        golden_ratio: GoldenRatioAnalysis,
        tcm_data: Optional[Dict[str, Any]]
    ) -> MandalaData:
        """Generate personalized sacred mandala data"""
        
        # Center point (normalized coordinates)
        center = (0.5, 0.5)
        
        # Primary radius based on golden ratio
        primary_radius = golden_ratio.primary_phi_ratio / 10  # Scale to manageable size
        
        # Generate golden ratio rings
        rings = []
        current_radius = primary_radius
        for i in range(7):  # 7 rings for chakras
            rings.append(current_radius)
            current_radius *= self.phi
            if current_radius > 0.5:  # Don't exceed container
                break
        
        # Symmetry order based on chart data
        symmetry = self._calculate_mandala_symmetry(chart_data)
        
        # Color harmonics from TCM elements
        colors = self._generate_color_harmonics(tcm_data)
        
        # Geometric elements
        elements = self._generate_geometric_elements(golden_ratio, tcm_data)
        
        # Meditation focus
        focus = self._determine_meditation_focus(golden_ratio, tcm_data)
        
        return MandalaData(
            center_point=center,
            primary_radius=primary_radius,
            golden_ratio_rings=rings,
            symmetry_order=symmetry,
            color_harmonics=colors,
            geometric_elements=elements,
            meditation_focus=focus
        )
    
    def _integrate_tcm_geometry(
        self, tcm_data: Optional[Dict[str, Any]], platonic_correspondences: Dict[str, PlatonicSolid]
    ) -> Dict[str, Any]:
        """Integrate TCM data with sacred geometry"""
        
        integration = {
            "five_element_geometry": {},
            "meridian_flow_patterns": {},
            "constitutional_geometry": {},
            "healing_frequencies": {}
        }
        
        if not tcm_data:
            return integration
        
        # Five Element geometric mappings
        elemental_balance = tcm_data.get("elemental_balance", {})
        for element, strength in elemental_balance.items():
            if element in ["wood", "fire", "earth", "metal", "water"]:
                solid = platonic_correspondences.get(element)
                if solid:
                    solid_props = self.platonic_solids[solid]
                    integration["five_element_geometry"][element] = {
                        "platonic_solid": solid.value,
                        "strength": strength,
                        "geometric_properties": {
                            "faces": solid_props.faces,
                            "vertices": solid_props.vertices,
                            "dihedral_angle": solid_props.dihedral_angle,
                            "chakra_correspondence": solid_props.chakra_correspondence
                        }
                    }
        
        # Meridian flow patterns (simplified)
        primary_constitution = tcm_data.get("primary_constitution", {})
        if primary_constitution:
            primary_element = primary_constitution.get("primary_element", "earth")
            integration["constitutional_geometry"] = {
                "primary_element": primary_element,
                "geometric_meditation": f"Focus on {primary_element} platonic solid forms",
                "sacred_ratios": [self.phi, self.phi ** 2, 1 / self.phi]
            }
        
        return integration
    
    def _generate_wellness_applications(
        self,
        golden_ratio: GoldenRatioAnalysis,
        fibonacci_timing: List[FibonacciTiming],
        tcm_integration: Dict[str, Any]
    ) -> List[str]:
        """Generate practical wellness applications"""
        
        applications = []
        
        # Golden ratio applications
        if golden_ratio.resonance_strength > 0.3:
            applications.extend([
                "Golden ratio meditation: Focus on φ proportions during contemplation",
                "Sacred geometry visualization: Use phi-based mandala patterns",
                "Breathing exercises: φ ratio inhalation to exhalation timing"
            ])
        
        # Fibonacci timing applications
        if fibonacci_timing:
            applications.extend([
                "Fibonacci practice schedule: Follow natural timing for spiritual growth",
                "Lunar-Fibonacci integration: Align practices with moon phases",
                "Progressive development: Use Fibonacci intervals for skill building"
            ])
        
        # TCM integration applications
        if tcm_integration.get("five_element_geometry"):
            applications.extend([
                "Element-specific geometry meditation",
                "Platonic solid visualization for constitutional balancing",
                "Sacred ratio timing for meridian flow optimization"
            ])
        
        # Universal applications
        applications.extend([
            "Sacred geometry journal: Track patterns and synchronicities",
            "Geometric mandala creation for personal transformation",
            "Phi-ratio daily scheduling for optimal life rhythm"
        ])
        
        return applications
    
    # ===== HELPER METHODS =====
    
    def _calculate_phi_ratio_from_angle(self, angle: float) -> float:
        """Calculate phi-related ratio from angular measurement"""
        # Convert angle to ratio relative to circle
        ratio = angle / 360.0
        
        # Check for golden ratio relationships
        phi_multiples = [self.phi, 1/self.phi, self.phi**2, 1/(self.phi**2)]
        
        for phi_mult in phi_multiples:
            if abs(ratio - (phi_mult % 1)) < 0.05:  # Within 5% tolerance
                return phi_mult
        
        return ratio
    
    def _calculate_harmonic_ratio(self, angle: float) -> Optional[float]:
        """Calculate harmonic ratio from angle"""
        # Sacred angles and their harmonic ratios
        sacred_angles = {
            36: 1/self.phi,    # Pentagon angle
            72: self.phi,      # Golden angle
            108: self.phi**2,  # 108° sacred angle
            144: 1/(self.phi**2)  # 144° Fibonacci angle
        }
        
        for sacred_angle, ratio in sacred_angles.items():
            if abs(angle - sacred_angle) < 5:  # Within 5° tolerance
                return ratio
        
        return None
    
    def _calculate_primary_phi_ratio(self, planets: Dict[str, Any]) -> float:
        """Calculate primary phi ratio from planetary positions"""
        if not planets:
            return self.phi
        
        # Use Sun-Moon angle as primary ratio base
        sun_pos = planets.get("sun", {}).get("longitude", 0)
        moon_pos = planets.get("moon", {}).get("longitude", 180)
        
        angle_diff = abs(sun_pos - moon_pos) % 360
        
        # Convert to phi-related ratio
        ratio = (angle_diff / 360) * self.phi
        
        # Ensure result is in meaningful range
        while ratio > 3:
            ratio /= self.phi
        while ratio < 0.5:
            ratio *= self.phi
        
        return ratio
    
    def _calculate_phi_meditation_times(self, primary_phi: float) -> List[str]:
        """Calculate optimal meditation times based on phi cycles"""
        times = []
        
        # Use phi ratio to determine optimal daily times
        base_hour = 6  # 6 AM as starting point
        
        for i in range(3):  # Three optimal times per day
            hour = (base_hour + (i * primary_phi * 6)) % 24
            minute = ((hour % 1) * 60) % 60
            time_str = f"{int(hour):02d}:{int(minute):02d}"
            times.append(time_str)
        
        return times
    
    def _get_fibonacci_activity_type(self, position: int, fib_num: int) -> str:
        """Determine activity type based on Fibonacci position"""
        activity_types = [
            "Initiation meditation",
            "Self-reflection practice", 
            "Creative expression",
            "Spiritual study",
            "Energy cultivation",
            "Wisdom integration",
            "Teaching/sharing",
            "Deep contemplation",
            "Transformation work",
            "Unity consciousness",
            "Service to others",
            "Transcendent practice"
        ]
        
        return activity_types[position] if position < len(activity_types) else "Advanced practice"
    
    def _estimate_lunar_phase(self, date: datetime) -> str:
        """Estimate lunar phase for given date (simplified)"""
        # Simplified lunar phase calculation
        # In production, would use accurate astronomical calculation
        day_of_month = date.day
        
        if 1 <= day_of_month <= 7:
            return "new_moon"
        elif 8 <= day_of_month <= 14:
            return "waxing_moon"
        elif 15 <= day_of_month <= 21:
            return "full_moon"
        else:
            return "waning_moon"
    
    def _calculate_mandala_symmetry(self, chart_data: Dict[str, Any]) -> int:
        """Calculate mandala symmetry order from chart"""
        # Use number of significant planetary placements
        planets = chart_data.get("planets", {})
        
        # Sacred numbers for mandala symmetry
        symmetry_options = [3, 4, 5, 6, 8, 12]
        
        # Base on planet count with sacred number preference
        planet_count = len(planets)
        
        # Prefer numbers with spiritual significance
        if planet_count >= 8:
            return 12  # Zodiacal
        elif planet_count >= 6:
            return 8   # Eightfold path
        elif planet_count >= 4:
            return 6   # Hexagonal harmony
        else:
            return 4   # Elemental square
    
    def _generate_color_harmonics(self, tcm_data: Optional[Dict[str, Any]]) -> List[str]:
        """Generate color harmonics from TCM elements"""
        default_colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]
        
        if not tcm_data:
            return default_colors
        
        # TCM element color correspondences
        element_colors = {
            "wood": "#228B22",    # Forest green
            "fire": "#FF4500",    # Orange red
            "earth": "#D2691E",   # Chocolate brown
            "metal": "#C0C0C0",   # Silver
            "water": "#000080"    # Navy blue
        }
        
        elemental_balance = tcm_data.get("elemental_balance", {})
        colors = []
        
        # Sort elements by strength and assign colors
        sorted_elements = sorted(elemental_balance.items(), key=lambda x: x[1], reverse=True)
        
        for element, _ in sorted_elements:
            if element in element_colors:
                colors.append(element_colors[element])
        
        # Pad with default colors if needed
        while len(colors) < 5:
            colors.extend(default_colors)
        
        return colors[:7]  # Return 7 colors for chakra correspondence
    
    def _generate_geometric_elements(
        self, golden_ratio: GoldenRatioAnalysis, tcm_data: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Generate geometric elements for mandala"""
        elements = []
        
        # Base geometric forms
        elements.extend([
            "Central sacred circle",
            "Golden ratio spiral",
            "Phi-proportioned triangles"
        ])
        
        # Add elements based on golden ratio analysis
        if golden_ratio.resonance_strength > 0.5:
            elements.extend([
                "Pentagonal symmetry patterns",
                "Fibonacci spiral segments",
                "Golden rectangle divisions"
            ])
        
        # Add TCM-based elements
        if tcm_data:
            primary_element = tcm_data.get("primary_constitution", {}).get("primary_element", "earth")
            elements.append(f"{primary_element.title()}-element geometric forms")
        
        return elements
    
    def _determine_meditation_focus(
        self, golden_ratio: GoldenRatioAnalysis, tcm_data: Optional[Dict[str, Any]]
    ) -> str:
        """Determine primary meditation focus"""
        
        if golden_ratio.resonance_strength > 0.7:
            return "Golden ratio harmony and divine proportion contemplation"
        elif tcm_data:
            primary_element = tcm_data.get("primary_constitution", {}).get("primary_element", "earth")
            return f"Constitutional balance through {primary_element} element meditation"
        else:
            return "Sacred geometry integration and spiritual harmony"
    
    def _calculate_analysis_confidence(
        self,
        chart_data: Dict[str, Any],
        golden_ratio: GoldenRatioAnalysis,
        tcm_data: Optional[Dict[str, Any]]
    ) -> float:
        """Calculate confidence score for analysis"""
        confidence_factors = []
        
        # Chart data quality
        if chart_data.get("planets"):
            confidence_factors.append(0.3)
        
        # Golden ratio analysis quality
        if golden_ratio.resonance_strength > 0.3:
            confidence_factors.append(0.3)
        
        # TCM integration quality
        if tcm_data and tcm_data.get("elemental_balance"):
            confidence_factors.append(0.3)
        
        # Base mathematical accuracy
        confidence_factors.append(0.1)  # Sacred geometry math is always accurate
        
        return min(sum(confidence_factors), 1.0)


# ===== MODULE EXPORTS =====

def calculate_sacred_geometry_analysis(
    year: int, month: int, day: int, hour: int = 12, minute: int = 0,
    lat: float = 0.0, lon: float = 0.0, timezone: str = "UTC",
    tcm_data: Optional[Dict[str, Any]] = None, user_id: Optional[str] = None
) -> SacredGeometryAnalysis:
    """
    Main function to calculate sacred geometry analysis
    Compatible with existing spiritual systems API
    """
    engine = SacredGeometryEngine()
    return engine.calculate_sacred_geometry_analysis(
        year, month, day, hour, minute, lat, lon, timezone, tcm_data, user_id
    )


# Create engine instance for module-level access
sacred_geometry_engine = SacredGeometryEngine()
