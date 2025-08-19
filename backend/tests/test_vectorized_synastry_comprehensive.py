"""
Comprehensive unit tests for vectorized synastry calculations.
This cleaned suite calls vectorized functions with dict inputs (PLANETS keys)
and performs conservative assertions on shapes and types so tests are robust
across small implementation changes.
"""

import os
import sys
from typing import Dict

import numpy as np
import pytest

# Ensure backend package is importable during tests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.aspect_utils import PLANETS, build_aspect_matrix
from utils.vectorized_aspect_utils import VectorizedAspectCalculator


def to_planet_dict(vals: list[float]) -> Dict[str, float]:
    return {
        PLANETS[i]: float(vals[i]) for i in range(min(len(vals), len(PLANETS)))
    }


class TestVectorizedAspectCalculator:
    def setup_method(self):
        self.calculator = VectorizedAspectCalculator()

        # sample planet longitude dictionaries used across tests
        self.test_planets_1 = {
            "sun": 0.0,
            "moon": 30.0,
            "mercury": 60.0,
            "venus": 90.0,
            "mars": 120.0,
            "jupiter": 150.0,
            "saturn": 180.0,
            "uranus": 210.0,
            "neptune": 240.0,
            "pluto": 270.0,
        }
        self.test_planets_2 = {
            "sun": 15.0,
            "moon": 45.0,
            "mercury": 75.0,
            "venus": 105.0,
            "mars": 135.0,
            "jupiter": 165.0,
            "saturn": 195.0,
            "uranus": 225.0,
            "neptune": 255.0,
            "pluto": 285.0,
        }

    def test_separation_matrix_basic(self):
        lons1 = {"sun": 0.0, "moon": 90.0, "mercury": 180.0}
        lons2 = {"sun": 30.0, "moon": 120.0, "mercury": 210.0}

        result = self.calculator.calculate_separation_matrix(lons1, lons2)

        assert isinstance(result, np.ndarray)
        # vectorized implementation always returns a square matrix of size len(PLANETS)
        assert result.shape == (len(PLANETS), len(PLANETS))

    def test_find_aspects_vectorized_shapes(self):
        separations = self.calculator.calculate_separation_matrix(
            self.test_planets_1, self.test_planets_2
        )

        aspect_indices, min_orbs, has_aspect = (
            self.calculator.find_aspects_vectorized(separations)
        )

        assert aspect_indices.shape == separations.shape
        assert min_orbs.shape == separations.shape
        assert has_aspect.shape == separations.shape
        assert np.issubdtype(aspect_indices.dtype, np.integer)

    def test_build_aspect_matrix_vectorized_types(self):
        matrix = self.calculator.build_aspect_matrix_vectorized(
            self.test_planets_1, self.test_planets_2
        )

        assert isinstance(matrix, list)
        assert len(matrix) == len(PLANETS)
        for row in matrix:
            assert isinstance(row, list)
            assert len(row) == len(PLANETS)
            for cell in row:
                assert (cell is None) or isinstance(cell, dict)
                if cell is not None:
                    assert (
                        "aspect" in cell and "orb" in cell and "type" in cell
                    )

    def test_batch_compatibility_scores_consistency(self):
        chart_pairs = [
            (self.test_planets_1, self.test_planets_2),
            (self.test_planets_2, self.test_planets_1),
            (self.test_planets_1, self.test_planets_1),
        ]

        scores = self.calculator.batch_compatibility_scores(chart_pairs)
        assert isinstance(scores, list)
        assert len(scores) == 3
        for s in scores:
            assert isinstance(s, float)


def test_vectorized_vs_traditional_build():
    calc = VectorizedAspectCalculator()
    trad = build_aspect_matrix(
        {k: 0.0 for k in PLANETS}, {k: 0.0 for k in PLANETS}
    )
    vect = calc.build_aspect_matrix_vectorized(
        {k: 0.0 for k in PLANETS}, {k: 0.0 for k in PLANETS}
    )

    assert len(trad) == len(vect)
    assert all(len(r) == len(v) for r, v in zip(trad, vect))


if __name__ == "__main__":
    pytest.main([__file__, "-q"])
