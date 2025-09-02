"""
SPIRITUAL-001 Week 2 - Spiritual Practices API Endpoints
========================================================

Flask API endpoints implementing Grok Response #4 spiritual practice methods:
- Tree of Life pathworking sessions
- Tarot meditation practices  
- Hebrew letter contemplation
- Daily spiritual routines
- Safety monitoring and assessment

Integrates with spiritual_practices.py engine for authentic practice delivery.
"""

from flask import Blueprint, request, jsonify, current_app
from typing import Dict, List, Optional, Any, Union
import logging
from datetime import datetime, timedelta
import json

# Import spiritual practices engine
from ..services.spiritual_practices import (
    SpiritualPracticesEngine, 
    PracticeLevel, 
    PathworkingType,
    SafetyLevel,
    TREE_OF_LIFE_PATHS,
    HEBREW_LETTERS
)
from ..services.spiritual import SpiritualEngine
from ..services.spiritual_ai_enhanced import SpiritualAIEnhanced

# Import utilities
from ...auth import require_auth, get_current_user
from ...utils.validation import validate_request
from ...utils.error_handling import handle_api_error

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
spiritual_practices_bp = Blueprint('spiritual_practices', __name__, url_prefix='/api/spiritual/practices')

# Initialize engines (would be dependency injection in production)
spiritual_engine = SpiritualEngine()
ai_enhanced = SpiritualAIEnhanced()
practices_engine = SpiritualPracticesEngine(spiritual_engine, ai_enhanced)

@spiritual_practices_bp.route('/assess-readiness', methods=['POST'])
@require_auth
def assess_practice_readiness():
    """
    Assess user readiness for specific spiritual practice
    
    Request body:
    {
        "practice_type": "pathworking|tarot|hebrew|daily_routine",
        "level": "beginner|intermediate|advanced|master",
        "session_details": {...}
    }
    
    Returns:
    {
        "ready": bool,
        "checks": {...},
        "recommendations": [...],
        "estimated_preparation_days": int
    }
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['practice_type', 'level']
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required': required_fields
            }), 400
        
        practice_type = data['practice_type']
        level = PracticeLevel(data['level'])
        
        # Perform readiness assessment
        assessment = practices_engine.assess_practice_readiness(
            user_id=user_id,
            practice_type=practice_type,
            level=level
        )
        
        # Add safety recommendations
        assessment['safety_protocols'] = practices_engine.safety_protocols.get(
            practice_type, 
            practices_engine.safety_protocols.get('pathworking_basic')
        ).__dict__ if practice_type in practices_engine.safety_protocols else None
        
        # Log assessment
        logger.info(f"Practice readiness assessed for user {user_id}: {practice_type} at {level.value}")
        
        return jsonify({
            'status': 'success',
            'assessment': assessment,
            'timestamp': datetime.now().isoformat(),
            'practice_guidelines': {
                'maximum_daily_sessions': 1,
                'minimum_rest_hours': 24,
                'grounding_required': True,
                'mentor_recommended': level in [PracticeLevel.ADVANCED, PracticeLevel.MASTER]
            }
        }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid practice assessment request: {str(e)}")
        return jsonify({'error': f'Invalid request: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Error assessing practice readiness: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/pathworking/generate', methods=['POST'])
@require_auth 
def generate_pathworking_session():
    """
    Generate Tree of Life pathworking session
    
    Request body:
    {
        "path_number": int (13-32),
        "user_level": "beginner|intermediate|advanced|master",
        "session_duration": int (minutes),
        "session_type": "visualization|correspondence|invocation|full_ritual"
    }
    
    Returns:
    Complete pathworking session with audio guidance, safety protocols
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        # Validate required fields
        path_number = data.get('path_number')
        user_level = data.get('user_level', 'beginner')
        session_duration = data.get('session_duration', 20)
        session_type = data.get('session_type', 'visualization')
        
        if not path_number:
            return jsonify({'error': 'path_number is required'}), 400
        
        if path_number not in TREE_OF_LIFE_PATHS:
            return jsonify({
                'error': f'Invalid path number: {path_number}',
                'available_paths': list(TREE_OF_LIFE_PATHS.keys())
            }), 400
        
        try:
            level = PracticeLevel(user_level)
        except ValueError:
            return jsonify({
                'error': f'Invalid user level: {user_level}',
                'valid_levels': [level.value for level in PracticeLevel]
            }), 400
        
        # Generate pathworking session
        session = practices_engine.generate_pathworking_session(
            path_number=path_number,
            user_level=level,
            session_duration=session_duration
        )
        
        # Check for generation errors
        if 'error' in session:
            return jsonify(session), 400
        
        # Perform safety check
        safety_check = practices_engine.perform_safety_check(
            user_id=user_id,
            practice_session={
                'type': 'pathworking',
                'level': level,
                'path_number': path_number,
                'duration': session_duration,
                'preparation_complete': False,  # User must confirm
                'protection_invoked': False     # User must confirm
            }
        )
        
        # Add safety information to session
        session['safety_check'] = safety_check
        session['emergency_protocol'] = {
            'immediate_grounding': [
                "Open eyes immediately",
                "Feel feet firmly on ground", 
                "Count 5 objects you can see",
                "Take 10 deep breaths",
                "Drink water and eat something"
            ],
            'support_contact': 'If distress persists beyond 30 minutes, contact spiritual mentor or healthcare provider'
        }
        
        # Add mobile-optimized guidance
        session['mobile_guidance'] = {
            'preparation_checklist': [
                {'step': 'Find quiet space', 'completed': False},
                {'step': 'Set intention', 'completed': False},
                {'step': 'Invoke protection', 'completed': False},
                {'step': 'Begin grounding', 'completed': False}
            ],
            'audio_cues': {
                'binaural_frequency': session.get('binaural_frequency', 210.42),
                'voice_guidance': True,
                'background_sounds': 'Nature sounds recommended'
            },
            'integration_prompts': [
                'What insights arose during the journey?',
                'How does this path relate to your current life?',
                'What practical wisdom can you apply today?'
            ]
        }
        
        logger.info(f"Generated pathworking session for user {user_id}: Path {path_number} at {level.value}")
        
        return jsonify({
            'status': 'success',
            'session': session,
            'session_id': f"{user_id}_pathworking_{path_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'estimated_duration': session_duration,
            'traditional_notes': {
                'source': 'Golden Dawn Tree of Life traditions',
                'authenticity': 'Adapted for digital practice while preserving core meaning',
                'respect': 'Approach with reverence for the sacred tradition'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating pathworking session: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/tarot/meditation', methods=['POST'])
@require_auth
def generate_tarot_meditation():
    """
    Generate Tarot meditation session
    
    Request body:
    {
        "meditation_type": "daily|journey|correspondence",
        "user_level": "beginner|intermediate|advanced|master", 
        "card_preference": "optional specific card",
        "focus_area": "general|relationships|career|spiritual"
    }
    
    Returns:
    Complete Tarot meditation with card selection and guidance
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        meditation_type = data.get('meditation_type', 'daily')
        user_level = data.get('user_level', 'beginner')
        card_preference = data.get('card_preference')
        focus_area = data.get('focus_area', 'general')
        
        # Validate meditation type
        valid_types = ['daily', 'journey', 'correspondence']
        if meditation_type not in valid_types:
            return jsonify({
                'error': f'Invalid meditation type: {meditation_type}',
                'valid_types': valid_types
            }), 400
        
        try:
            level = PracticeLevel(user_level)
        except ValueError:
            return jsonify({
                'error': f'Invalid user level: {user_level}',
                'valid_levels': [level.value for level in PracticeLevel]
            }), 400
        
        # Generate Tarot meditation
        meditation = practices_engine.generate_tarot_meditation(
            meditation_type=meditation_type,
            user_level=level,
            card_preference=card_preference
        )
        
        # Check for generation errors
        if 'error' in meditation:
            return jsonify(meditation), 400
        
        # Add AI-enhanced personalization
        try:
            ai_insights = ai_enhanced.get_spiritual_insights(user_id)
            personalized_guidance = ai_enhanced.generate_personalized_interpretation(
                card_name=meditation['card'],
                user_context=ai_insights.get('current_focus', {}),
                depth_level=level.value
            )
            meditation['ai_personalization'] = personalized_guidance
        except Exception as e:
            logger.warning(f"Could not generate AI personalization: {str(e)}")
            meditation['ai_personalization'] = None
        
        # Add mobile optimization
        meditation['mobile_features'] = {
            'card_image_url': f"/api/spiritual/tarot/card-image/{meditation['card'].replace(' ', '_').lower()}",
            'audio_pronunciation': meditation.get('card', '').replace(' ', '_').lower(),
            'interactive_elements': {
                'tap_to_reveal': True,
                'swipe_navigation': True,
                'voice_notes': True
            },
            'daily_integration': {
                'morning_reflection': f"How can {meditation['card']}'s energy guide your day?",
                'evening_review': f"How did {meditation['card']}'s wisdom manifest today?",
                'weekly_synthesis': f"What patterns do you notice with {meditation['card']}?"
            }
        }
        
        # Track the meditation session
        session_id = f"{user_id}_tarot_{meditation_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        logger.info(f"Generated Tarot meditation for user {user_id}: {meditation['card']} ({meditation_type})")
        
        return jsonify({
            'status': 'success',
            'meditation': meditation,
            'session_id': session_id,
            'focus_area': focus_area,
            'traditional_notes': {
                'approach': 'Respectful contemplation of sacred symbolism',
                'integration': 'Apply insights to daily spiritual practice',
                'progression': 'Build understanding through consistent practice'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating Tarot meditation: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/hebrew/contemplation', methods=['POST'])
@require_auth
def generate_hebrew_letter_session():
    """
    Generate Hebrew letter contemplation session
    
    Request body:
    {
        "letter": "Aleph|Beth|Gimel|...",
        "user_level": "beginner|intermediate|advanced|master",
        "include_gematria": bool,
        "study_focus": "meaning|pronunciation|correspondences|meditation"
    }
    
    Returns:
    Complete Hebrew letter contemplation with cultural respect
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        letter = data.get('letter')
        user_level = data.get('user_level', 'beginner')
        include_gematria = data.get('include_gematria', True)
        study_focus = data.get('study_focus', 'meaning')
        
        if not letter:
            return jsonify({
                'error': 'Letter is required',
                'available_letters': list(HEBREW_LETTERS.keys())
            }), 400
        
        if letter not in HEBREW_LETTERS:
            return jsonify({
                'error': f'Letter {letter} not available',
                'available_letters': list(HEBREW_LETTERS.keys())
            }), 400
        
        try:
            level = PracticeLevel(user_level)
        except ValueError:
            return jsonify({
                'error': f'Invalid user level: {user_level}',
                'valid_levels': [level.value for level in PracticeLevel]
            }), 400
        
        # Generate Hebrew letter session
        session = practices_engine.generate_hebrew_letter_session(
            letter=letter,
            user_level=level,
            include_gematria=include_gematria
        )
        
        # Check for generation errors
        if 'error' in session:
            return jsonify(session), 400
        
        # Add cultural respect and safety information
        session['cultural_respect'] = {
            'tradition_honor': [
                'This is a sacred practice from the Hebrew mystical tradition',
                'Approach with reverence and cultural sensitivity',
                'Study traditional sources for deeper understanding',
                'Consider learning from qualified teachers for advanced work'
            ],
            'pronunciation_guide': {
                'audio_available': True,
                'phonetic_guide': session['pronunciation'],
                'practice_recommendation': 'Listen to native Hebrew speakers when possible'
            },
            'safety_guidelines': [
                'Limit sessions to recommended duration',
                'Maintain grounding throughout practice',
                'Avoid obsessive repetition',
                'Seek community guidance for questions'
            ]
        }
        
        # Add mobile optimization for Hebrew practice
        session['mobile_features'] = {
            'letter_display': {
                'large_font': True,
                'right_to_left': True,
                'pronunciation_audio': f"/api/spiritual/hebrew/audio/{letter.lower()}",
                'meaning_animation': True
            },
            'gematria_calculator': {
                'interactive': True,
                'personal_name_calculation': True,
                'number_meditation_timer': True
            },
            'practice_timer': {
                'recommended_duration': session['meditation_duration'],
                'gentle_chimes': True,
                'grounding_reminder': True
            }
        }
        
        # Ensure appropriate safety for level
        if level == PracticeLevel.BEGINNER and include_gematria:
            session['gematria_simplified'] = {
                'basic_value': HEBREW_LETTERS[letter]['gematria'],
                'simple_exercises': [
                    f"Contemplate the number {HEBREW_LETTERS[letter]['gematria']}",
                    "Notice this number appearing in your day",
                    "Reflect on what this number means to you"
                ],
                'advanced_note': 'Deeper gematria work available at intermediate level'
            }
        
        session_id = f"{user_id}_hebrew_{letter}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        logger.info(f"Generated Hebrew letter session for user {user_id}: {letter} at {level.value}")
        
        return jsonify({
            'status': 'success',
            'session': session,
            'session_id': session_id,
            'study_focus': study_focus,
            'traditional_context': {
                'source_tradition': 'Hebrew Kabbalah and mystical Judaism',
                'learning_approach': 'Progressive study with cultural respect',
                'community_connection': 'Consider joining study groups for deeper learning'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating Hebrew letter session: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/daily-routine/generate', methods=['POST'])
@require_auth
def generate_daily_routine():
    """
    Generate personalized daily spiritual practice routine
    
    Request body:
    {
        "user_level": "beginner|intermediate|advanced|master",
        "available_time": int (minutes per day),
        "spiritual_goals": [...],
        "lifestyle_constraints": {...},
        "focus_areas": [...]
    }
    
    Returns:
    Complete daily routine with morning/evening practices
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        user_level = data.get('user_level', 'beginner')
        available_time = data.get('available_time', 20)
        spiritual_goals = data.get('spiritual_goals', ['general_development'])
        lifestyle_constraints = data.get('lifestyle_constraints', {})
        focus_areas = data.get('focus_areas', [])
        
        try:
            level = PracticeLevel(user_level)
        except ValueError:
            return jsonify({
                'error': f'Invalid user level: {user_level}',
                'valid_levels': [level.value for level in PracticeLevel]
            }), 400
        
        # Generate daily routine
        routine = practices_engine.generate_daily_routine(
            user_level=level,
            user_goals=spiritual_goals,
            available_time=available_time
        )
        
        # Add lifestyle adaptations
        routine['lifestyle_adaptations'] = {
            'busy_schedule': {
                'micro_practices': [
                    '3-minute morning grounding',
                    'Mindful breathing during transitions',
                    '5-minute evening gratitude'
                ],
                'integration_tips': [
                    'Use commute time for contemplation',
                    'Practice awareness during daily tasks',
                    'Set phone reminders for mindful moments'
                ]
            },
            'travel_modifications': {
                'portable_practices': [
                    'Breath awareness (no equipment needed)',
                    'Mental Tarot contemplation',
                    'Gratitude journaling in phone'
                ],
                'timezone_adjustments': 'Maintain relative timing rather than absolute'
            }
        }
        
        # Add progress tracking features
        routine['progress_tracking'] = {
            'daily_checkpoints': [
                {'practice': 'Morning routine completed', 'points': 10},
                {'practice': 'Evening routine completed', 'points': 10},
                {'practice': 'Insights journaled', 'points': 5},
                {'practice': 'Grounding maintained', 'points': 5}
            ],
            'weekly_goals': [
                f'Complete {level.value} level practices 5+ days',
                'Notice one practical application of spiritual insights',
                'Maintain consistent sleep schedule'
            ],
            'advancement_milestones': {
                'consistency_streak': '21 days for habit formation',
                'depth_development': 'Regular insights and integration',
                'safety_maintenance': 'No adverse effects reported'
            }
        }
        
        # Add mobile optimization
        routine['mobile_optimization'] = {
            'notification_schedule': {
                'morning_reminder': '7:00 AM (customizable)',
                'midday_check': '12:00 PM mindfulness reminder',
                'evening_prompt': '8:00 PM reflection time'
            },
            'quick_access': {
                'widget_practices': ['3-min grounding', 'Daily affirmation', 'Gratitude entry'],
                'offline_content': True,
                'progress_widgets': True
            },
            'community_features': {
                'practice_sharing': 'Share insights (privacy controlled)',
                'group_challenges': 'Join 30-day practice challenges',
                'mentor_check_ins': 'Weekly mentor connection (advanced users)'
            }
        }
        
        routine_id = f"{user_id}_routine_{level.value}_{datetime.now().strftime('%Y%m%d')}"
        
        logger.info(f"Generated daily routine for user {user_id}: {level.value} level, {available_time} min/day")
        
        return jsonify({
            'status': 'success',
            'routine': routine,
            'routine_id': routine_id,
            'personalization': {
                'level': level.value,
                'daily_time': available_time,
                'focus_areas': focus_areas,
                'goals': spiritual_goals
            },
            'implementation_guide': {
                'week_1': 'Focus on consistency over perfection',
                'week_2': 'Add depth to practices',
                'week_3': 'Notice patterns and insights',
                'week_4': 'Integrate learnings into daily life'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating daily routine: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/safety-check', methods=['POST'])
@require_auth
def perform_safety_check():
    """
    Perform comprehensive safety check for spiritual practice
    
    Request body:
    {
        "practice_session": {
            "type": "pathworking|tarot|hebrew|daily",
            "level": "beginner|intermediate|advanced|master",
            "duration": int,
            "preparation_complete": bool,
            "protection_invoked": bool
        },
        "current_state": {
            "grounded": bool,
            "recent_adverse_effects": [...],
            "sleep_quality": "good|fair|poor",
            "stress_level": 1-10
        }
    }
    
    Returns:
    Safety assessment with warnings and recommendations
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        practice_session = data.get('practice_session', {})
        current_state = data.get('current_state', {})
        
        # Validate practice session data
        required_session_fields = ['type', 'level', 'duration']
        if not all(field in practice_session for field in required_session_fields):
            return jsonify({
                'error': 'Incomplete practice session data',
                'required_fields': required_session_fields
            }), 400
        
        # Perform safety check
        safety_status = practices_engine.perform_safety_check(
            user_id=user_id,
            practice_session=practice_session
        )
        
        # Add current state assessment
        state_assessment = {
            'grounding_status': 'good' if current_state.get('grounded', False) else 'needs_attention',
            'readiness_indicators': {
                'sleep_quality': current_state.get('sleep_quality', 'unknown'),
                'stress_level': current_state.get('stress_level', 5),
                'recent_practice_effects': current_state.get('recent_adverse_effects', [])
            }
        }
        
        # Generate recommendations based on state
        recommendations = []
        if current_state.get('stress_level', 5) > 7:
            recommendations.append('Consider lighter practice or pure grounding today')
        if current_state.get('sleep_quality') == 'poor':
            recommendations.append('Prioritize rest over intensive spiritual practice')
        if current_state.get('recent_adverse_effects'):
            recommendations.append('Take a practice break and focus on integration')
        
        # Add emergency protocols
        emergency_protocols = {
            'immediate_grounding': [
                'Feet on earth, hands on ground',
                'Eat grounding foods (apple, bread, nuts)',
                'Cold water on wrists and face',
                'Physical movement and stretching'
            ],
            'emotional_regulation': [
                'Deep breathing: 4 counts in, 6 counts out',
                'Progressive muscle relaxation',
                'Call trusted friend or mentor',
                'Engage in mundane, grounding activities'
            ],
            'when_to_seek_help': [
                'Symptoms persist beyond 2 hours',
                'Sleep disturbances for 3+ nights',
                'Persistent anxiety or depression',
                'Disconnection from daily life'
            ]
        }
        
        logger.info(f"Safety check performed for user {user_id}: {practice_session['type']} practice")
        
        return jsonify({
            'status': 'success',
            'safety_status': safety_status,
            'state_assessment': state_assessment,
            'recommendations': recommendations,
            'emergency_protocols': emergency_protocols,
            'support_resources': {
                'spiritual_emergency_guidance': '/api/spiritual/emergency-support',
                'community_support': '/api/spiritual/community/support',
                'professional_referrals': '/api/spiritual/professional-support'
            },
            'follow_up': {
                'check_in_hours': 24,
                'next_practice_minimum_wait': 24 if not safety_status['safe_to_proceed'] else 0
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error performing safety check: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/session/start', methods=['POST'])
@require_auth
def start_practice_session():
    """
    Start a spiritual practice session with tracking
    
    Request body:
    {
        "practice_type": "pathworking|tarot|hebrew|daily",
        "session_content": {...},
        "level": "beginner|intermediate|advanced|master",
        "estimated_duration": int
    }
    
    Returns:
    Session ID and monitoring information
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        practice_type = data.get('practice_type')
        session_content = data.get('session_content', {})
        level = data.get('level', 'beginner')
        estimated_duration = data.get('estimated_duration', 15)
        
        if not practice_type:
            return jsonify({'error': 'practice_type is required'}), 400
        
        try:
            practice_level = PracticeLevel(level)
        except ValueError:
            return jsonify({'error': f'Invalid level: {level}'}), 400
        
        # Create session using practices engine
        from ..services.spiritual_practices import PracticeType
        
        # Map string to enum
        practice_type_map = {
            'pathworking': PracticeType.PATHWORKING,
            'tarot': PracticeType.TAROT_MEDITATION,
            'hebrew': PracticeType.HEBREW_CONTEMPLATION,
            'daily': PracticeType.DAILY_ROUTINE
        }
        
        if practice_type not in practice_type_map:
            return jsonify({
                'error': f'Invalid practice type: {practice_type}',
                'valid_types': list(practice_type_map.keys())
            }), 400
        
        session_id = practices_engine.start_practice_session(
            user_id=user_id,
            practice_type=practice_type_map[practice_type],
            content=session_content,
            level=practice_level
        )
        
        logger.info(f"Started practice session {session_id} for user {user_id}")
        
        return jsonify({
            'status': 'success',
            'session_id': session_id,
            'practice_type': practice_type,
            'level': level,
            'estimated_duration': estimated_duration,
            'monitoring': {
                'safety_check_interval': 15,  # minutes
                'auto_timeout': estimated_duration + 10,
                'emergency_contact': True
            },
            'session_guidance': {
                'preparation_complete': False,
                'protection_invoked': False,
                'grounding_verified': False,
                'intention_set': False
            }
        }), 200
        
    except ValueError as e:
        logger.warning(f"Session start validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error starting practice session: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/session/<session_id>/complete', methods=['POST'])
@require_auth
def complete_practice_session(session_id: str):
    """
    Complete a practice session and record insights
    
    Request body:
    {
        "insights": [...],
        "adverse_effects": [...],
        "completion_quality": "full|partial|interrupted",
        "integration_plan": [...]
    }
    
    Returns:
    Session completion summary and next steps
    """
    try:
        user_id = get_current_user()['user_id']
        data = request.get_json()
        
        insights = data.get('insights', [])
        adverse_effects = data.get('adverse_effects', [])
        completion_quality = data.get('completion_quality', 'full')
        integration_plan = data.get('integration_plan', [])
        
        # Complete session using practices engine
        completion_summary = practices_engine.complete_practice_session(
            session_id=session_id,
            insights=insights,
            adverse_effects=adverse_effects
        )
        
        # Add integration support
        completion_summary['integration_support'] = {
            'immediate_actions': [
                'Journal insights while fresh',
                'Perform grounding exercises',
                'Avoid alcohol/intoxicants for 24 hours',
                'Plan practical application of wisdom'
            ],
            'follow_up_care': [
                'Reflect on insights over next 3 days',
                'Notice how practice wisdom appears in daily life',
                'Share meaningful insights with trusted community',
                'Plan next practice session'
            ],
            'progress_tracking': {
                'insights_recorded': len(insights),
                'practice_consistency': 'to_be_calculated',
                'advancement_readiness': 'to_be_assessed'
            }
        }
        
        # Track progress
        progress_update = practices_engine.track_practice_progress(
            user_id=user_id,
            session_data={
                'session_id': session_id,
                'completion_quality': completion_quality,
                'insights_count': len(insights),
                'adverse_effects': adverse_effects,
                'timestamp': datetime.now().isoformat()
            }
        )
        
        completion_summary['progress_update'] = progress_update
        
        logger.info(f"Completed practice session {session_id} for user {user_id}")
        
        return jsonify({
            'status': 'success',
            'completion_summary': completion_summary,
            'session_id': session_id,
            'next_session_available': (datetime.now() + timedelta(hours=24)).isoformat(),
            'celebration': 'Practice completed with dedication! 🙏' if completion_quality == 'full' else 'Thank you for your sincere effort! 🌟'
        }), 200
        
    except ValueError as e:
        logger.warning(f"Session completion error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error completing practice session: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/progress/<user_id_param>', methods=['GET'])
@require_auth
def get_practice_progress(user_id_param: str):
    """
    Get comprehensive practice progress for user
    
    Returns:
    Detailed progress analysis with insights and recommendations
    """
    try:
        current_user = get_current_user()
        user_id = current_user['user_id']
        
        # Verify user can access this data (self or authorized mentor)
        if user_id_param != user_id and not current_user.get('is_mentor', False):
            return jsonify({'error': 'Unauthorized to view this user\'s progress'}), 403
        
        # Get safety status
        safety_status = practices_engine.get_safety_status(user_id_param)
        
        # Get progress tracking (would normally come from database)
        progress_data = practices_engine.user_progress.get(user_id_param, {
            'sessions': [],
            'total_hours': 0,
            'current_level': PracticeLevel.BEGINNER,
            'achievements': [],
            'areas_for_growth': []
        })
        
        # Generate insights
        progress_insights = {
            'consistency_analysis': {
                'total_sessions': len(progress_data['sessions']),
                'total_hours': progress_data['total_hours'],
                'average_session_quality': 'calculating...',
                'practice_streak': 'calculating...'
            },
            'development_areas': {
                'strengths': progress_data.get('achievements', []),
                'growth_opportunities': progress_data.get('areas_for_growth', []),
                'recommended_focus': 'Continue building consistent foundation'
            },
            'advancement_status': {
                'current_level': progress_data['current_level'].value,
                'next_level_progress': '25%',  # Would be calculated
                'estimated_advancement': '2-3 months with consistent practice'
            }
        }
        
        logger.info(f"Retrieved practice progress for user {user_id_param}")
        
        return jsonify({
            'status': 'success',
            'user_id': user_id_param,
            'safety_status': safety_status,
            'progress_insights': progress_insights,
            'practice_summary': {
                'level': progress_data['current_level'].value,
                'total_experience': f"{progress_data['total_hours']:.1f} hours",
                'sessions_completed': len(progress_data['sessions']),
                'safety_record': 'Good' if safety_status['overall_status'] == 'safe' else 'Needs attention'
            },
            'recommendations': [
                'Maintain daily grounding practice',
                'Consider advancing to intermediate level when ready',
                'Join community practice group for support'
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving practice progress: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/resources/paths', methods=['GET'])
def get_tree_paths():
    """Get available Tree of Life paths with descriptions"""
    try:
        return jsonify({
            'status': 'success',
            'paths': TREE_OF_LIFE_PATHS,
            'total_paths': len(TREE_OF_LIFE_PATHS),
            'progression_guide': {
                'beginner': 'Start with paths 32, 31, 30',
                'intermediate': 'Add paths 29, 28, 27',
                'advanced': 'Explore all paths with proper preparation',
                'master': 'Teach and guide others in pathworking'
            }
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving tree paths: {str(e)}")
        return handle_api_error(e), 500

@spiritual_practices_bp.route('/resources/hebrew-letters', methods=['GET'])
def get_hebrew_letters():
    """Get available Hebrew letters with information"""
    try:
        return jsonify({
            'status': 'success',
            'letters': HEBREW_LETTERS,
            'total_letters': len(HEBREW_LETTERS),
            'study_progression': {
                'beginner': 'Aleph, Beth, Gimel - focus on meaning and pronunciation',
                'intermediate': 'Add gematria work and correspondences',
                'advanced': 'Divine name work and advanced contemplation',
                'master': 'Teaching and practical Kabbalah application'
            },
            'cultural_notes': {
                'respect': 'Approach Hebrew letters with cultural sensitivity and respect',
                'pronunciation': 'Consider learning from qualified Hebrew teachers',
                'tradition': 'These practices come from sacred Jewish mystical traditions'
            }
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving Hebrew letters: {str(e)}")
        return handle_api_error(e), 500

# Error handlers
@spiritual_practices_bp.errorhandler(400)
def bad_request(error):
    """Handle bad request errors"""
    return jsonify({
        'error': 'Bad request',
        'message': 'Please check your request parameters and try again'
    }), 400

@spiritual_practices_bp.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error in spiritual practices: {str(error)}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'Please try again later or contact support'
    }), 500

# Export blueprint
__all__ = ['spiritual_practices_bp']
