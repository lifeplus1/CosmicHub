"""
AI-powered astrological interpretation endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, Any
from datetime import datetime

from auth import get_current_user
from database import get_firestore_client
from ..models.ai import (
    InterpretationRequest,
    InterpretationResponse,
    AIAnalysisRequest,
    AIAnalysisResponse
)
from ..services.ai_service import AIService
from ..services.astro_service import AstroService

router = APIRouter(prefix="/ai", tags=["ai"])

# Initialize services
ai_service = AIService()
astro_service = AstroService()

@router.post("/generate-interpretation", response_model=InterpretationResponse)
async def generate_interpretation(
    request: InterpretationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate AI-powered astrological interpretation for specific sections
    """
    try:
        # Validate chart data
        if not request.chartData or not request.chartData.get('planets'):
            raise HTTPException(status_code=400, detail="Invalid chart data provided")
        
        # Validate user access
        if request.userId != current_user.get('uid'):
            raise HTTPException(status_code=403, detail="Unauthorized access to chart")
        
        # Check if chart exists
        db = get_firestore_client()
        chart_ref = db.collection('charts').document(request.chartId)
        chart_doc = chart_ref.get()
        
        if not chart_doc.exists:
            raise HTTPException(status_code=404, detail="Chart not found")
        
        # Generate interpretations for requested sections
        interpretations = {}
        
        for section in request.sections:
            try:
                interpretation = await ai_service.generate_section_interpretation(
                    chart_data=request.chartData,
                    section=section,
                    user_id=request.userId
                )
                interpretations[section.replace('-', '')] = interpretation
            except Exception as e:
                print(f"Error generating {section} interpretation: {str(e)}")
                # Continue with other sections even if one fails
                continue
        
        if not interpretations:
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate any interpretations"
            )
        
        # Save interpretations in background
        background_tasks.add_task(
            save_interpretation_to_db,
            request.chartId,
            interpretations
        )
        
        return InterpretationResponse(
            chartId=request.chartId,
            interpretations=interpretations,
            generatedAt=datetime.utcnow(),
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_interpretation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/analyze-chart", response_model=AIAnalysisResponse)
async def analyze_chart(
    request: AIAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Perform comprehensive AI analysis of an astrological chart
    """
    try:
        # Validate access
        if request.userId != current_user.get('uid'):
            raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Get comprehensive analysis
        analysis = await ai_service.analyze_chart_comprehensive(
            chart_data=request.chartData,
            analysis_type=request.analysisType,
            user_preferences=request.userPreferences
        )
        
        return AIAnalysisResponse(
            analysis=analysis,
            confidence=analysis.get('confidence', 0.8),
            analysisType=request.analysisType,
            generatedAt=datetime.utcnow()
        )
        
    except Exception as e:
        print(f"Error in analyze_chart: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze chart")

@router.post("/ask-question")
async def ask_astrological_question(
    question: str,
    chart_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """
    Ask a specific question about an astrological chart
    """
    try:
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # Get AI response to the question
        response = await ai_service.answer_chart_question(
            question=question,
            chart_data=chart_data,
            user_id=current_user.get('uid')
        )
        
        return {
            "answer": response,
            "question": question,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        print(f"Error answering question: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to answer question")

@router.get("/interpretation-history/{chart_id}")
async def get_interpretation_history(
    chart_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get interpretation history for a chart
    """
    try:
        db = get_firestore_client()
        
        # Verify chart ownership
        chart_ref = db.collection('charts').document(chart_id)
        chart_doc = chart_ref.get()
        
        if not chart_doc.exists:
            raise HTTPException(status_code=404, detail="Chart not found")
        
        chart_data = chart_doc.to_dict()
        if chart_data.get('userId') != current_user.get('uid'):
            raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Get interpretation history
        interpretations_ref = db.collection('interpretations').where(
            'chartId', '==', chart_id
        ).order_by('createdAt', direction='desc')
        
        interpretations = []
        for doc in interpretations_ref.stream():
            data = doc.to_dict()
            interpretations.append({
                'id': doc.id,
                'sections': data.get('sections', []),
                'createdAt': data.get('createdAt'),
                'summary': data.get('summary', '')
            })
        
        return {
            "chartId": chart_id,
            "interpretations": interpretations,
            "total": len(interpretations)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting interpretation history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get history")

@router.post("/regenerate-section/{chart_id}/{section}")
async def regenerate_section(
    chart_id: str,
    section: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Regenerate a specific interpretation section
    """
    try:
        db = get_firestore_client()
        
        # Get chart data
        chart_ref = db.collection('charts').document(chart_id)
        chart_doc = chart_ref.get()
        
        if not chart_doc.exists:
            raise HTTPException(status_code=404, detail="Chart not found")
        
        chart_data = chart_doc.to_dict()
        if chart_data.get('userId') != current_user.get('uid'):
            raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Generate new interpretation for the section
        interpretation = await ai_service.generate_section_interpretation(
            chart_data=chart_data.get('chartData'),
            section=section,
            user_id=current_user.get('uid'),
            regenerate=True
        )
        
        # Update in database
        interpretation_ref = db.collection('interpretations').document(chart_id)
        interpretation_ref.update({
            f'sections.{section.replace("-", "")}': interpretation,
            'updatedAt': datetime.utcnow()
        })
        
        return {
            "section": section,
            "interpretation": interpretation,
            "regeneratedAt": datetime.utcnow(),
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error regenerating section: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to regenerate section")

@router.get("/available-sections")
async def get_available_sections():
    """
    Get list of available interpretation sections
    """
    sections = [
        {
            "id": "core-identity",
            "title": "Core Identity",
            "description": "Fundamental nature and personality",
            "icon": "🌟",
            "estimatedTime": 30
        },
        {
            "id": "life-purpose",
            "title": "Life Purpose",
            "description": "Soul mission and spiritual path",
            "icon": "🎯",
            "estimatedTime": 45
        },
        {
            "id": "career-path",
            "title": "Career & Vocation",
            "description": "Professional strengths and ideal work",
            "icon": "💼",
            "estimatedTime": 40
        },
        {
            "id": "relationships",
            "title": "Relationships",
            "description": "Love patterns and partnership dynamics",
            "icon": "💕",
            "estimatedTime": 35
        },
        {
            "id": "growth-challenges",
            "title": "Growth & Challenges",
            "description": "Development areas and karmic lessons",
            "icon": "🌱",
            "estimatedTime": 50
        },
        {
            "id": "spiritual-gifts",
            "title": "Spiritual Gifts",
            "description": "Psychic abilities and spiritual talents",
            "icon": "✨",
            "estimatedTime": 40
        },
        {
            "id": "integration-themes",
            "title": "Integration Themes",
            "description": "Balance points and unity areas",
            "icon": "⚡",
            "estimatedTime": 45
        }
    ]
    
    return {
        "sections": sections,
        "totalSections": len(sections),
        "maxSections": 7
    }

async def save_interpretation_to_db(chart_id: str, interpretations: Dict[str, Any]):
    """
    Background task to save interpretations to database
    """
    try:
        db = get_firestore_client()
        interpretation_ref = db.collection('interpretations').document(chart_id)
        
        # Check if interpretation document exists
        interpretation_doc = interpretation_ref.get()
        
        if interpretation_doc.exists:
            # Update existing interpretation
            interpretation_ref.update({
                'sections': {**interpretation_doc.to_dict().get('sections', {}), **interpretations},
                'updatedAt': datetime.utcnow()
            })
        else:
            # Create new interpretation document
            interpretation_ref.set({
                'chartId': chart_id,
                'sections': interpretations,
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            })
        
        print(f"Successfully saved interpretations for chart {chart_id}")
        
    except Exception as e:
        print(f"Error saving interpretations to database: {str(e)}")

@router.get("/health")
async def health_check():
    """AI service health check"""
    try:
        # Test AI service connection
        health_status = await ai_service.health_check()
        return {
            "status": "healthy" if health_status else "degraded",
            "aiService": health_status,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }
