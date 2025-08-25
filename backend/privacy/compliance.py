"""GDPR compliance checker for CosmicHub privacy practices.

Validates compliance with General Data Protection Regulation requirements
including lawfulness, fairness, transparency, purpose limitation, data
minimization, accuracy, storage limitation, integrity, and accountability.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class ComplianceStatus(Enum):
    """GDPR compliance status levels."""

    COMPLIANT = "compliant"           # Fully compliant
    MOSTLY_COMPLIANT = "mostly_compliant"  # Minor issues
    PARTIALLY_COMPLIANT = "partially_compliant"  # Some major issues
    NON_COMPLIANT = "non_compliant"   # Significant violations


class GDPRPrinciple(Enum):
    """GDPR data protection principles."""

    LAWFULNESS = "lawfulness"         # Art. 6 - Lawful basis
    FAIRNESS = "fairness"             # Fair processing
    TRANSPARENCY = "transparency"     # Clear information
    PURPOSE_LIMITATION = "purpose_limitation"  # Specific purposes
    DATA_MINIMIZATION = "data_minimization"    # Adequate and relevant
    ACCURACY = "accuracy"             # Accurate and up to date
    STORAGE_LIMITATION = "storage_limitation"  # Time limited
    INTEGRITY = "integrity"           # Security measures
    ACCOUNTABILITY = "accountability"  # Demonstrate compliance


@dataclass
class ComplianceIssue:
    """GDPR compliance issue."""

    principle: GDPRPrinciple
    severity: str                     # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    description: str
    affected_data: List[str]
    legal_reference: str
    remediation_steps: List[str]


@dataclass
class ComplianceAssessment:
    """Complete GDPR compliance assessment."""

    overall_status: ComplianceStatus
    compliance_score: float           # 0-100
    principle_scores: Dict[GDPRPrinciple, float]
    issues_identified: List[ComplianceIssue]
    recommendations: List[str]
    assessment_date: datetime


class GDPRComplianceChecker:
    """Comprehensive GDPR compliance checker."""

    def __init__(self):
        self.lawful_bases = [
            "consent",
            "contract",
            "legal_obligation",
            "vital_interests",
            "public_task",
            "legitimate_interests"
        ]

        self.data_categories = {
            # Regular personal data
            "personal": ["name", "email", "phone", "address"],
            # Special category data (Art. 9)
            "special": ["health", "religious_beliefs", "political_opinions",
                       "racial_origin", "sexual_orientation"],
            # Data concerning criminal convictions (Art. 10)
            "criminal": ["convictions", "criminal_offences"]
        }

        self.retention_limits = {
            "marketing": "2_years",
            "contract": "6_years_after_termination",
            "legal_obligation": "as_required_by_law",
            "analytics": "26_months",
            "backups": "3_months"
        }

    def assess_compliance(
        self,
        data_inventory: List[Dict[str, str]],
        privacy_policy: Optional[Dict[str, str]] = None,
        security_measures: Optional[List[str]] = None
    ) -> ComplianceAssessment:
        """Conduct comprehensive GDPR compliance assessment."""

        logger.info("Starting GDPR compliance assessment")

        issues: List[ComplianceIssue] = []
        principle_scores: Dict[GDPRPrinciple, float] = {}

        # Assess each GDPR principle
        principle_scores[GDPRPrinciple.LAWFULNESS] = self._assess_lawfulness(
            data_inventory, privacy_policy, issues
        )

        principle_scores[GDPRPrinciple.FAIRNESS] = self._assess_fairness(
            data_inventory, privacy_policy, issues
        )

        principle_scores[GDPRPrinciple.TRANSPARENCY] = self._assess_transparency(
            data_inventory, privacy_policy, issues
        )

        principle_scores[GDPRPrinciple.PURPOSE_LIMITATION] = self._assess_purpose_limitation(
            data_inventory, issues
        )

        principle_scores[GDPRPrinciple.DATA_MINIMIZATION] = self._assess_data_minimization(
            data_inventory, issues
        )

        principle_scores[GDPRPrinciple.ACCURACY] = self._assess_accuracy(
            data_inventory, issues
        )

        principle_scores[GDPRPrinciple.STORAGE_LIMITATION] = self._assess_storage_limitation(
            data_inventory, issues
        )

        principle_scores[GDPRPrinciple.INTEGRITY] = self._assess_integrity(
            data_inventory, security_measures, issues
        )

        principle_scores[GDPRPrinciple.ACCOUNTABILITY] = self._assess_accountability(
            data_inventory, issues
        )

        # Calculate overall compliance score
        overall_score = sum(principle_scores.values()) / len(principle_scores)

        # Determine compliance status
        if overall_score >= 90:
            status = ComplianceStatus.COMPLIANT
        elif overall_score >= 75:
            status = ComplianceStatus.MOSTLY_COMPLIANT
        elif overall_score >= 60:
            status = ComplianceStatus.PARTIALLY_COMPLIANT
        else:
            status = ComplianceStatus.NON_COMPLIANT

        # Generate recommendations
        recommendations = self._generate_compliance_recommendations(issues,
            principle_scores)

        assessment = ComplianceAssessment(
            overall_status=status,
            compliance_score=overall_score,
            principle_scores=principle_scores,
            issues_identified=issues,
            recommendations=recommendations,
            assessment_date=datetime.now(timezone.utc)
        )

        logger.info(f"GDPR compliance assessment completed. Score: {overall_score:.1f}%")
        return assessment

    def _assess_lawfulness(
        self,
        data_inventory: List[Dict[str, str]],
        privacy_policy: Optional[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess lawfulness of processing (Art. 6)."""

        score = 100.0

        for data_element in data_inventory:
            data_type = data_element.get("data_type", "")
            purpose = data_element.get("collection_purpose", "")

            # Check if lawful basis is defined
            if not any(basis in purpose.lower() for basis in self.lawful_bases):
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.LAWFULNESS,
                    severity="HIGH",
                    description=f"No clear lawful basis for processing {data_element.get('name', 'unknown')}",
                    affected_data=[data_element.get("name", "unknown")],
                    legal_reference="GDPR Art. 6",
                    remediation_steps=[
                        "Define clear lawful basis for processing",
                        "Update privacy policy with lawful basis information",
                        "Obtain consent where required"
                    ]
                ))
                score -= 15.0

            # Special category data requires additional lawful basis (Art. 9)
            if data_type in self.data_categories["special"]:
                # Check for Art. 9 conditions
                special_conditions = [
                    "explicit_consent", "employment_law", "vital_interests",
                    "public_health", "archiving", "research"
                ]

                if not any(condition in purpose.lower() for condition in special_conditions):
                    issues.append(ComplianceIssue(
                        principle=GDPRPrinciple.LAWFULNESS,
                        severity="CRITICAL",
                        description=f"Special category data {data_element.get('name', 'unknown')} requires Art. 9 lawful basis",
                        affected_data=[data_element.get("name", "unknown")],
                        legal_reference="GDPR Art. 9",
                        remediation_steps=[
                            "Obtain explicit consent for special category data",
                            "Implement additional safeguards",
                            "Document lawful basis under Art. 9"
                        ]
                    ))
                    score -= 25.0

        return max(0.0, score)

    def _assess_fairness(
        self,
        data_inventory: List[Dict[str, str]],
        privacy_policy: Optional[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess fairness of processing."""

        score = 100.0

        # Check for potentially unfair processing
        for data_element in data_inventory:
            purpose = data_element.get("collection_purpose", "")

            # Check for secondary use without consent
            if "marketing" in purpose and "analytics" in purpose:
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.FAIRNESS,
                    severity="MEDIUM",
                    description=f"Potential secondary use of data for {data_element.get('name', 'unknown')}",
                    affected_data=[data_element.get("name", "unknown")],
                    legal_reference="GDPR Recital 47",
                    remediation_steps=[
                        "Clearly separate primary and secondary purposes",
                        "Obtain separate consent for marketing use",
                        "Implement opt-out mechanisms"
                    ]
                ))
                score -= 10.0

        return max(0.0, score)

    def _assess_transparency(
        self,
        data_inventory: List[Dict[str, str]],
        privacy_policy: Optional[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess transparency requirements (Art. 13-14)."""

        score = 100.0

        # Check if privacy policy exists
        if not privacy_policy:
            issues.append(ComplianceIssue(
                principle=GDPRPrinciple.TRANSPARENCY,
                severity="CRITICAL",
                description="No privacy policy provided",
                affected_data=["all"],
                legal_reference="GDPR Art. 13-14",
                remediation_steps=[
                    "Create comprehensive privacy policy",
                    "Include all required information under Art. 13-14",
                    "Make policy easily accessible to users"
                ]
            ))
            score -= 50.0
        else:
            # Check for required information
            required_info = [
                "controller_identity", "purposes", "lawful_basis",
                "recipients", "retention_period", "data_subject_rights"
            ]

            for info in required_info:
                if info not in privacy_policy:
                    issues.append(ComplianceIssue(
                        principle=GDPRPrinciple.TRANSPARENCY,
                        severity="HIGH",
                        description=f"Privacy policy missing {info}",
                        affected_data=["all"],
                        legal_reference="GDPR Art. 13-14",
                        remediation_steps=[f"Add {info} information to privacy policy"]
                    ))
                    score -= 8.0

        return max(0.0, score)

    def _assess_purpose_limitation(
        self,
        data_inventory: List[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess purpose limitation principle (Art. 5.1.b)."""

        score = 100.0

        for data_element in data_inventory:
            purpose = data_element.get("collection_purpose", "")

            # Check for vague purposes
            vague_terms = ["business_purposes", "other_purposes", "various_uses"]
            if any(term in purpose.lower() for term in vague_terms):
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.PURPOSE_LIMITATION,
                    severity="MEDIUM",
                    description=f"Vague purpose defined for {data_element.get('name', 'unknown')}",
                    affected_data=[data_element.get("name", "unknown")],
                    legal_reference="GDPR Art. 5.1.b",
                    remediation_steps=[
                        "Define specific, explicit purposes",
                        "Document legitimate reasons for processing",
                        "Avoid blanket consent requests"
                    ]
                ))
                score -= 10.0

            # Check for excessive data collection
            if len(purpose.split(", ")) > 3:  # More than 3 purposes
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.PURPOSE_LIMITATION,
                    severity="MEDIUM",
                    description=f"Multiple purposes for {data_element.get('name', 'unknown')}",
                    affected_data=[data_element.get("name", "unknown")],
                    legal_reference="GDPR Art. 5.1.b",
                    remediation_steps=[
                        "Review and justify each purpose",
                        "Consider separate consent for different purposes",
                        "Implement purpose-based data segregation"
                    ]
                ))
                score -= 5.0

        return max(0.0, score)

    def _assess_data_minimization(
        self,
        data_inventory: List[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess data minimization principle (Art. 5.1.c)."""

        score = 100.0

        # Analyze data collection patterns
        purpose_data_map: Dict[str, List[str]] = {}

        for data_element in data_inventory:
            purpose = data_element.get("collection_purpose", "")
            data_name = data_element.get("name", "unknown")

            if purpose not in purpose_data_map:
                purpose_data_map[purpose] = []
            purpose_data_map[purpose].append(data_name)

        # Check for potential over-collection
        for purpose, data_items in purpose_data_map.items():
            if len(data_items) > 10:  # Arbitrary threshold
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.DATA_MINIMIZATION,
                    severity="MEDIUM",
                    description=f"Potentially excessive data collection for purpose: {purpose}",
                    affected_data=data_items,
                    legal_reference="GDPR Art. 5.1.c",
                    remediation_steps=[
                        "Review necessity of each data element",
                        "Remove non-essential data collection",
                        "Implement privacy by design principles"
                    ]
                ))
                score -= 5.0

        return max(0.0, score)

    def _assess_accuracy(
        self,
        data_inventory: List[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess accuracy principle (Art. 5.1.d)."""

        score = 100.0

        for data_element in data_inventory:
            data_name = data_element.get("name", "")

            # Check for stale data risks
            if "timestamp" not in data_element and "date" not in data_element:
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.ACCURACY,
                    severity="MEDIUM",
                    description=f"No timestamp tracking for accuracy of {data_name}",
                    affected_data=[data_name],
                    legal_reference="GDPR Art. 5.1.d",
                    remediation_steps=[
                        "Implement data freshness tracking",
                        "Provide user correction mechanisms",
                        "Regular data accuracy reviews"
                    ]
                ))
                score -= 5.0

        return max(0.0, score)

    def _assess_storage_limitation(
        self,
        data_inventory: List[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess storage limitation principle (Art. 5.1.e)."""

        score = 100.0

        for data_element in data_inventory:
            retention_period = data_element.get("retention_period", "")
            data_name = data_element.get("name", "")

            # Check for undefined retention periods
            if not retention_period or retention_period == "indefinite":
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.STORAGE_LIMITATION,
                    severity="HIGH",
                    description=f"No defined retention period for {data_name}",
                    affected_data=[data_name],
                    legal_reference="GDPR Art. 5.1.e",
                    remediation_steps=[
                        "Define specific retention periods",
                        "Implement automated deletion",
                        "Document retention justifications"
                    ]
                ))
                score -= 15.0

            # Check for excessive retention
            excessive_periods = ["forever", "permanent", "indefinite"]
            if any(term in retention_period.lower() for term in excessive_periods):
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.STORAGE_LIMITATION,
                    severity="HIGH",
                    description=f"Excessive retention period for {data_name}: {retention_period}",
                    affected_data=[data_name],
                    legal_reference="GDPR Art. 5.1.e",
                    remediation_steps=[
                        "Justify retention period necessity",
                        "Implement periodic review process",
                        "Consider data anonymization after retention period"
                    ]
                ))
                score -= 10.0

        return max(0.0, score)

    def _assess_integrity(
        self,
        data_inventory: List[Dict[str, str]],
        security_measures: Optional[List[str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess integrity and confidentiality (Art. 5.1.f, Art. 32)."""

        score = 100.0

        if not security_measures:
            issues.append(ComplianceIssue(
                principle=GDPRPrinciple.INTEGRITY,
                severity="CRITICAL",
                description="No security measures documented",
                affected_data=["all"],
                legal_reference="GDPR Art. 32",
                remediation_steps=[
                    "Implement appropriate technical measures",
                    "Document security controls",
                    "Regular security assessments"
                ]
            ))
            score -= 40.0
        else:
            # Check for required security measures
            required_measures = [
                "encryption", "access_control", "backup", "monitoring"
            ]

            for measure in required_measures:
                if not any(measure in sm.lower() for sm in security_measures):
                    issues.append(ComplianceIssue(
                        principle=GDPRPrinciple.INTEGRITY,
                        severity="HIGH",
                        description=f"Missing security measure: {measure}",
                        affected_data=["all"],
                        legal_reference="GDPR Art. 32",
                        remediation_steps=[f"Implement {measure} controls"]
                    ))
                    score -= 10.0

        # Check encryption for sensitive data
        for data_element in data_inventory:
            classification = data_element.get("classification", "")
            encrypted_rest = data_element.get("encrypted_at_rest", "false")
            data_name = data_element.get("name", "")

            if classification in ["sensitive", "restricted"] and encrypted_rest != "true":
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.INTEGRITY,
                    severity="HIGH",
                    description=f"Sensitive data {data_name} not encrypted at rest",
                    affected_data=[data_name],
                    legal_reference="GDPR Art. 32",
                    remediation_steps=[
                        "Enable encryption at rest",
                        "Implement key management",
                        "Regular encryption audits"
                    ]
                ))
                score -= 15.0

        return max(0.0, score)

    def _assess_accountability(
        self,
        data_inventory: List[Dict[str, str]],
        issues: List[ComplianceIssue]
    ) -> float:
        """Assess accountability principle (Art. 5.2)."""

        score = 100.0

        # Check for documentation completeness
        required_documentation = [
            "data_inventory", "privacy_impact_assessment", "consent_records",
            "data_breach_procedures", "data_protection_policies"
        ]

        # This is a simplified check - in practice would verify actual documents
        # For demo purposes, we'll assume some documentation is missing
        documentation_gaps = ["privacy_impact_assessment", "consent_records"]  # Example gaps

        for gap in documentation_gaps:
            if gap in required_documentation:
                issues.append(ComplianceIssue(
                    principle=GDPRPrinciple.ACCOUNTABILITY,
                    severity="MEDIUM",
                    description=f"Missing documentation: {gap}",
                    affected_data=["all"],
                    legal_reference="GDPR Art. 5.2",
                    remediation_steps=[
                        f"Create {gap} documentation",
                        "Implement documentation maintenance process",
                        "Regular compliance audits"
                    ]
                ))
                score -= 10.0

        return max(0.0, score)

    def _generate_compliance_recommendations(
        self,
        issues: List[ComplianceIssue],
        principle_scores: Dict[GDPRPrinciple, float]
    ) -> List[str]:
        """Generate GDPR compliance recommendations."""

        recommendations: List[str] = []

        # Priority recommendations based on lowest scores
        sorted_principles = sorted(
            principle_scores.items(),
            key=lambda x: x[1]
        )

        for principle, score in sorted_principles:
            if score < 80:
                if principle == GDPRPrinciple.LAWFULNESS:
                    recommendations.append(
                        "Review and document lawful basis for all data processing activities"
                    )
                elif principle == GDPRPrinciple.TRANSPARENCY:
                    recommendations.append(
                        "Update privacy policy with complete Art. 13-14 information"
                    )
                elif principle == GDPRPrinciple.INTEGRITY:
                    recommendations.append(
                        "Strengthen technical and organizational security measures"
                    )
                elif principle == GDPRPrinciple.STORAGE_LIMITATION:
                    recommendations.append(
                        "Implement automated data retention and deletion policies"
                    )

        # General recommendations
        critical_issues = [i for i in issues if i.severity == "CRITICAL"]
        if critical_issues:
            recommendations.append(
                f"Address {len(critical_issues)} critical compliance issues immediately"
            )

        high_issues = [i for i in issues if i.severity == "HIGH"]
        if high_issues:
            recommendations.append(
                f"Remediate {len(high_issues)} high-severity compliance gaps"
            )

        recommendations.extend([
            "Conduct Data Protection Impact Assessment (DPIA) for high-risk processing",
            "Implement privacy by design principles in system development",
            "Establish regular compliance monitoring and review processes",
            "Train staff on GDPR requirements and data protection best practices"
        ])

        return recommendations

    def generate_compliance_report(self,
        assessment: ComplianceAssessment) -> str:
        """Generate human-readable GDPR compliance report."""

        report_lines = [
            "# CosmicHub GDPR Compliance Assessment Report",
            f"**Assessment Date:** {assessment.assessment_date.strftime('%Y-%m-%d %H:%M:%S UTC')}",
            f"**Overall Compliance Status:** {assessment.overall_status.value.title().replace('_', ' ')}",
            f"**Compliance Score:** {assessment.compliance_score:.1f}%",
            "",
            "## Executive Summary",
            ""
        ]

        # Status interpretation
        if assessment.overall_status == ComplianceStatus.COMPLIANT:
            report_lines.append("✅ **CosmicHub demonstrates strong GDPR compliance** with comprehensive data protection practices.")
        elif assessment.overall_status == ComplianceStatus.MOSTLY_COMPLIANT:
            report_lines.append("⚠️ **CosmicHub is mostly compliant** with GDPR requirements but has some areas for improvement.")
        elif assessment.overall_status == ComplianceStatus.PARTIALLY_COMPLIANT:
            report_lines.append("❌ **CosmicHub has significant compliance gaps** that require immediate attention.")
        else:
            report_lines.append("🚨 **CosmicHub has major GDPR violations** that pose legal and regulatory risks.")

        report_lines.extend([
            "",
            f"**Issues Identified:** {len(assessment.issues_identified)} ({len([i for i in assessment.issues_identified if i.severity in ['CRITICAL', 'HIGH']])} critical/high priority)",
            "",
            "## Principle-by-Principle Analysis",
            ""
        ])

        # Principle scores
        for principle, score in assessment.principle_scores.items():
            status_icon = "✅" if score >= 90 else "⚠️" if score >= 75 else "❌"
            report_lines.append(f"{status_icon} **{principle.value.title().replace('_', ' ')}:** {score:.1f}%")

        # Critical and high priority issues
        critical_high_issues = [
            i for i in assessment.issues_identified
            if i.severity in ["CRITICAL", "HIGH"]
        ]

        if critical_high_issues:
            report_lines.extend([
                "",
                "## Priority Issues Requiring Immediate Action",
                ""
            ])

            for issue in sorted(critical_high_issues,
                              key=lambda x: {"CRITICAL": 2,
                                  "HIGH": 1}.get(x.severity,
                                  0),
                              reverse=True):
                report_lines.extend([
                    f"### {issue.severity}: {issue.description}",
                    f"**Legal Reference:** {issue.legal_reference}",
                    f"**Affected Data:** {', '.join(issue.affected_data)}",
                    "**Remediation Steps:**"
                ])

                for step in issue.remediation_steps:
                    report_lines.append(f"- {step}")

                report_lines.append("")

        # Recommendations
        report_lines.extend([
            "## Recommendations for Improved Compliance",
            ""
        ])

        for i, recommendation in enumerate(assessment.recommendations, 1):
            report_lines.append(f"{i}. {recommendation}")

        report_lines.extend([
            "",
            "## Conclusion",
            "",
            f"This assessment identified {len(assessment.issues_identified)} compliance issues requiring attention.",
            f"With a current compliance score of {assessment.compliance_score:.1f}%, CosmicHub should prioritize " +
            "addressing critical and high-priority issues to achieve full GDPR compliance.",
            "",
            "Regular compliance monitoring and updates to privacy practices are recommended to maintain ",
            "ongoing compliance with evolving data protection requirements.",
            "",
            "---",
            "",
            "*This report was generated by the CosmicHub GDPR Compliance Checker*"
        ])

        return "\n".join(report_lines)
