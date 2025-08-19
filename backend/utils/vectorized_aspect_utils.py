# Vectorized implementation for synastry calculations
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from .aspect_utils import ASPECT_DEGREES, ORBS, PLANETS, AspectData


class VectorizedAspectCalculator:
    """High-performance vectorized aspect calculations for batch processing."""

    def __init__(self):
        self.planets = np.array(PLANETS)
        self.aspect_degrees = np.array(list(ASPECT_DEGREES.values()))
        self.aspect_names: List[str] = list(ASPECT_DEGREES.keys())
        self.orbs = np.array([ORBS[name] for name in self.aspect_names])

    def calculate_separation_matrix(
        self, long1: Dict[str, float], long2: Dict[str, float]
    ) -> np.ndarray:
        """Calculate all planet-to-planet separations in one vectorized operation."""
        # Extract longitudes for all planets
        lons1 = np.array([long1.get(p, 0.0) for p in PLANETS])
        lons2 = np.array([long2.get(p, 0.0) for p in PLANETS])

        # Broadcast calculation: (10, 1) - (1, 10) = (10, 10) matrix
        diff_matrix = np.abs(lons1[:, np.newaxis] - lons2[np.newaxis, :])

        # Handle 360-degree wraparound
        separations = np.minimum(diff_matrix, 360 - diff_matrix)

        return separations

    def find_aspects_vectorized(
        self, separations: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Find all aspects using vectorized operations."""
        # Create 3D array: (10, 10, num_aspects)
        sep_expanded = separations[:, :, np.newaxis]
        aspect_expanded = self.aspect_degrees[np.newaxis, np.newaxis, :]
        orb_expanded = self.orbs[np.newaxis, np.newaxis, :]

        # Calculate orbs for all combinations
        orbs_matrix = np.abs(sep_expanded - aspect_expanded)

        # Find valid aspects (within orb)
        valid_aspects = orbs_matrix <= orb_expanded

        # Get the best aspect for each planet pair (minimum orb)
        best_aspect_indices = np.argmin(
            np.where(valid_aspects, orbs_matrix, np.inf), axis=2
        )

        # Get minimum orbs
        min_orbs = np.min(np.where(valid_aspects, orbs_matrix, np.inf), axis=2)

        # Mask for valid aspects
        has_aspect = np.any(valid_aspects, axis=2)

        return best_aspect_indices, min_orbs, has_aspect

    def build_aspect_matrix_vectorized(
        self, long1: Dict[str, float], long2: Dict[str, float]
    ) -> List[List[Optional[AspectData]]]:
        """Vectorized builder (~10x faster) producing a mutable List[List] matrix.

        Although this returns concrete lists for performance reasons, any
        consumer that only reads should type its parameter as Matrix for
        covariance with other potential sequence-like containers.
        """
        separations = self.calculate_separation_matrix(long1, long2)
        aspect_indices, orbs, has_aspect = self.find_aspects_vectorized(
            separations
        )

        # Convert back to the expected format
        matrix: List[List[Optional[AspectData]]] = []
        for i in range(len(PLANETS)):
            row: List[Optional[AspectData]] = []
            for j in range(len(PLANETS)):
                if has_aspect[i, j] and not np.isinf(orbs[i, j]):
                    aspect_name: str = self.aspect_names[aspect_indices[i, j]]  # type: ignore[index]
                    aspect_type: str = self._get_aspect_type(aspect_name)  # type: ignore[arg-type]
                    row.append(
                        {
                            "aspect": aspect_name,
                            "orb": float(orbs[i, j]),
                            "type": aspect_type,
                        }
                    )
                else:
                    row.append(None)
            matrix.append(row)
        return matrix

    def batch_compatibility_scores(
        self, chart_pairs: List[Tuple[Dict[str, float], Dict[str, float]]]
    ) -> List[float]:
        """Calculate compatibility scores for multiple chart pairs in one operation."""
        scores: List[float] = []

        # Process all separations at once
        all_separations = np.array(
            [
                self.calculate_separation_matrix(long1, long2)
                for long1, long2 in chart_pairs
            ]
        )

        # Vectorized aspect finding for all pairs
        for separations in all_separations:
            aspect_indices, orbs, has_aspect = self.find_aspects_vectorized(
                separations
            )
            score = self._calculate_score_vectorized(
                aspect_indices, orbs, has_aspect
            )
            scores.append(score)

        return scores

    def _get_aspect_type(self, aspect: str) -> str:
        """Get aspect type for scoring."""
        if aspect in ["conjunction", "trine", "sextile"]:
            return "harmonious"
        elif aspect in ["square", "opposition", "quincunx"]:
            return "challenging"
        else:
            return "neutral"

    def _calculate_score_vectorized(
        self,
        aspect_indices: np.ndarray,
        orbs: np.ndarray,
        has_aspect: np.ndarray,
    ) -> float:
        """Vectorized compatibility score calculation."""
        # Define scoring arrays
        aspect_scores = np.array(
            [4, 3, 2, 1, -2, -3, -1]
        )  # matches ASPECT_SCORES order
        planet_weights = np.array(
            [3, 3, 2, 3, 3, 2, 1.5, 1, 1, 1]
        )  # PLANET_WEIGHTS order

        # Calculate weights matrix
        weight_matrix = (
            planet_weights[:, np.newaxis] + planet_weights[np.newaxis, :]
        ) / 2

        # Calculate orb factors
        max_orbs = self.orbs[aspect_indices]
        orb_factors = np.where(has_aspect, 1 - (orbs / max_orbs), 0)

        # Get scores for each aspect
        scores = np.where(has_aspect, aspect_scores[aspect_indices], 0)

        # Final score calculation
        weighted_scores = weight_matrix * scores * orb_factors
        total_score = np.sum(weighted_scores)

        return float(total_score)


# Global instance for reuse
vectorized_calculator = VectorizedAspectCalculator()


def build_aspect_matrix_fast(
    long1: Dict[str, float], long2: Dict[str, float]
) -> List[List[Optional[AspectData]]]:
    """Drop-in replacement for build_aspect_matrix with vectorized performance."""
    return vectorized_calculator.build_aspect_matrix_vectorized(long1, long2)


def batch_synastry_analysis(
    chart_pairs: List[Tuple[Dict[str, float], Dict[str, float]]],
) -> List[Dict[str, Any]]:
    """Analyze multiple synastry pairs efficiently."""
    scores = vectorized_calculator.batch_compatibility_scores(chart_pairs)

    results: List[Dict[str, Any]] = []
    for i, (long1, long2) in enumerate(chart_pairs):
        matrix = vectorized_calculator.build_aspect_matrix_vectorized(
            long1, long2
        )
        results.append(
            {"compatibility_score": scores[i], "aspect_matrix": matrix}
        )

    return results
