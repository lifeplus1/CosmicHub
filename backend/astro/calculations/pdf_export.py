# backend/astro/calculations/pdf_export.py
import logging
from typing import Dict, Any, Optional, List, TypedDict
class PlanetData(TypedDict, total=False):
    position: float
    retrograde: bool

class HouseData(TypedDict):
    house: int
    cusp: float

class AspectData(TypedDict, total=False):
    aspect: str
    point1: str
    point2: str
    orb: float

class ChartData(TypedDict, total=False):
    latitude: float
    longitude: float
    timezone: str
    julian_day: float
    planets: Dict[str, PlanetData]
    houses: List[HouseData]
    aspects: List[AspectData]

class BirthInfo(TypedDict, total=False):
    date: str
    time: str
    city: str

class CompatibilityBreakdown(TypedDict, total=False):
    # area: score

    ...

class CompatibilityAnalysis(TypedDict, total=False):
    overall_score: float
    interpretation: str
    breakdown: CompatibilityBreakdown

class InteraspectData(TypedDict, total=False):
    person1_planet: str
    aspect: str
    person2_planet: str
    orb: float
    strength: str
    interpretation: str

class SynastrySummary(TypedDict, total=False):
    key_themes: List[str]

class SynastryData(TypedDict, total=False):
    compatibility_analysis: CompatibilityAnalysis
    interaspects: List[InteraspectData]
    summary: SynastrySummary

class MultiSystemData(TypedDict, total=False):
    birth_info: BirthInfo
    western_tropical: Dict[str, Any]
    vedic_sidereal: Dict[str, Any]
    chinese: Dict[str, Any]
    mayan: Dict[str, Any]
    uranian: Dict[str, Any]
    synthesis: Dict[str, Any]
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
import io
import base64
from datetime import datetime

logger = logging.getLogger(__name__)

def create_chart_pdf(chart_data: ChartData, birth_info: Optional[BirthInfo] = None) -> str:
    """Generate PDF report from chart data and return as base64 string"""
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, 
                              rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        from typing import Any, List
        
        # Container for the 'Flowable' objects
        story: List[Any] = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue
        )
        
        subheading_style = ParagraphStyle( # type: ignore
            'CustomSubheading',
            parent=styles['Heading3'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=15,
            textColor=colors.darkgreen
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        )
        
        # Title
        if birth_info:
            title_text = f"Astrological Chart Report"
            story.append(Paragraph(title_text, title_style))
            story.append(Spacer(1, 12))
            
            # Birth Information
            birth_text = f"<b>Date:</b> {birth_info.get('date', 'Unknown')}<br/>"
            birth_text += f"<b>Time:</b> {birth_info.get('time', 'Unknown')}<br/>"
            birth_text += f"<b>Location:</b> {birth_info.get('city', 'Unknown')}"
            story.append(Paragraph(birth_text, normal_style))
        else:
            story.append(Paragraph("Astrological Chart Report", title_style))
        
        story.append(Spacer(1, 20))
        
        # Chart Information
        if chart_data.get('latitude') and chart_data.get('longitude'):
            coord_text = f"<b>Coordinates:</b> {chart_data['latitude']:.2f}°, {chart_data['longitude']:.2f}°<br/>" # type: ignore
            coord_text += f"<b>Timezone:</b> {chart_data.get('timezone', 'Unknown')}<br/>"
            coord_text += f"<b>Julian Day:</b> {chart_data.get('julian_day', 'Unknown')}"
            story.append(Paragraph(coord_text, normal_style))
            story.append(Spacer(1, 15))
        
        # Planets Section
        planets = chart_data.get('planets')
        if planets:
            story.append(Paragraph("Planetary Positions", heading_style))
            planet_data: List[List[str]] = []
            planet_data.append(['Planet', 'Position', 'Retrograde'])
            planet_symbols = {
                'sun': '☉',
                'moon': '☽',
                'mercury': '☿',
                'venus': '♀',
                'mars': '♂',
                'jupiter': '♃',
                'saturn': '♄',
                'uranus': '♅',
                'neptune': '♆',
                'pluto': '♇'
            }
            zodiac_signs = [
                "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
            ]
            for planet, data in planets.items():
                position = data.get('position')
                if position is not None:
                    symbol = planet_symbols.get(planet, planet.title()) # type: ignore
                    sign_index = int(position // 30)
                    degree_in_sign = position % 30
                    sign = zodiac_signs[sign_index] if sign_index < len(zodiac_signs) else "Unknown"
                    position_str = f"{degree_in_sign:.2f}° {sign}" # type: ignore
                    retrograde = "Yes" if data.get('retrograde', False) else "No"
                    planet_data.append([
                        f"{symbol} {planet.title()}",
                        position_str,
                        retrograde
                    ])
            planet_table = Table(planet_data, colWidths=[1.5*inch, 2*inch, 1*inch])
            planet_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightcyan),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(planet_table)
            story.append(Spacer(1, 20))

            # Houses Section
            houses = chart_data.get('houses')
            if houses:
                story.append(Paragraph("House Cusps", heading_style))
                house_data: List[List[str]] = []
                house_data.append(['House', 'Cusp (°)'])
                for house in houses:
                    house_num = house.get('house', '')
                    cusp = house.get('cusp', '')
                    house_data.append([
                        str(house_num),
                        f"{cusp:.2f}"
                    ])
                house_table = Table(house_data, colWidths=[1.5*inch, 2*inch])
                house_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.lightgreen),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.lightyellow),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(house_table)
                story.append(Spacer(1, 20))

            # Aspects Section
            aspects = chart_data.get('aspects')
            if aspects:
                aspects_typed: List[AspectData] = aspects  # type: ignore
                story.append(Paragraph("Major Aspects", heading_style))
                aspect_data: List[List[str]] = []
                aspect_data.append(['Aspect', 'Planets', 'Orb', 'Type'])
                # Sort aspects by orb (most exact first)
                sorted_aspects = sorted(aspects_typed, key=lambda x: x.get('orb', 999))
                for aspect in sorted_aspects[:15]:  # Show top 15 aspects
                    aspect_name = aspect.get('aspect', 'Unknown')
                    point1 = aspect.get('point1', 'Unknown')
                    point2 = aspect.get('point2', 'Unknown')
                    orb = aspect.get('orb', 0)
                    # Determine aspect type
                    if orb <= 2:
                        aspect_type = "Exact"
                    elif orb <= 4:
                        aspect_type = "Close"
                    else:
                        aspect_type = "Wide"
                    aspect_data.append([
                        str(aspect_name),
                        f"{str(point1).title()} - {str(point2).title()}",
                        f"{orb:.2f}°",
                        aspect_type
                    ])
                aspect_table = Table(aspect_data, colWidths=[1.2*inch, 2*inch, 0.8*inch, 1*inch])
                aspect_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.lightcoral),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.lightpink),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('FONTSIZE', (0, 1), (-1, -1), 10)
                ]))
                story.append(aspect_table)
                story.append(Spacer(1, 20))
        
        # Aspects Section
        if chart_data.get('aspects'):
            story.append(Paragraph("Major Aspects", heading_style))
            
            aspect_data = []
            aspect_data.append(['Aspect', 'Planets', 'Orb', 'Type'])
            
            # Sort aspects by orb (most exact first)
            sorted_aspects = sorted(chart_data['aspects'], key=lambda x: x.get('orb', 999)) # type: ignore
            
            for aspect in sorted_aspects[:15]:  # Show top 15 aspects
                if isinstance(aspect, dict): # type: ignore
                    aspect_name = aspect.get('aspect', 'Unknown')
                    point1 = aspect.get('point1', 'Unknown')
                    point2 = aspect.get('point2', 'Unknown')
                    orb = aspect.get('orb', 0)
                    
                    # Determine aspect type
                    if orb <= 2:
                        aspect_type = "Exact"
                    elif orb <= 4:
                        aspect_type = "Close"
                    else:
                        aspect_type = "Wide"
                    
                    aspect_data.append([
                        aspect_name,
                        f"{point1.title()} - {point2.title()}",
                        f"{orb:.2f}°",
                        aspect_type
                    ])
            
            aspect_table = Table(aspect_data, colWidths=[1.2*inch, 2*inch, 0.8*inch, 1*inch])
            aspect_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightcoral),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightpink),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 10)
            ]))
            
            story.append(aspect_table)
            story.append(Spacer(1, 20))
        
        # Add interpretation section if available
        add_chart_interpretation(story, chart_data, styles)
        
        # Footer
        story.append(Spacer(1, 30))
        footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br/>"
        footer_text += "Report created by CosmicHub - Professional Astrology Platform"
        story.append(Paragraph(footer_text, ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF data and encode as base64
        pdf_data = buffer.getvalue()
        buffer.close()
        
        # Convert to base64 string
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        logger.info("PDF report generated successfully")
        return pdf_base64
        
    except Exception as e:
        logger.error(f"Error generating PDF report: {str(e)}", exc_info=True)
        raise ValueError(f"PDF generation failed: {str(e)}")

def add_chart_interpretation(story: list[Any], chart_data: ChartData, styles: Any):
    """Add basic chart interpretation to the PDF"""
    try:
        heading_style = ParagraphStyle(
            'InterpretationHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue
        )
        normal_style = ParagraphStyle(
            'InterpretationNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            alignment=TA_JUSTIFY
        )
        story.append(Paragraph("Chart Interpretation", heading_style))
        # Basic sun sign interpretation
        planets = chart_data.get('planets', {})
        zodiac_signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        if 'sun' in planets:
            sun_position = planets['sun'].get('position', 0)
            sun_sign_index = int(sun_position // 30)
            if sun_sign_index < len(zodiac_signs):
                sun_sign = str(zodiac_signs[sun_sign_index])
                sun_interpretations = {
                    "Aries": "You are naturally bold, energetic, and pioneering. Your leadership qualities shine through in most situations.",
                    "Taurus": "You value stability, comfort, and beauty. Your practical approach to life serves you well.",
                    "Gemini": "You are intellectually curious, communicative, and adaptable. Your versatility is one of your greatest strengths.",
                    "Cancer": "You are nurturing, intuitive, and emotionally sensitive. Your caring nature draws people to you.",
                    "Leo": "You are confident, creative, and naturally charismatic. Your warm personality lights up any room.",
                    "Virgo": "You are detail-oriented, practical, and service-minded. Your analytical skills help you solve complex problems.",
                    "Libra": "You seek harmony, beauty, and balance in all areas of life. Your diplomatic nature helps resolve conflicts.",
                    "Scorpio": "You are intense, passionate, and transformative. Your depth of feeling and insight is remarkable.",
                    "Sagittarius": "You are optimistic, adventurous, and philosophical. Your quest for meaning drives your life journey.",
                    "Capricorn": "You are ambitious, disciplined, and responsible. Your determination helps you achieve long-term goals.",
                    "Aquarius": "You are innovative, independent, and humanitarian. Your unique perspective benefits the collective.",
                    "Pisces": "You are compassionate, intuitive, and artistic. Your empathy and imagination are your superpowers."
                }
                interpretation = sun_interpretations.get(sun_sign, "Your sun sign represents your core identity and life purpose.")
                story.append(Paragraph(f"<b>Sun in {sun_sign}:</b> {interpretation}", normal_style))
                story.append(Spacer(1, 10))
        # Basic moon sign interpretation if available
        if 'moon' in planets:
            moon_position = planets['moon'].get('position', 0)
            moon_sign_index = int(moon_position // 30)
            if moon_sign_index < len(zodiac_signs):
                moon_sign = str(zodiac_signs[moon_sign_index])
                moon_text = f"<b>Moon in {moon_sign}:</b> Your emotional nature and inner needs are expressed through {moon_sign} qualities. "
                moon_text += "The moon represents your subconscious patterns, emotional responses, and what makes you feel secure."
                story.append(Paragraph(moon_text, normal_style))
                story.append(Spacer(1, 10))
        # Add disclaimer
        disclaimer = "<b>Note:</b> This is a basic computer-generated interpretation. For a comprehensive analysis, "
        disclaimer += "we recommend consulting with a professional astrologer who can provide personalized insights "
        disclaimer += "based on the complete chart and your specific life circumstances."
        story.append(Spacer(1, 15))
        story.append(Paragraph(disclaimer, ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            textColor=colors.grey,
            borderColor=colors.lightgrey,
            borderWidth=1,
            borderPadding=10
        )))
    except Exception as e:
        logger.error(f"Error adding chart interpretation: {str(e)}")
        # Continue without interpretation if there's an error

def create_synastry_pdf(synastry_data: SynastryData) -> str:
    """Generate PDF report for synastry analysis"""
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, 
                              rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        from typing import Any, List
        story: List[Any] = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'SynastryTitle',
            parent=styles['Heading1'],
            fontSize=22,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkred
        )
        
        story.append(Paragraph("Relationship Compatibility Report", title_style)) # type: ignore
        story.append(Spacer(1, 20)) # type: ignore # type: ignore
        
        # Compatibility Score
        compatibility = synastry_data.get('compatibility_analysis', {})
        overall_score = compatibility.get('overall_score', 0)
        
        score_text = f"<b>Overall Compatibility Score: {overall_score}/100</b><br/><br/>"
        score_text += f"<b>Interpretation:</b> {compatibility.get('interpretation', 'No interpretation available')}"
        
        story.append(Paragraph(score_text, ParagraphStyle( # type: ignore
            'ScoreStyle',
            parent=styles['Normal'],
            fontSize=14,
            spaceAfter=15,
            alignment=TA_CENTER,
            borderColor=colors.darkred,
            borderWidth=2,
            borderPadding=15
        )))
        
        # Compatibility Breakdown
        breakdown = compatibility.get('breakdown', {})
        if breakdown:
            story.append(Paragraph("Compatibility Areas", ParagraphStyle( # type: ignore
                'BreakdownHeading',
                parent=styles['Heading2'],
                fontSize=16,
                spaceAfter=12,
                textColor=colors.darkred
            )))
            
            breakdown_data = []
            breakdown_data.append(['Area', 'Score', 'Rating']) # type: ignore
            
            for area, score in breakdown.items():
                try:
                    score_val = float(score) # type: ignore
                except (TypeError, ValueError):
                    score_val = 0.0
                if score_val >= 75:
                    rating = "Excellent"
                elif score_val >= 60:
                    rating = "Good"
                elif score_val >= 45:
                    rating = "Fair"
                else:
                    rating = "Challenging"
                breakdown_data.append([ # type: ignore
                    area.title(),
                    f"{score_val:.1f}/100",
                    rating
                ])
            
            breakdown_table = Table(breakdown_data, colWidths=[2*inch, 1.5*inch, 1.5*inch]) # type: ignore
            breakdown_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lavender),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(breakdown_table) # type: ignore
            story.append(Spacer(1, 20)) # type: ignore
        
        # Top Aspects
        interaspects = synastry_data.get('interaspects', [])
        if interaspects:
            story.append(Paragraph("Key Relationship Aspects", ParagraphStyle(
                'AspectsHeading',
                parent=styles['Heading2'],
                fontSize=16,
                spaceAfter=12,
                textColor=colors.darkred
            )))
            
            # Show top 10 aspects
            for i, aspect in enumerate(interaspects[:10]):
                aspect_text = f"<b>{i+1}. {aspect.get('person1_planet', '').title()} {aspect.get('aspect', '')} {aspect.get('person2_planet', '').title()}</b><br/>"
                aspect_text += f"Orb: {aspect.get('orb', 0):.2f}° ({aspect.get('strength', 'Unknown')})<br/>"
                aspect_text += f"Interpretation: {aspect.get('interpretation', 'No interpretation available')}"
                
                story.append(Paragraph(aspect_text, ParagraphStyle(
                    'AspectStyle',
                    parent=styles['Normal'],
                    fontSize=11,
                    spaceAfter=12,
                    leftIndent=20
                )))
        
        # Relationship Themes
        summary = synastry_data.get('summary', {})
        themes = summary.get('key_themes', [])
        if themes:
            story.append(PageBreak())
            story.append(Paragraph("Relationship Themes", ParagraphStyle(
                'ThemesHeading',
                parent=styles['Heading2'],
                fontSize=16,
                spaceAfter=12,
                textColor=colors.darkred
            )))
            
            for theme in themes:
                story.append(Paragraph(f"• {theme}", ParagraphStyle(
                    'ThemeStyle',
                    parent=styles['Normal'],
                    fontSize=12,
                    spaceAfter=8,
                    leftIndent=20
                )))
        
        # Footer
        story.append(Spacer(1, 30))
        footer_text = f"Synastry Report generated on {datetime.now().strftime('%B %d, %Y')}<br/>"
        footer_text += "Report created by CosmicHub - Professional Astrology Platform"
        story.append(Paragraph(footer_text, ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )))
        
        # Build PDF
        doc.build(story)
        
        pdf_data = buffer.getvalue()
        buffer.close()
        
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        logger.info("Synastry PDF report generated successfully")
        return pdf_base64
        
    except Exception as e:
        logger.error(f"Error generating synastry PDF: {str(e)}", exc_info=True)
        raise ValueError(f"Synastry PDF generation failed: {str(e)}")

def create_multi_system_pdf(chart_data: MultiSystemData) -> str:
    """Generate PDF report for multi-system analysis"""
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, 
                              rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        from typing import Any, List
        story: List[Any] = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'MultiTitle',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.purple
        )
        
        story.append(Paragraph("Multi-System Astrological Analysis", title_style))
        story.append(Spacer(1, 20))
        
        # Birth Information
        birth_info = chart_data.get('birth_info', {})
        if birth_info:
            birth_text = f"<b>Date:</b> {birth_info.get('date', 'Unknown')}<br/>"
            birth_text += f"<b>Time:</b> {birth_info.get('time', 'Unknown')}<br/>"
            birth_text += f"<b>Location:</b> {birth_info.get('city', 'Unknown')}"
            story.append(Paragraph(birth_text, styles['Normal']))
            story.append(Spacer(1, 20))
        
        # Systems Overview
        systems = ['western_tropical', 'vedic_sidereal', 'chinese', 'mayan', 'uranian']
        system_names = {
            'western_tropical': 'Western Tropical Astrology',
            'vedic_sidereal': 'Vedic Sidereal Astrology',
            'chinese': 'Chinese Astrology',
            'mayan': 'Mayan Sacred Calendar',
            'uranian': 'Uranian Astrology'
        }
        
        for system in systems:
            if system in chart_data:
                system_data: Dict[str, Any] = chart_data[system]  # type: ignore
                system_name = system_names.get(system, system.title())
                
                story.append(Paragraph(system_name, ParagraphStyle(
                    'SystemHeading',
                    parent=styles['Heading2'],
                    fontSize=16,
                    spaceAfter=12,
                    textColor=colors.purple
                )))
                
                # Add system-specific information
                if not isinstance(system_data, dict):
                    try:
                        system_data = dict(system_data)
                    except Exception:
                        system_data = {}
                desc_val = system_data.get('description', f'{system_name} analysis')
                description: str = str(desc_val) if desc_val is not None else f'{system_name} analysis'
                story.append(Paragraph(description, styles['Normal']))
                story.append(Spacer(1, 15))
        
        # Synthesis
        synthesis = chart_data.get('synthesis', {})
        if synthesis:
            story.append(PageBreak())
            story.append(Paragraph("Integrated Analysis", ParagraphStyle(
                'SynthesisHeading',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=20,
                textColor=colors.purple
            )))
            
            # Primary themes
            themes = synthesis.get('primary_themes', [])
            if themes:
                story.append(Paragraph("Primary Themes", styles['Heading3']))
                for theme in themes:
                    story.append(Paragraph(f"• {theme}", styles['Normal']))
                story.append(Spacer(1, 15))
            
            # Life purpose
            purpose = synthesis.get('life_purpose', [])
            if purpose:
                story.append(Paragraph("Life Purpose Integration", styles['Heading3']))
                for item in purpose:
                    story.append(Paragraph(f"• {item}", styles['Normal']))
                story.append(Spacer(1, 15))
        
        # Footer
        story.append(Spacer(1, 30))
        footer_text = f"Multi-System Report generated on {datetime.now().strftime('%B %d, %Y')}<br/>"
        footer_text += "Report created by CosmicHub - Comprehensive Astrology Platform"
        story.append(Paragraph(footer_text, ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )))
        
        # Build PDF
        doc.build(story)
        
        pdf_data = buffer.getvalue()
        buffer.close()
        
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        logger.info("Multi-system PDF report generated successfully")
        return pdf_base64
        
    except Exception as e:
        logger.error(f"Error generating multi-system PDF: {str(e)}", exc_info=True)
        raise ValueError(f"Multi-system PDF generation failed: {str(e)}")
