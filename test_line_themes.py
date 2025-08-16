#!/usr/bin/env python3
"""Test script for Gene Keys line themes"""

from backend.astro.calculations.gene_keys import calculate_gene_keys_profile
from typing import TypedDict, Dict, Any, cast


class GeneKeyDetails(TypedDict):
    number: int
    line: int
    name: str
    shadow: str
    gift: str
    siddhi: str
    description: str
    keynote: str
    codon: str
    programming_partner: int
    sphere: str
    line_theme: str
    sphere_context: str

# Test with realistic birth data  
try:
    # Explicitly annotate the result to avoid 'Unknown' types during static analysis
    result: Dict[str, Any] = calculate_gene_keys_profile(1990, 6, 15, 14, 30, 40.7128, -74.0060, 'America/New_York')
    print('Gene Keys with Line Themes:')
    print('=' * 50)

    # Check the Venus Sequence spheres for line themes
    for sphere in ['iq', 'eq', 'sq']:
        if sphere in result:
            raw_value = result[sphere]
            if isinstance(raw_value, dict):
                sphere_data = cast(GeneKeyDetails, raw_value)
                print(f'{sphere.upper()} Sphere:')
                try:
                    print(f'  Gene Key: {sphere_data["number"]}')
                    print(f'  Name: {sphere_data["name"]}')
                    print(f'  Line: {sphere_data["line"]}')
                    print(f'  Line Theme: {sphere_data["line_theme"]}')
                    print(f'  Sphere Context: {sphere_data["sphere_context"]}')
                except KeyError as ke:
                    print(f'  Missing expected key: {ke}')
                print()
            else:
                print(f'{sphere.upper()}: {raw_value}')
        else:
            print(f'{sphere.upper()}: Not found in result')

except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
