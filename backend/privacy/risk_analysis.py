"""Re-identification risk analysis module.

Provides comprehensive risk assessment for pseudonymized data including
k-anonymity analysis, l-diversity checks, and t-closeness evaluation.
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class RiskLevel(Enum):
    """Risk levels for re-identification assessment."""

    VERY_LOW = "very_low"     # < 5% risk
    LOW = "low"               # 5-15% risk
    MEDIUM = "medium"         # 15-30% risk
    HIGH = "high"             # 30-60% risk
    VERY_HIGH = "very_high"   # > 60% risk


@dataclass
class AnonymityMetrics:
    """Metrics for anonymity assessment."""

    k_anonymity: int          # Minimum group size
    l_diversity: float        # Diversity in sensitive attributes
    t_closeness: float        # Distribution similarity
    entropy: float            # Information entropy
    uniqueness_ratio: float   # Ratio of unique records


@dataclass
class RiskAssessment:
    """Complete risk assessment results."""

    overall_risk: RiskLevel
    metrics: AnonymityMetrics
    vulnerable_attributes: List[str]
    recommendations: List[str]
    confidence_score: float   # 0-100


class ReIdentificationRiskAnalyzer:
    """Advanced re-identification risk analyzer."""

    def __init__(self):
        self.quasi_identifiers = [
            "age_group",
            "location_region",
            "subscription_tier",
            "usage_pattern",
            "chart_preferences"
        ]

        self.sensitive_attributes = [
            "birth_location",
            "birth_time",
            "personal_questions",
            "reading_history"
        ]

    def analyze_dataset_risk(
        self,
        dataset: List[Dict[str, str]],
        sensitive_attrs: Optional[List[str]] = None
    ) -> RiskAssessment:
        """Analyze re-identification risk for a dataset."""

        if not dataset:
            return RiskAssessment(
                overall_risk=RiskLevel.VERY_LOW,
                metrics=AnonymityMetrics(
                    k_anonymity=0, l_diversity=0, t_closeness=0,
                    entropy=0, uniqueness_ratio=0
                ),
                vulnerable_attributes=[],
                recommendations=["No data to analyze"],
                confidence_score=100.0
            )

        sensitive_attrs = sensitive_attrs or self.sensitive_attributes

        # Calculate anonymity metrics
        k_anon = self._calculate_k_anonymity(dataset)
        l_div = self._calculate_l_diversity(dataset, sensitive_attrs)
        t_close = self._calculate_t_closeness(dataset, sensitive_attrs)
        entropy = self._calculate_entropy(dataset)
        uniqueness = self._calculate_uniqueness_ratio(dataset)

        metrics = AnonymityMetrics(
            k_anonymity=k_anon,
            l_diversity=l_div,
            t_closeness=t_close,
            entropy=entropy,
            uniqueness_ratio=uniqueness
        )

        # Assess overall risk
        risk_level = self._assess_overall_risk(metrics)

        # Identify vulnerable attributes
        vulnerable_attrs = self._identify_vulnerable_attributes(dataset)

        # Generate recommendations
        recommendations = self._generate_risk_recommendations(metrics,
            vulnerable_attrs)  # noqa: E128

        # Calculate confidence score
        confidence = self._calculate_confidence_score(len(dataset))

        return RiskAssessment(
            overall_risk=risk_level,
            metrics=metrics,
            vulnerable_attributes=vulnerable_attrs,
            recommendations=recommendations,
            confidence_score=confidence
        )

    def _calculate_k_anonymity(self, dataset: List[Dict[str, str]]) -> int:
        """Calculate k-anonymity value (minimum equivalence class size)."""

        if not dataset:
            return 0

        # Group by quasi-identifiers
        equivalence_classes: Dict[str, int] = {}

        for record in dataset:
            # Create quasi-identifier signature
            quasi_sig = "|".join(
                str(record.get(attr, ""))
                for attr in self.quasi_identifiers
                if attr in record
            )

            equivalence_classes[quasi_sig] = equivalence_classes.get(quasi_sig,
                0) + 1  # noqa: E128

        # Return minimum class size (k-anonymity)
        return min(equivalence_classes.values()) if equivalence_classes else 0

    def _calculate_l_diversity(
        self,
        dataset: List[Dict[str, str]],
        sensitive_attrs: List[str]
    ) -> float:
        """Calculate l-diversity (diversity in sensitive attributes)."""

        if not dataset or not sensitive_attrs:
            return 0.0

        # Group by quasi-identifiers
        equivalence_classes: Dict[str, List[Dict[str, str]]] = {}

        for record in dataset:
            quasi_sig = "|".join(
                str(record.get(attr, ""))
                for attr in self.quasi_identifiers
                if attr in record
            )

            if quasi_sig not in equivalence_classes:
                equivalence_classes[quasi_sig] = []
            equivalence_classes[quasi_sig].append(record)

        # Calculate diversity for each equivalence class
        min_diversity = float('inf')

        for class_records in equivalence_classes.values():
            class_diversity = 0.0

            for attr in sensitive_attrs:
                # Count unique values for this sensitive attribute
                unique_values = set(
                    record.get(attr, "")
                    for record in class_records
                )
                class_diversity += len(unique_values)

            # Average diversity across sensitive attributes
            if sensitive_attrs:
                class_diversity /= len(sensitive_attrs)

            min_diversity = min(min_diversity, class_diversity)

        return min_diversity if min_diversity != float('inf') else 0.0

    def _calculate_t_closeness(
        self,
        dataset: List[Dict[str, str]],
        sensitive_attrs: List[str]
    ) -> float:
        """Calculate t-closeness (distribution similarity)."""

        if not dataset or not sensitive_attrs:
            return 0.0

        # Simplified t-closeness calculation
        # In practice, this would involve Earth Mover's Distance

        total_distribution_similarity = 0.0

        for attr in sensitive_attrs:
            # Get overall distribution
            all_values = [record.get(attr, "") for record in dataset]

            # Compare with group distributions
            # For simplicity, we'll use entropy-based similarity
            attr_entropy = self._calculate_attribute_entropy(all_values)
            total_distribution_similarity += attr_entropy

        return total_distribution_similarity / len(sensitive_attrs) if sensitive_attrs else 0.0

    def _calculate_distribution(self, values: List[str]) -> Dict[str, float]:
        """Calculate value distribution."""

        if not values:
            return {}

        counts: Dict[str, int] = {}
        for value in values:
            counts[value] = counts.get(value, 0) + 1

        total = len(values)
        return {value: count / total for value, count in counts.items()}

    def _calculate_attribute_entropy(self, values: List[str]) -> float:
        """Calculate entropy for attribute values."""

        if not values:
            return 0.0

        distribution = self._calculate_distribution(values)
        entropy = 0.0

        for prob in distribution.values():
            if prob > 0:
                entropy -= prob * math.log2(prob)

        return entropy

    def _calculate_entropy(self, dataset: List[Dict[str, str]]) -> float:
        """Calculate overall dataset entropy."""

        if not dataset:
            return 0.0

        total_entropy = 0.0
        attr_count = 0

        # Calculate entropy for each attribute
        all_attrs: set[str] = set()
        for record in dataset:
            all_attrs.update(record.keys())

        for attr in all_attrs:
            values = [record.get(attr, "") for record in dataset]
            attr_entropy = self._calculate_attribute_entropy(values)
            total_entropy += attr_entropy
            attr_count += 1

        return total_entropy / attr_count if attr_count > 0 else 0.0

    def _calculate_uniqueness_ratio(self,
        dataset: List[Dict[str,
        str]]) -> float:
        """Calculate ratio of unique records."""

        if not dataset:
            return 0.0

        # Create signatures for each record
        signatures: set[str] = set()

        for record in dataset:
            # Use all available attributes for signature
            signature = "|".join(
                f"{k}:{v}" for k, v in sorted(record.items())
            )
            signatures.add(signature)

        return len(signatures) / len(dataset)

    def _assess_overall_risk(self, metrics: AnonymityMetrics) -> RiskLevel:
        """Assess overall re-identification risk level."""

        # Risk scoring based on multiple factors
        risk_score = 0.0

        # K-anonymity factor (lower k = higher risk)
        if metrics.k_anonymity < 2:
            risk_score += 30
        elif metrics.k_anonymity < 5:
            risk_score += 20
        elif metrics.k_anonymity < 10:
            risk_score += 10
        else:
            risk_score += 5

        # L-diversity factor (lower diversity = higher risk)
        if metrics.l_diversity < 2:
            risk_score += 25
        elif metrics.l_diversity < 3:
            risk_score += 15
        else:
            risk_score += 5

        # Uniqueness factor (higher uniqueness = higher risk)
        if metrics.uniqueness_ratio > 0.9:
            risk_score += 20
        elif metrics.uniqueness_ratio > 0.7:
            risk_score += 15
        elif metrics.uniqueness_ratio > 0.5:
            risk_score += 10
        else:
            risk_score += 5

        # Entropy factor (lower entropy = higher risk)
        if metrics.entropy < 2:
            risk_score += 15
        elif metrics.entropy < 4:
            risk_score += 10
        else:
            risk_score += 5

        # Convert score to risk level
        if risk_score >= 60:
            return RiskLevel.VERY_HIGH
        elif risk_score >= 45:
            return RiskLevel.HIGH
        elif risk_score >= 30:
            return RiskLevel.MEDIUM
        elif risk_score >= 15:
            return RiskLevel.LOW
        else:
            return RiskLevel.VERY_LOW

    def _identify_vulnerable_attributes(self,
        dataset: List[Dict[str,
        str]]) -> List[str]:
        """Identify attributes that increase re-identification risk."""

        vulnerable_attrs: List[str] = []

        if not dataset:
            return vulnerable_attrs

        all_attrs: set[str] = set()
        for record in dataset:
            all_attrs.update(record.keys())

        for attr in all_attrs:
            values = [record.get(attr, "") for record in dataset]

            # Check for high uniqueness
            unique_values = len(set(values))
            uniqueness_ratio = unique_values / len(values) if values else 0

            if uniqueness_ratio > 0.8:  # High uniqueness threshold
                vulnerable_attrs.append(attr)
                continue

            # Check for low entropy (predictable values)
            entropy = self._calculate_attribute_entropy(values)
            if entropy < 1.5:  # Low entropy threshold
                vulnerable_attrs.append(attr)

        return vulnerable_attrs

    def _generate_risk_recommendations(
        self,
        metrics: AnonymityMetrics,
        vulnerable_attrs: List[str]
    ) -> List[str]:
        """Generate risk mitigation recommendations."""

        recommendations: List[str] = []

        # K-anonymity recommendations
        if metrics.k_anonymity < 5:
            recommendations.append(
                f"Increase k-anonymity from {metrics.k_anonymity} to at least 5 by "
                "generalizing quasi-identifiers or adding noise"
            )

        # L-diversity recommendations
        if metrics.l_diversity < 2:
            recommendations.append(
                f"Improve l-diversity from {metrics.l_diversity:.1f} to at least 2 by "
                "ensuring diverse sensitive attribute values in each group"
            )

        # Uniqueness recommendations
        if metrics.uniqueness_ratio > 0.7:
            recommendations.append(
                f"Reduce uniqueness ratio from {metrics.uniqueness_ratio:.2f} by "
                "generalizing or removing highly unique attributes"
            )

        # Vulnerable attribute recommendations
        if vulnerable_attrs:
            recommendations.append(
                "Apply additional anonymization to vulnerable attributes: "
                f"{', '.join(vulnerable_attrs)}"
            )

        # General recommendations based on risk level
        if metrics.k_anonymity < 10 or metrics.l_diversity < 3:
            recommendations.append(
                "Consider implementing differential privacy for additional protection"
            )

        recommendations.append(
            "Implement regular re-identification risk monitoring and assessment"
        )

        return recommendations

    def _calculate_confidence_score(self, dataset_size: int) -> float:
        """Calculate confidence score for risk assessment."""

        # Confidence increases with dataset size
        if dataset_size < 100:
            return 60.0
        elif dataset_size < 1000:
            return 75.0
        elif dataset_size < 10000:
            return 85.0
        else:
            return 95.0
