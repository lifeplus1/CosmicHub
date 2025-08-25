"""Test suite for privacy audit and risk analysis modules.

Tests the comprehensive privacy audit system including data flow analysis,
re-identification risk assessment, enhanced anonymization, and GDPR compliance.
"""

from privacy.audit import (
    PrivacyAuditor, PrivacyRisk
)
from privacy.risk_analysis import (
    ReIdentificationRiskAnalyzer, RiskLevel
)
from privacy.enhanced_anonymization import (
    EnhancedAnonymizer, AnonymizationLevel, AnonymizationConfig
)
from privacy.compliance import (
    GDPRComplianceChecker, ComplianceStatus, GDPRPrinciple
)


class TestPrivacyAuditor:
    """Test privacy audit functionality."""

    def setup_method(self):
        """Setup for each test method."""
        self.auditor = PrivacyAuditor()

    def test_audit_identifies_encryption_risks(self):
        """Test that audit identifies missing encryption."""
        results = self.auditor.conduct_privacy_audit()

        # Should identify risks for unencrypted sensitive data
        encryption_risks = [
            r for r in results.risks_identified
            if r.category == "encryption"
        ]

        # Redis cache data should be flagged for missing encryption at rest
        cache_risks = [
            r for r in encryption_risks
            if "rate_limit_counters" in r.data_elements
        ]
        assert len(cache_risks) > 0

    def test_audit_validates_pseudonymization(self):
        """Test pseudonymization effectiveness assessment."""
        results = self.auditor.conduct_privacy_audit()

        # Should have reasonable pseudonymization effectiveness
        assert results.pseudonymization_effectiveness > 80.0

        # Analytics data should be pseudonymized
        analytics_element = next(
            (e for e in results.data_elements if e.name == "analytics_events"),
            None
        )
        assert analytics_element is not None
        assert analytics_element.pseudonymized is True

    def test_audit_compliance_scoring(self):
        """Test compliance score calculation."""
        results = self.auditor.conduct_privacy_audit()

        # Should have reasonable compliance score
        assert 0.0 <= results.compliance_score <= 100.0

        # Score should decrease with more risks
        initial_score = results.compliance_score

        # Add a critical risk manually for testing
        results.risks_identified.append(PrivacyRisk(
            risk_id="TEST_CRITICAL",
            severity="CRITICAL",
            category="test",
            description="Test critical risk",
            data_elements=["test_data"]
        ))

        # Recalculate score
        new_score = self.auditor._calculate_compliance_score()  # type: ignore[attr-defined]
        assert new_score < initial_score

    def test_audit_generates_recommendations(self):
        """Test recommendation generation."""
        results = self.auditor.conduct_privacy_audit()

        assert len(results.recommendations) > 0

        # Should recommend privacy monitoring
        monitoring_rec = any(
            "monitoring" in rec.lower()
            for rec in results.recommendations
        )
        assert monitoring_rec


class TestReIdentificationRiskAnalyzer:
    """Test re-identification risk analysis."""

    def setup_method(self):
        """Setup for each test method."""
        self.analyzer = ReIdentificationRiskAnalyzer()

    def test_k_anonymity_calculation(self):
        """Test k-anonymity calculation."""
        dataset = [
            {"age_group": "25-30", "location_region": "CA", "subscription_tier": "basic"},
            {"age_group": "25-30", "location_region": "CA", "subscription_tier": "basic"},
            {"age_group": "31-35", "location_region": "NY", "subscription_tier": "premium"},
        ]

        k_value = self.analyzer._calculate_k_anonymity(dataset)  # type: ignore[attr-defined]

        # Two records in first equivalence class, one in second
        assert k_value == 1  # Minimum class size

    def test_risk_level_assessment(self):
        """Test overall risk level assessment."""
        # High risk dataset (unique records)
        high_risk_data = [
            {"age_group": "25", "location_region": "San Francisco", "subscription_tier": "premium"},
            {"age_group": "30", "location_region": "New York", "subscription_tier": "basic"},
            {"age_group": "35", "location_region": "Chicago", "subscription_tier": "premium"},
        ]

        assessment = self.analyzer.analyze_dataset_risk(high_risk_data)

        # Should identify high risk due to uniqueness
        assert assessment.overall_risk in [RiskLevel.HIGH, RiskLevel.VERY_HIGH]
        assert assessment.metrics.k_anonymity == 1
        assert assessment.metrics.uniqueness_ratio > 0.5

    def test_vulnerable_attribute_identification(self):
        """Test identification of vulnerable attributes."""
        dataset = [
            {"user_id": "unique1", "common_field": "value"},
            {"user_id": "unique2", "common_field": "value"},
            {"user_id": "unique3", "common_field": "value"},
        ]

        vulnerable_attrs = self.analyzer._identify_vulnerable_attributes(dataset)  # type: ignore[attr-defined]

        # user_id should be identified as vulnerable (100% unique)
        assert "user_id" in vulnerable_attrs
        # common_field should not be vulnerable (0% unique)
        assert "common_field" not in vulnerable_attrs

    def test_empty_dataset_handling(self):
        """Test handling of empty dataset."""
        assessment = self.analyzer.analyze_dataset_risk([])

        assert assessment.overall_risk == RiskLevel.VERY_LOW
        assert assessment.metrics.k_anonymity == 0
        assert assessment.confidence_score == 100.0


class TestEnhancedAnonymizer:
    """Test enhanced anonymization techniques."""

    def setup_method(self):
        """Setup for each test method."""
        self.config = AnonymizationConfig(level=AnonymizationLevel.MODERATE)
        self.anonymizer = EnhancedAnonymizer(self.config)

    def test_record_anonymization(self):
        """Test single record anonymization."""
        record: dict[str, str | int] = {
            "user_id": "test_user_123",
            "email": "user@example.com",
            "age": 25,
            "location": "San Francisco"
        }

        result = self.anonymizer.anonymize_record(record, ["user_id", "email"])

        # Should apply pseudonymization
        assert "pseudonymization" in result.applied_techniques

        # User ID and email should be pseudonymized
        anonymized_data = result.anonymized_data
        if isinstance(anonymized_data, list) and anonymized_data:
            data_record = anonymized_data[0]
            assert data_record["user_id"] != record["user_id"]
            assert data_record["email"] != record["email"]
        else:
            assert anonymized_data["user_id"] != record["user_id"]  # type: ignore[index]
            assert anonymized_data["email"] != record["email"]  # type: ignore[index]

        # Should have some information loss
        assert result.information_loss > 0

    def test_dataset_anonymization(self):
        """Test dataset-level anonymization."""
        dataset: list[dict[str, str | int]] = [
            {"user_id": "user1", "age": 25, "location": "SF"},
            {"user_id": "user2", "age": 25, "location": "SF"},
            {"user_id": "user3", "age": 30, "location": "NY"},
        ]

        result = self.anonymizer.anonymize_dataset(dataset, ["user_id"])

        # Should apply multiple techniques
        assert len(result.applied_techniques) > 1

        # Should enforce k-anonymity if configured
        if self.config.k_anonymity_threshold > 1:
            assert "k_anonymity_enforcement" in result.applied_techniques

    def test_differential_privacy_application(self):
        """Test differential privacy mechanisms."""
        config = AnonymizationConfig(
            level=AnonymizationLevel.STRONG,
            epsilon=1.0
        )
        anonymizer = EnhancedAnonymizer(config)

        record: dict[str, str | int] = {"user_id": "test", "score": 100}
        result = anonymizer.anonymize_record(record)

        # Should apply differential privacy
        assert "differential_privacy" in result.applied_techniques

        # Privacy guarantee should mention epsilon
        assert "ε=1.0" in result.privacy_guarantee

    def test_suppression_for_sensitive_data(self):
        """Test suppression of highly sensitive attributes."""
        config = AnonymizationConfig(level=AnonymizationLevel.MAXIMUM)
        anonymizer = EnhancedAnonymizer(config)

        record = {
            "user_id": "test",
            "social_security_number": "123-45-6789",
            "normal_field": "value"
        }

        result = anonymizer.anonymize_record(record)

        # Should apply suppression
        assert "suppression" in result.applied_techniques

        # SSN should be suppressed (removed)
        assert "social_security_number" not in result.anonymized_data

        # Normal fields should remain
        assert "normal_field" in result.anonymized_data


class TestGDPRComplianceChecker:
    """Test GDPR compliance assessment."""

    def setup_method(self):
        """Setup for each test method."""
        self.checker = GDPRComplianceChecker()

        # Sample data inventory
        self.data_inventory = [
            {
                "name": "user_email",
                "data_type": "email",
                "collection_purpose": "user_authentication_consent",
                "classification": "sensitive",
                "retention_period": "life_of_account",
                "encrypted_at_rest": "true",
                "encrypted_in_transit": "true"
            },
            {
                "name": "analytics_data",
                "data_type": "object",
                "collection_purpose": "legitimate_interests_analytics",
                "classification": "internal",
                "retention_period": "13_months",
                "encrypted_at_rest": "true",
                "encrypted_in_transit": "true"
            }
        ]

        self.privacy_policy = {
            "controller_identity": "CosmicHub Inc.",
            "purposes": "Authentication and analytics",
            "lawful_basis": "Consent and legitimate interests",
            "recipients": "Internal team only",
            "retention_period": "As specified per data type",
            "data_subject_rights": "Access, rectification, erasure, portability"
        }

        self.security_measures = [
            "encryption_at_rest",
            "encryption_in_transit",
            "access_control",
            "backup_procedures",
            "monitoring_system"
        ]

    def test_lawfulness_assessment(self):
        """Test lawfulness principle assessment."""
        assessment = self.checker.assess_compliance(
            self.data_inventory,
            self.privacy_policy,
            self.security_measures
        )

        # Should have high lawfulness score (lawful bases specified)
        assert assessment.principle_scores[GDPRPrinciple.LAWFULNESS] > 80.0

    def test_transparency_assessment(self):
        """Test transparency principle assessment."""
        # Test with complete privacy policy
        assessment = self.checker.assess_compliance(
            self.data_inventory,
            self.privacy_policy,
            self.security_measures
        )

        transparency_score = assessment.principle_scores[GDPRPrinciple.TRANSPARENCY]
        assert transparency_score > 90.0

        # Test with missing privacy policy
        assessment_no_policy = self.checker.assess_compliance(
            self.data_inventory,
            None,  # No privacy policy
            self.security_measures
        )

        transparency_score_no_policy = assessment_no_policy.principle_scores[GDPRPrinciple.TRANSPARENCY]
        assert transparency_score_no_policy < 60.0  # Should be much lower

    def test_storage_limitation_assessment(self):
        """Test storage limitation principle."""
        # Add data with indefinite retention
        bad_data = self.data_inventory.copy()
        bad_data.append({
            "name": "indefinite_data",
            "data_type": "string",
            "collection_purpose": "various_purposes",
            "retention_period": "indefinite"
        })

        assessment = self.checker.assess_compliance(
            bad_data,
            self.privacy_policy,
            self.security_measures
        )

        # Should identify storage limitation issues
        storage_issues = [
            i for i in assessment.issues_identified
            if i.principle == GDPRPrinciple.STORAGE_LIMITATION
        ]
        assert len(storage_issues) > 0

        # Score should be reduced
        storage_score = assessment.principle_scores[GDPRPrinciple.STORAGE_LIMITATION]
        assert storage_score < 90.0

    def test_integrity_assessment(self):
        """Test integrity and security assessment."""
        # Test with no security measures
        assessment_no_security = self.checker.assess_compliance(
            self.data_inventory,
            self.privacy_policy,
            None  # No security measures
        )

        integrity_score = assessment_no_security.principle_scores[GDPRPrinciple.INTEGRITY]
        assert integrity_score < 70.0

        # Should have critical security issue
        critical_issues = [
            i for i in assessment_no_security.issues_identified
            if i.severity == "CRITICAL" and i.principle == GDPRPrinciple.INTEGRITY
        ]
        assert len(critical_issues) > 0

    def test_overall_compliance_status(self):
        """Test overall compliance status determination."""
        assessment = self.checker.assess_compliance(
            self.data_inventory,
            self.privacy_policy,
            self.security_measures
        )

        # Should achieve good compliance with complete setup
        assert assessment.overall_status in [
            ComplianceStatus.COMPLIANT,
            ComplianceStatus.MOSTLY_COMPLIANT
        ]

        assert assessment.compliance_score >= 75.0

    def test_recommendation_generation(self):
        """Test compliance recommendation generation."""
        assessment = self.checker.assess_compliance(
            self.data_inventory,
            self.privacy_policy,
            self.security_measures
        )

        assert len(assessment.recommendations) > 0

        # Should include general recommendations
        dpia_rec = any(
            "DPIA" in rec or "impact assessment" in rec.lower()
            for rec in assessment.recommendations
        )
        assert dpia_rec


class TestPrivacyIntegration:
    """Integration tests for complete privacy audit workflow."""

    def test_complete_privacy_audit_workflow(self):
        """Test complete end-to-end privacy audit."""
        # 1. Conduct privacy audit
        auditor = PrivacyAuditor()
        audit_results = auditor.conduct_privacy_audit()

        # 2. Analyze re-identification risks for analytics data
        analyzer = ReIdentificationRiskAnalyzer()
        sample_analytics = [
            {"user_pseudonym": "hash123", "event_type": "chart_view", "timestamp": "2025-01"},
            {"user_pseudonym": "hash456", "event_type": "chart_save", "timestamp": "2025-01"},
            {"user_pseudonym": "hash123", "event_type": "premium_upgrade", "timestamp": "2025-01"},
        ]
        risk_assessment = analyzer.analyze_dataset_risk(sample_analytics)

        # 3. Apply enhanced anonymization
        anonymizer = EnhancedAnonymizer(AnonymizationConfig(
            level=AnonymizationLevel.STRONG,
            k_anonymity_threshold=3
        ))
        anon_result = anonymizer.anonymize_dataset(sample_analytics)

        # 4. Check GDPR compliance
        checker = GDPRComplianceChecker()
        compliance_assessment = checker.assess_compliance(
            [{
                "name": elem.name or "",
                "data_type": elem.data_type or "",
                "collection_purpose": elem.collection_purpose or "",
                "classification": elem.classification.value if elem.classification else "",
                "retention_period": elem.retention_period or "",
                "encrypted_at_rest": str(elem.encrypted_at_rest).lower(),
                "encrypted_in_transit": str(elem.encrypted_in_transit).lower()
            } for elem in audit_results.data_elements],
            {
                "controller_identity": "CosmicHub",
                "purposes": "Astrology services and analytics",
                "lawful_basis": "Consent and legitimate interests",
                "recipients": "Internal processing only",
                "retention_period": "Varies by data type",
                "data_subject_rights": "Full GDPR rights supported"
            },
            ["encryption", "access_control", "monitoring", "backup"]
        )

        # Validate integration results
        assert audit_results.compliance_score > 0
        assert risk_assessment.overall_risk != RiskLevel.VERY_HIGH  # Should not be worst case
        assert len(anon_result.applied_techniques) > 0
        assert compliance_assessment.compliance_score > 0

        # Generate comprehensive report
        audit_report = auditor.generate_audit_report(audit_results)
        compliance_report = checker.generate_compliance_report(compliance_assessment)

        assert "CosmicHub Privacy Audit Report" in audit_report
        assert "GDPR Compliance Assessment Report" in compliance_report

        print("Integration test completed:")
        print(f"- Privacy audit score: {audit_results.compliance_score:.1f}%")
        print(f"- Re-identification risk: {risk_assessment.overall_risk.value}")  # noqa: E999
        print(f"- Anonymization techniques: {len(anon_result.applied_techniques)}")
        print(f"- GDPR compliance: {compliance_assessment.overall_status.value}")


if __name__ == "__main__":
    # Run integration test
    integration_test = TestPrivacyIntegration()
    integration_test.test_complete_privacy_audit_workflow()
    print("✅ Privacy audit system integration test passed!")
