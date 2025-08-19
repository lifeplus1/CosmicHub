"""Edge case tests for gene_keys calculation logic."""

from __future__ import annotations

from astro.calculations.gene_keys import get_gene_key_details


def test_get_gene_key_details_invalid_gate():
    details = get_gene_key_details(
        999, 1, "iq"
    )  # invalid gate returns error dict
    assert "error" in details


def test_get_gene_key_details_line_value_passthrough():
    # Function does not clamp; ensures provided line echoed back
    d_custom = get_gene_key_details(1, 7, "iq")
    assert d_custom["line"] == 7
