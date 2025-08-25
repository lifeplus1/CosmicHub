"""Privacy audit module for comprehensive data flow analysis.

Provides tools to audit data collection, storage, processing, and retention
practices across the CosmicHub platform.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

logger = logging.getLogger(__name__)


class DataClassification(Enum):
    """Data classification levels as per CosmicHub data classification policy."""

    PUBLIC = "public"
    INTERNAL = "internal"
    SENSITIVE = "sensitive"
    RESTRICTED = "restricted"


class DataFlow(Enum):
    """Data flow types for privacy audit."""

    COLLECTION = "collection"
    STORAGE = "storage"
    PROCESSING = "processing"
    TRANSMISSION = "transmission"
    RETENTION = "retention"
    DELETION = "deletion"


@dataclass
class DataElement:
    """Represents a data element in the system."""

    name: str
    classification: DataClassification
    data_type: str
    collection_purpose: str
    storage_location: str
    retention_period: str | None = None
    pseudonymized: bool = False
    encrypted_at_rest: bool = False
    encrypted_in_transit: bool = False
    access_controls: list[str] = field(default_factory=lambda: [])
    data_flows: list[DataFlow] = field(default_factory=lambda: [])


@dataclass
class PrivacyRisk:
    """Represents a privacy risk identified during audit."""

    risk_id: str
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    category: str
    description: str
    data_elements: list[str]
    mitigation_status: str = "OPEN"
    mitigation_actions: list[str] = field(default_factory=lambda: [])


@dataclass
class AuditResults:
    """Results of privacy audit."""

    audit_date: datetime
    data_elements: list[DataElement]
    risks_identified: list[PrivacyRisk]
    compliance_score: float  # 0-100
    recommendations: list[str]
    pseudonymization_effectiveness: float  # 0-100


class PrivacyAuditor:
    """Comprehensive privacy auditor for CosmicHub platform."""

    def __init__(self):
        self.data_inventory = self._build_data_inventory()
        self.risks: list[PrivacyRisk] = []

    def _build_data_inventory(self) -> list[DataElement]:
        """Build inventory of all data elements in the system."""

        return [
            # User authentication data
            DataElement(
                name="firebase_uid",
                classification=DataClassification.SENSITIVE,
                data_type="string",
                collection_purpose="user_authentication",
                storage_location="firestore:users/{userId}",
                retention_period="life_of_account",
                pseudonymized=True,  # In logs and analytics
                encrypted_at_rest=True,
                encrypted_in_transit=True,
                access_controls=["firebase_auth", "user_ownership"],
                data_flows=[DataFlow.COLLECTION, DataFlow.STORAGE, DataFlow.PROCESSING]
            ),

            # User profile data
            DataElement(
                name="user_email",
                classification=DataClassification.SENSITIVE,
                data_type="string",
                collection_purpose="user_identification_communication",
                storage_location="firestore:users/{userId}",
                retention_period="life_of_account",
                pseudonymized=True,  # In analytics
                encrypted_at_rest=True,
                encrypted_in_transit=True,
                access_controls=["firebase_auth", "user_ownership"]
            ),

            # Subscription data
            DataElement(
                name="stripe_customer_id",
                classification=DataClassification.RESTRICTED,
                data_type="string",
                collection_purpose="payment_processing",
                storage_location="firestore:subscriptions/{userId}",
                retention_period="life_of_subscription_plus_90d",
                pseudonymized=False,  # Required for Stripe operations
                encrypted_at_rest=True,
                encrypted_in_transit=True,
                access_controls=["admin_only", "stripe_webhook"]
            ),

            # Astrology chart data
            DataElement(
                name="birth_data",
                classification=DataClassification.SENSITIVE,
                data_type="object",
                collection_purpose="astrology_calculations",
                storage_location="firestore:users/{userId}/charts/{chartId}",
                retention_period="life_of_account",
                pseudonymized=False,  # Required for calculations
                encrypted_at_rest=True,
                encrypted_in_transit=True,
                access_controls=["user_ownership", "authenticated_users"]
            ),

            # Analytics events
            DataElement(
                name="analytics_events",
                classification=DataClassification.INTERNAL,
                data_type="object",
                collection_purpose="usage_analytics_improvement",
                storage_location="firestore:analytics/{eventId}",
                retention_period="13_months",
                pseudonymized=True,  # User IDs pseudonymized
                encrypted_at_rest=True,
                encrypted_in_transit=True,
                access_controls=["admin_read_only"]
            ),

            # Rate limiting data
            DataElement(
                name="rate_limit_counters",
                classification=DataClassification.INTERNAL,
                data_type="object",
                collection_purpose="abuse_prevention",
                storage_location="redis_cache",
                retention_period="24_hours",
                pseudonymized=True,  # User IDs hashed
                encrypted_at_rest=False,  # Redis cache
                encrypted_in_transit=True,
                access_controls=["backend_service_only"]
            ),

            # Logs and monitoring
            DataElement(
                name="application_logs",
                classification=DataClassification.SENSITIVE,
                data_type="text",
                collection_purpose="debugging_monitoring",
                storage_location="backend_filesystem",
                retention_period="30_days",
                pseudonymized=True,  # User IDs pseudonymized
                encrypted_at_rest=False,
                encrypted_in_transit=True,
                access_controls=["admin_only", "backend_service"]
            ),
        ]

    def conduct_privacy_audit(self) -> AuditResults:
        """Conduct comprehensive privacy audit."""

        logger.info("Starting privacy audit")

        # Analyze each data element
        for element in self.data_inventory:
            self._audit_data_element(element)

        # Calculate compliance score
        compliance_score = self._calculate_compliance_score()

        # Calculate pseudonymization effectiveness
        pseudo_effectiveness = self._assess_pseudonymization_effectiveness()

        # Generate recommendations
        recommendations = self._generate_recommendations()

        results = AuditResults(
            audit_date=datetime.now(timezone.utc),
            data_elements=self.data_inventory,
            risks_identified=self.risks,
            compliance_score=compliance_score,
            recommendations=recommendations,
            pseudonymization_effectiveness=pseudo_effectiveness
        )

        logger.info(f"Privacy audit completed. Score: {compliance_score:.1f}%")
        return results

    def _audit_data_element(self, element: DataElement) -> None:
        """Audit individual data element for privacy risks."""

        # Check for missing encryption
        if element.classification in [DataClassification.SENSITIVE, DataClassification.RESTRICTED]:
            if not element.encrypted_at_rest:
                self.risks.append(PrivacyRisk(
                    risk_id=f"ENC_{element.name}_REST",
                    severity="HIGH",
                    category="encryption",
                    description=f"{element.name} should be encrypted at rest",
                    data_elements=[element.name],
                    mitigation_actions=["Enable encryption at rest"]
                ))

            if not element.encrypted_in_transit:
                self.risks.append(PrivacyRisk(
                    risk_id=f"ENC_{element.name}_TRANSIT",
                    severity="HIGH",
                    category="encryption",
                    description=f"{element.name} should be encrypted in transit",
                    data_elements=[element.name],
                    mitigation_actions=["Enable TLS/HTTPS"]
                ))

        # Check pseudonymization requirements
        if element.classification == DataClassification.SENSITIVE and "analytics" in element.collection_purpose:
            if not element.pseudonymized:
                self.risks.append(PrivacyRisk(
                    risk_id=f"PSEUDO_{element.name}",
                    severity="MEDIUM",
                    category="pseudonymization",
                    description=f"{element.name} should be pseudonymized in analytics",
                    data_elements=[element.name],
                    mitigation_actions=["Implement pseudonymization before analytics processing"]
                ))

        # Check retention policies
        if not element.retention_period:
            self.risks.append(PrivacyRisk(
                risk_id=f"RETENTION_{element.name}",
                severity="MEDIUM",
                category="data_minimization",
                description=f"{element.name} lacks defined retention period",
                data_elements=[element.name],
                mitigation_actions=["Define and implement retention policy"]
            ))

        # Check access controls
        if element.classification == DataClassification.RESTRICTED:
            if len(element.access_controls) < 2:
                self.risks.append(PrivacyRisk(
                    risk_id=f"ACCESS_{element.name}",
                    severity="HIGH",
                    category="access_control",
                    description=f"{element.name} requires stronger access controls",
                    data_elements=[element.name],
                    mitigation_actions=["Implement multi-layered access controls"]
                ))

    def _calculate_compliance_score(self) -> float:
        """Calculate overall privacy compliance score."""

        total_elements = len(self.data_inventory)
        if total_elements == 0:
            return 100.0

        # Score deductions based on risks
        score = 100.0

        for risk in self.risks:
            if risk.severity == "CRITICAL":
                score -= 15.0
            elif risk.severity == "HIGH":
                score -= 10.0
            elif risk.severity == "MEDIUM":
                score -= 5.0
            elif risk.severity == "LOW":
                score -= 2.0

        return max(0.0, score)

    def _assess_pseudonymization_effectiveness(self) -> float:
        """Assess effectiveness of current pseudonymization practices."""

        # Analyze pseudonymization coverage
        sensitive_elements = [
            e for e in self.data_inventory
            if e.classification in [DataClassification.SENSITIVE, DataClassification.RESTRICTED]
        ]

        if not sensitive_elements:
            return 100.0

        pseudonymized_count = sum(1 for e in sensitive_elements if e.pseudonymized)
        coverage_score = (pseudonymized_count / len(sensitive_elements)) * 100

        # Factor in implementation quality (based on our pseudonymization module)
        implementation_quality = 85.0  # Based on SHA-256 + salt + pepper implementation

        # Combine scores
        effectiveness = (coverage_score * 0.7) + (implementation_quality * 0.3)

        return effectiveness

    def _generate_recommendations(self) -> list[str]:
        """Generate privacy improvement recommendations."""

        recommendations: list[str] = []

        # Group risks by category
        risk_categories: dict[str, list[PrivacyRisk]] = {}
        for risk in self.risks:
            if risk.category not in risk_categories:
                risk_categories[risk.category] = []
            risk_categories[risk.category].append(risk)

        # Generate category-specific recommendations
        if "encryption" in risk_categories:
            recommendations.append(
                "Implement comprehensive encryption at rest and in transit for all sensitive data elements"
            )

        if "pseudonymization" in risk_categories:
            recommendations.append(
                "Expand pseudonymization coverage to all user identifiers in analytics and logging"
            )

        if "data_minimization" in risk_categories:
            recommendations.append(
                "Establish and implement clear data retention policies with automated cleanup"
            )

        if "access_control" in risk_categories:
            recommendations.append(
                "Strengthen access controls for restricted data with multi-factor authentication and role-based permissions"
            )

        # General recommendations
        if len(self.risks) > 5:
            recommendations.append(
                "Conduct quarterly privacy impact assessments to maintain compliance"
            )

        recommendations.append(
            "Consider implementing differential privacy for aggregate analytics data"
        )

        recommendations.append(
            "Establish automated privacy monitoring and alerting system"
        )

        return recommendations

    def generate_audit_report(self, results: AuditResults) -> str:
        """Generate human-readable audit report."""

        report_lines = [
            "# CosmicHub Privacy Audit Report",
            f"**Date:** {results.audit_date.strftime('%Y-%m-%d %H:%M:%S UTC')}"
            f"**Overall Compliance Score:** {results.compliance_score:.1f}%",
            f"**Pseudonymization Effectiveness:** {results.pseudonymization_effectiveness:.1f}%",
            "",
            "## Executive Summary",
            "",
            f"This audit examined {len(results.data_elements)} data elements across the system.",  # noqa: E999
            f"**{len(results.risks_identified)} privacy risks** were identified and assessed.",
            ""
        ]

        # Risk summary
        risk_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for risk in results.risks_identified:
            risk_counts[risk.severity] += 1

        for severity, count in risk_counts.items():
            if count > 0:
                report_lines.append(f"- **{severity}:** {count} risks")

        report_lines.extend([
            "",
            "## Data Element Analysis",
            "",
            "| Element | Classification | Pseudonymized | Encrypted (Rest) | Encrypted (Transit) | Retention |",
            "|---------|---------------|---------------|------------------|---------------------|-----------|"
        ])

        for element in results.data_elements:
            report_lines.append(
                f"| {element.name} | {element.classification.value} | "
                f"{'✅' if element.pseudonymized else '❌'} | "
                f"{'✅' if element.encrypted_at_rest else '❌'} | "
                f"{'✅' if element.encrypted_in_transit else '❌'} | "
                f"{element.retention_period or 'Not defined'} |"
            )

        # Risk details
        if results.risks_identified:
            report_lines.extend([
                "",
                "## Risk Analysis",
                ""
            ])

            for risk in sorted(results.risks_identified,
                             key=lambda r: {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}[r.severity],
                             reverse=True):
                report_lines.extend([
                    f"### {risk.risk_id} - {risk.severity}",
                    f"**Category:** {risk.category}",
                    f"**Description:** {risk.description}",
                    f"**Affected Data:** {', '.join(risk.data_elements)}",
                    f"**Status:** {risk.mitigation_status}",
                    ""
                ])

                if risk.mitigation_actions:
                    report_lines.append("**Recommended Actions:**")
                    for action in risk.mitigation_actions:
                        report_lines.append(f"- {action}")
                    report_lines.append("")

        # Recommendations
        if results.recommendations:
            report_lines.extend([
                "## Recommendations",
                ""
            ])

            for i, rec in enumerate(results.recommendations, 1):
                report_lines.append(f"{i}. {rec}")

        report_lines.extend([
            "",
            "## Compliance Assessment",
            "",
            f"Based on this audit, CosmicHub achieves a **{results.compliance_score:.1f}%** privacy compliance score.",
            "",
            "**Score Interpretation:**",
            "- 90-100%: Excellent privacy practices",
            "- 80-89%: Good practices with minor improvements needed",
            "- 70-79%: Adequate practices with moderate improvements needed",
            "- Below 70%: Significant privacy improvements required",
            "",
            "---",
            "",
            "*This report was generated by the CosmicHub Privacy Auditor*"
        ])

        return "\n".join(report_lines)
