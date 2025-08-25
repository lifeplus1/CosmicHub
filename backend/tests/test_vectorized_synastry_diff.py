"""Differential tests ensuring vectorized synastry matches traditional implementation.  # noqa: E501

These fast unit-style tests guard against semantic drift between
`build_aspect_matrix` and `build_aspect_matrix_fast`.
"""

import random
from typing import Dict

import pytest

from backend.utils.aspect_utils import PLANETS, build_aspect_matrix
from backend.utils.vectorized_aspect_utils import build_aspect_matrix_fast


def gen_chart(seed: int) -> Dict[str, float]:
    random.seed(seed)
    return {p: random.uniform(0, 360) for p in PLANETS}


@pytest.mark.parametrize("seed", [1, 2, 3, 10, 42, 123, 999])
def test_matrix_exact_match(seed: int):
    """All aspect cells (None vs AspectData contents) must match exactly."""
    c1 = gen_chart(seed)
    c2 = gen_chart(seed + 1000)
    trad = build_aspect_matrix(c1, c2)
    vec = build_aspect_matrix_fast(c1, c2)

    assert len(trad) == len(vec) == 10
    for r_trad, r_vec in zip(trad, vec):
        assert len(r_trad) == len(r_vec) == 10
        for cell_a, cell_b in zip(r_trad, r_vec):
            if cell_a is None or cell_b is None:
                assert (
                    cell_a is cell_b
                ), "Mismatch in presence/absence of aspect cell"
            else:
                assert cell_a["aspect"] == cell_b["aspect"]
                # Allow tiny float noise tolerance (should be identical though)
                assert abs(cell_a["orb"] - cell_b["orb"]) < 1e-9
                assert cell_a["type"] == cell_b["type"]


def test_random_distribution_consistency():
    """Aggregate random sample should produce identical aspect frequency distributions."""  # noqa: E501
    seeds = list(range(20))
    freq_trad: Dict[str, int] = {}
    freq_vec: Dict[str, int] = {}
    for s in seeds:
        c1 = gen_chart(s)
        c2 = gen_chart(s + 10000)
        trad = build_aspect_matrix(c1, c2)
        vec = build_aspect_matrix_fast(c1, c2)
        for r_trad, r_vec in zip(trad, vec):
            for cell_a, cell_b in zip(r_trad, r_vec):
                if cell_a is not None:
                    freq_trad[cell_a["aspect"]] = (
                        freq_trad.get(cell_a["aspect"], 0) + 1
                    )
                if cell_b is not None:
                    freq_vec[cell_b["aspect"]] = (
                        freq_vec.get(cell_b["aspect"], 0) + 1
                    )
    assert freq_trad == freq_vec
