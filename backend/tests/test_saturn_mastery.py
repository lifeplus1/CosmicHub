from astro.calculations.ai_interpretations import (
    get_saturn_lessons,
    get_saturn_mastery,
)


def test_get_saturn_mastery_basic():
    out = get_saturn_mastery("capricorn", 10)
    assert "discipline" in out.lower() or "ambition" in out.lower()
    assert "10" in out or "career" in out.lower()


def test_get_saturn_lessons_house_context():
    lesson = get_saturn_lessons("capricorn", 10)
    assert "Ambition" in lesson or "achievement" in lesson.lower()
    assert "career" in lesson.lower() or "public" in lesson.lower()


def test_get_saturn_mastery_unknown_sign():
    out = get_saturn_mastery("unknownsign", 4)
    # Should degrade gracefully: uses fallback essence and house theme
    assert "develop resilience" in out.lower()
    assert "family" in out.lower() or "emotional foundation" in out.lower()
