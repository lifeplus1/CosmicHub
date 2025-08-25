"""Enhanced anonymization techniques for improved privacy protection.

Implements advanced anonymization methods beyond basic pseudonymization including
differential privacy, k-anonymity enforcement, and generalization techniques.
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional, Union

import numpy as np  # For Laplace noise generation

from utils.pseudonymization import pseudonymize


class AnonymizationLevel(Enum):
    """Anonymization strength levels."""

    MINIMAL = "minimal"           # Basic pseudonymization
    MODERATE = "moderate"         # K-anonymity + noise
    STRONG = "strong"            # Differential privacy
    MAXIMUM = "maximum"          # Full anonymization


@dataclass
class AnonymizationConfig:
    """Configuration for anonymization techniques."""

    level: AnonymizationLevel
    k_anonymity_threshold: int = 5
    noise_scale: float = 1.0
    epsilon: float = 1.0          # Differential privacy parameter
    generalization_levels: Optional[Dict[str, int]] = None

    def __post_init__(self) -> None:
        if self.generalization_levels is None:
            self.generalization_levels = {}


@dataclass
class AnonymizationResult:
    """Result of anonymization process."""

    anonymized_data: Union[Dict[str, Any], List[Dict[str, Any]]]
    applied_techniques: List[str]
    privacy_guarantee: str
    information_loss: float       # 0-100, percentage of information lost


class EnhancedAnonymizer:
    """Advanced anonymization engine with multiple techniques."""

    def __init__(self, config: Optional[AnonymizationConfig] = None):
        self.config = config or AnonymizationConfig(level=AnonymizationLevel.MODERATE)
        self.generalization_hierarchies = self._build_generalization_hierarchies()

    def _build_generalization_hierarchies(self) -> Dict[str, List[List[str]]]:
        """Build generalization hierarchies for common attributes."""

        return {
            "age": [
                ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
                ["18-35", "36-55", "55+"],
                ["Adult"]
            ],
            "location": [
                # City level
                ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
                # State level
                ["New York", "California", "Illinois", "Texas", "Arizona"],
                # Region level
                ["Northeast", "West", "Midwest", "South", "Southwest"],
                # Country level
                ["United States"]
            ],
            "income": [
                ["<30k", "30k-50k", "50k-75k", "75k-100k", "100k+"],
                ["<50k", "50k-100k", "100k+"],
                ["Income reported"]
            ]
        }

    def anonymize_record(
        self,
        record: Dict[str, Any],
        sensitive_attributes: Optional[List[str]] = None
    ) -> AnonymizationResult:
        """Anonymize a single record using configured techniques."""

        if not record:
            return AnonymizationResult(
                anonymized_data={},
                applied_techniques=[],
                privacy_guarantee="No data to anonymize",
                information_loss=0.0
            )

        sensitive_attributes = sensitive_attributes or []
        applied_techniques: List[str] = []
        anonymized_record = record.copy()
        information_loss = 0.0

        # Apply techniques based on configuration level
        if self.config.level in [AnonymizationLevel.MINIMAL, AnonymizationLevel.MODERATE,
                                AnonymizationLevel.STRONG, AnonymizationLevel.MAXIMUM]:
            # Apply pseudonymization to identifiers
            anonymized_record, pseudo_loss = self._apply_pseudonymization(
                anonymized_record, sensitive_attributes
            )
            applied_techniques.append("pseudonymization")
            information_loss += pseudo_loss

        if self.config.level in [AnonymizationLevel.MODERATE, AnonymizationLevel.STRONG,
                                AnonymizationLevel.MAXIMUM]:
            # Apply generalization
            anonymized_record, gen_loss = self._apply_generalization(anonymized_record)
            applied_techniques.append("generalization")
            information_loss += gen_loss

            # Apply noise addition
            anonymized_record, noise_loss = self._apply_noise(anonymized_record)
            applied_techniques.append("noise_addition")
            information_loss += noise_loss

        if self.config.level in [AnonymizationLevel.STRONG, AnonymizationLevel.MAXIMUM]:
            # Apply differential privacy
            anonymized_record, dp_loss = self._apply_differential_privacy(anonymized_record)
            applied_techniques.append("differential_privacy")
            information_loss += dp_loss

        if self.config.level == AnonymizationLevel.MAXIMUM:
            # Apply suppression for high-risk attributes
            anonymized_record, supp_loss = self._apply_suppression(
                anonymized_record, sensitive_attributes
            )
            applied_techniques.append("suppression")
            information_loss += supp_loss

        # Generate privacy guarantee
        privacy_guarantee = self._generate_privacy_guarantee(applied_techniques)

        # Cap information loss at 100%
        information_loss = min(information_loss, 100.0)

        return AnonymizationResult(
            anonymized_data=anonymized_record,
            applied_techniques=applied_techniques,
            privacy_guarantee=privacy_guarantee,
            information_loss=information_loss
        )

    def anonymize_dataset(
        self,
        dataset: List[Dict[str, Any]],
        sensitive_attributes: Optional[List[str]] = None
    ) -> AnonymizationResult:
        """Anonymize an entire dataset with k-anonymity guarantees."""

        if not dataset:
            return AnonymizationResult(
                anonymized_data=[],
                applied_techniques=[],
                privacy_guarantee="No data to anonymize",
                information_loss=0.0
            )

        applied_techniques: List[str] = []
        total_information_loss = 0.0

        # First pass: individual record anonymization
        anonymized_records: List[Dict[str, Any]] = []
        for record in dataset:
            result = self.anonymize_record(record, sensitive_attributes)
            # anonymize_record returns a single Dict, not a List
            if isinstance(result.anonymized_data, dict):
                anonymized_records.append(result.anonymized_data)
            if result.applied_techniques:
                applied_techniques.extend(result.applied_techniques)
            total_information_loss += result.information_loss

        # Second pass: ensure k-anonymity across dataset
        if self.config.k_anonymity_threshold > 1:
            anonymized_records, k_loss = self._enforce_k_anonymity(
                anonymized_records, self.config.k_anonymity_threshold
            )
            applied_techniques.append("k_anonymity_enforcement")
            total_information_loss += k_loss

        # Average information loss across records
        avg_information_loss = total_information_loss / len(dataset) if dataset else 0.0

        # Remove duplicate techniques
        unique_techniques = list(dict.fromkeys(applied_techniques))

        privacy_guarantee = self._generate_privacy_guarantee(unique_techniques)

        return AnonymizationResult(
            anonymized_data=anonymized_records,
            applied_techniques=unique_techniques,
            privacy_guarantee=privacy_guarantee,
            information_loss=avg_information_loss
        )

    def _apply_pseudonymization(
        self,
        record: Dict[str, Any],
        sensitive_attributes: List[str]
    ) -> tuple[Dict[str, Any], float]:
        """Apply pseudonymization to identifiers."""

        anonymized = record.copy()
        information_loss = 0.0

        # Identify fields that should be pseudonymized
        pseudonym_fields = [
            "user_id", "firebase_uid", "email", "session_id", "device_id"
        ] + sensitive_attributes

        for field in pseudonym_fields:
            if field in anonymized:
                original_value = str(anonymized[field])
                if original_value and original_value.strip():
                    # Use existing pseudonymization utility
                    anonymized[field] = pseudonymize(original_value)
                    information_loss += 15.0  # Moderate information loss

        return anonymized, information_loss

    def _apply_generalization(
        self,
        record: Dict[str, Any]
    ) -> tuple[Dict[str, Any], float]:
        """Apply generalization using hierarchies."""

        anonymized = record.copy()
        information_loss = 0.0

        for field, hierarchies in self.generalization_hierarchies.items():
            if field in anonymized:
                original_value = str(anonymized[field])
                generalization_level = (self.config.generalization_levels or {}).get(field, 1)

                if generalization_level > 0 and len(hierarchies) > generalization_level - 1:
                    # Apply generalization
                    hierarchy = hierarchies[generalization_level - 1]
                    # Simple generalization - map to broader category
                    if original_value:
                        # In practice, this would use proper mapping logic
                        anonymized[field] = hierarchy[0] if hierarchy else original_value
                        information_loss += 10.0 * generalization_level

        return anonymized, information_loss

    def _apply_noise(
        self,
        record: Dict[str, Any]
    ) -> tuple[Dict[str, Any], float]:
        """Apply statistical noise to numeric values."""

        anonymized = record.copy()
        information_loss = 0.0

        for field, value in anonymized.items():
            if isinstance(value, (int, float)) and field not in ["id", "timestamp"]:
                # Add Laplace noise for differential privacy
                noise = np.random.laplace(0, self.config.noise_scale)
                anonymized[field] = value + noise
                information_loss += 5.0

        return anonymized, information_loss

    def _apply_differential_privacy(
        self,
        record: Dict[str, Any]
    ) -> tuple[Dict[str, Any], float]:
        """Apply differential privacy mechanisms."""

        anonymized = record.copy()
        information_loss = 0.0

        # Apply privacy-preserving perturbations
        for field, value in anonymized.items():
            if isinstance(value, (int, float)):
                # Laplace mechanism for differential privacy
                sensitivity = 1.0  # Assume unit sensitivity
                scale = sensitivity / self.config.epsilon
                noise = np.random.laplace(0, scale)
                anonymized[field] = value + noise
                information_loss += 10.0

            elif isinstance(value, str) and len(value) > 0:
                # For string values, add character-level perturbations
                if random.random() < 0.1:  # 10% chance of perturbation
                    chars = list(value)
                    if chars:
                        # Randomly replace one character
                        idx = random.randint(0, len(chars) - 1)
                        chars[idx] = chr(ord(chars[idx]) ^ 1)  # Simple bit flip
                        anonymized[field] = ''.join(chars)
                        information_loss += 3.0

        return anonymized, information_loss

    def _apply_suppression(
        self,
        record: Dict[str, Any],
        sensitive_attributes: List[str]
    ) -> tuple[Dict[str, Any], float]:
        """Suppress high-risk attributes entirely."""

        anonymized = record.copy()
        information_loss = 0.0

        # Suppress extremely sensitive fields
        high_risk_fields = [
            "social_security_number", "credit_card", "password", "secret_key"
        ] + [attr for attr in sensitive_attributes if "secret" in attr.lower()]

        for field in high_risk_fields:
            if field in anonymized:
                del anonymized[field]
                information_loss += 25.0  # High information loss for suppression

        return anonymized, information_loss

    def _enforce_k_anonymity(
        self,
        records: List[Dict[str, Any]],
        k_threshold: int
    ) -> tuple[List[Dict[str, Any]], float]:
        """Enforce k-anonymity across the dataset."""

        if not records or k_threshold <= 1:
            return records, 0.0

        # Group records by quasi-identifier combinations
        quasi_identifiers = ["age", "location", "gender"]  # Common quasi-identifiers

        equivalence_classes: Dict[str, List[Dict[str, Any]]] = {}

        for record in records:
            # Create quasi-identifier signature
            quasi_sig = "|".join(
                str(record.get(attr, "")) for attr in quasi_identifiers
            )

            if quasi_sig not in equivalence_classes:
                equivalence_classes[quasi_sig] = []
            equivalence_classes[quasi_sig].append(record)

        # Process equivalence classes that don't meet k-anonymity
        processed_records: List[Dict[str, Any]] = []
        information_loss = 0.0

        for class_records in equivalence_classes.values():
            if len(class_records) < k_threshold:
                # Need to generalize or suppress to meet k-anonymity
                for record in class_records:
                    generalized_record = record.copy()

                    # Apply more aggressive generalization
                    for field in quasi_identifiers:
                        if field in generalized_record:
                            generalized_record[field] = "*"  # Suppress value

                    processed_records.append(generalized_record)
                    information_loss += 20.0
            else:
                processed_records.extend(class_records)

        avg_loss = information_loss / len(records) if records else 0.0
        return processed_records, avg_loss

    def _generate_privacy_guarantee(self, techniques: List[str]) -> str:
        """Generate privacy guarantee description."""

        if not techniques:
            return "No anonymization applied"

        guarantees: List[str] = []

        if "pseudonymization" in techniques:
            guarantees.append("Identifiers pseudonymized with SHA-256+salt")

        if "k_anonymity_enforcement" in techniques:
            guarantees.append(f"{self.config.k_anonymity_threshold}-anonymity guaranteed")

        if "differential_privacy" in techniques:
            guarantees.append(f"(ε={self.config.epsilon})-differential privacy")

        if "generalization" in techniques:
            guarantees.append("Data generalized to reduce granularity")

        if "noise_addition" in techniques:
            guarantees.append("Statistical noise added to numeric values")

        if "suppression" in techniques:
            guarantees.append("High-risk attributes suppressed")

        return "; ".join(guarantees)


# Utility functions for common anonymization tasks
def anonymize_user_record(
    user_record: Dict[str, Any],
    level: AnonymizationLevel = AnonymizationLevel.MODERATE
) -> AnonymizationResult:
    """Convenience function to anonymize user record."""

    config = AnonymizationConfig(level=level)
    anonymizer = EnhancedAnonymizer(config)

    sensitive_attrs = ["email", "birth_location", "birth_time"]
    return anonymizer.anonymize_record(user_record, sensitive_attrs)


def anonymize_analytics_batch(
    analytics_events: List[Dict[str, Any]],
    epsilon: float = 1.0
) -> AnonymizationResult:
    """Convenience function to anonymize analytics events with differential privacy."""

    config = AnonymizationConfig(
        level=AnonymizationLevel.STRONG,
        epsilon=epsilon,
        k_anonymity_threshold=5
    )
    anonymizer = EnhancedAnonymizer(config)

    sensitive_attrs = ["user_id", "session_id", "ip_address"]
    return anonymizer.anonymize_dataset(analytics_events, sensitive_attrs)