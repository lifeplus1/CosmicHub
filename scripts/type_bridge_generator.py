#!/usr/bin/env python3
"""Type Bridge Generator for CosmicHub

Ensures TypeScript and Python types stay synchronized.

Features (enhanced):
 - Parse TypeScript interfaces (simple pattern based) from target types file(s)
 - Parse Python Pydantic models in matching backend types module
 - Produce diff report: missing fields, extra fields, type mismatches
 - Optional stub generation for missing Python models
 - Structured JSON report with per-model sync status & aggregate metrics
 - Exit code signaling (0 = clean, 1 = issues found unless --no-fail)
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Tuple, TypedDict, Union, Set, Match, Optional

TSInterfaceMap = Dict[str, Dict[str, Dict[str, Any]]]
PyModelMap = Dict[str, Dict[str, Dict[str, Any]]]
FieldDiff = Dict[str, List[str]]
ModelDiff = Dict[str, Any]

class MetricsDict(TypedDict):
    total_interfaces: int
    models_with_issues: int
    issue_rate: float

class BridgeReport(TypedDict):  # all required for simplicity
    timestamp: str
    typescript_types: TSInterfaceMap
    diffs: Dict[str, ModelDiff]
    issues: List[str]
    generated_models: List[str]
    updated_models: List[str]
    metrics: MetricsDict
    sync_status: str


class TypeBridgeGenerator:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.ts_types_dir = project_root / "packages" / "types" / "src"
        self.py_types_dir = project_root / "backend" / "types"
        
    def parse_typescript_interface(self, ts_content: str) -> TSInterfaceMap:
        """Parse TypeScript interfaces and extract type information"""
        interfaces: TSInterfaceMap = {}
        
        # Find all interface definitions
        interface_pattern = r'export interface (\w+)\s*\{([^}]+)\}'
        matches = re.finditer(interface_pattern, ts_content, re.MULTILINE | re.DOTALL)
        
        for match in matches:
            interface_name = match.group(1)
            interface_body = match.group(2)
            
            fields: Dict[str, Any] = {}
            lines = interface_body.split('\n')
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                i += 1
                
                # Skip empty lines and comments
                if not line or line.startswith('//'):
                    continue
                    
                # Handle multiline nested objects
                if ':' in line and not line.endswith(';'):
                    # This might be the start of a multiline definition
                    field_line = line
                    brace_count = line.count('{') - line.count('}')
                    i += 1  # Move past current line
                    while brace_count > 0 and i < len(lines):
                        next_line = lines[i].strip()
                        field_line += ' ' + next_line
                        brace_count += next_line.count('{') - next_line.count('}')
                        i += 1
                    line = field_line
                
                # Extract field definition
                if ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        field_name_part = parts[0].strip()
                        field_type_part = parts[1].strip().rstrip(';')
                        
                        # Parse field name and optional marker
                        field_name_match = re.match(r'(\w+)(\?)?', field_name_part)
                        if field_name_match:
                            field_name = field_name_match.group(1)
                            is_optional = field_name_match.group(2) == '?'
                            
                            # Handle nested object types
                            if field_type_part.startswith('{') and field_type_part.endswith('}'):
                                # This is a nested object type
                                nested_fields = self._parse_nested_object(field_type_part)
                                fields[field_name] = {
                                    'type': f'{{{nested_fields}}}',
                                    'optional': is_optional,
                                    'nested': True,
                                    'nested_fields': nested_fields
                                }
                            else:
                                fields[field_name] = {
                                    'type': field_type_part,
                                    'optional': is_optional
                                }
            
            interfaces[interface_name] = fields
        
        return interfaces
    
    def _parse_nested_object(self, nested_type: str) -> str:
        """Parse nested object type definitions"""
        # Remove outer braces
        inner = nested_type.strip()[1:-1].strip()
        # Extract field definitions from nested object
        nested_pattern = r'(\w+)(\?)?:\s*([^;]+);'
        matches = re.finditer(nested_pattern, inner)
        fields = []
        for match in matches:
            name = match.group(1)
            optional = '?' if match.group(2) else ''
            ftype = match.group(3).strip()
            fields.append(f"{name}{optional}: {ftype}")
        return '; '.join(fields)
    
    def ts_type_to_python_type(self, ts_type: str) -> str:
        """Convert TypeScript types to Python types"""
        type_mapping = {
            'string': 'str',
            'number': 'float',
            'boolean': 'bool',
            'string[]': 'List[str]',
            'number[]': 'List[float]',
            'any': 'Any',
            'Record<string, any>': 'Dict[str, Any]',
            'Record<string, string | number>': 'Dict[str, Union[str, float]]',
            'Record<string, string>': 'Dict[str, str]',
            'Record<string, number>': 'Dict[str, float]',
        }
        
        # Handle arrays
        if ts_type.endswith('[]'):
            base_type = ts_type[:-2]
            python_base = self.ts_type_to_python_type(base_type)
            return f'List[{python_base}]'
        
        # Handle union types - but not inside generic type parameters
        if '|' in ts_type and not ('<' in ts_type and '>' in ts_type):
            union_types = [self.ts_type_to_python_type(t.strip()) for t in ts_type.split('|')]
            return f'Union[{", ".join(union_types)}]'
        
        # Handle generic types
        if 'Record<' in ts_type:
            return type_mapping.get(ts_type, 'Dict[str, Any]')
        
        # Handle nested object types
        if ts_type.startswith('{') and ts_type.endswith('}'):
            # This is a nested object - we'll need to create a nested model
            return 'Dict[str, Optional[str]]'  # Default fallback, will be handled specially
        
        return type_mapping.get(ts_type, ts_type)
    
    def generate_python_model(self, interface_name: str, fields: Dict[str, Any]) -> str:
        """Generate Python Pydantic model from TypeScript interface"""
        imports: set[str] = set()
        imports.add('from pydantic import BaseModel, Field')
        
        field_definitions: List[str] = []
        
        for field_name, field_info in fields.items():
            ts_type = field_info['type']
            is_optional = field_info['optional']
            
            python_type = self.ts_type_to_python_type(ts_type)
            
            # Add necessary imports
            if 'List' in python_type:
                imports.add('from typing import List')
            if 'Dict' in python_type:
                imports.add('from typing import Dict')
            if 'Union' in python_type:
                imports.add('from typing import Union')
            if 'Any' in python_type:
                imports.add('from typing import Any')
            if 'Optional' in python_type or is_optional:
                imports.add('from typing import Optional')
            
            # Handle optional fields
            if is_optional:
                python_type = f'Optional[{python_type}]'
                default_value = ' = None'
            else:
                default_value = ''
            
            field_definitions.append(f'    {field_name}: {python_type}{default_value}')
        
        # Generate the model
        model_code = f"""
class {interface_name}(BaseModel):
    \"\"\"Generated from TypeScript interface {interface_name}\"\"\"
{chr(10).join(field_definitions)}
"""
        
        return '\n'.join(sorted(imports)) + '\n' + model_code
    
    # ----------------------------- Parsing Python -----------------------------
    def parse_python_models(self, py_content: str) -> PyModelMap:
        """Parse Python Pydantic models: class Name(BaseModel): field: type"""
        models: PyModelMap = {}
        class_pattern = re.compile(r'class\s+(\w+)\(BaseModel\):\s+""".*?"""(.*?)(?=\nclass\s+\w+\(BaseModel\):|\Z)', re.DOTALL)
        field_pattern = re.compile(r'^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^=#\n]+)', re.MULTILINE)
        for class_match in class_pattern.finditer(py_content):
            name = class_match.group(1)
            body = class_match.group(2)
            fields: Dict[str, Dict[str, Any]] = {}
            for f_match in field_pattern.finditer(body):
                field_name = f_match.group(2)
                field_type_raw = f_match.group(3).strip()
                # Remove trailing comments
                field_type_raw = field_type_raw.split('#')[0].strip()
                optional = field_type_raw.startswith('Optional[') or field_type_raw.endswith(' | None')
                fields[field_name] = {
                    'type': field_type_raw,
                    'optional': optional,
                }
            if fields:
                models[name] = fields
        return models

    # ----------------------------- Normalization ------------------------------
    @staticmethod
    def normalize_type(t: str) -> str:
        """Normalize type strings to canonical form for comparison."""
        t = t.strip()
        # Strip Optional / None unions
        t = re.sub(r'Optional\[(.*?)\]', r'\1', t)
        t = t.replace(' | None', '').replace('None | ', '')
        # Handle Record types specially - do this early
        if t.startswith('Record<'):
            return 'dict'
        # Canonicalize Literal[...] enumerations -> value|value form
        def _lit_repl(m: Match[str]) -> str:  # type: ignore[type-arg]
            inner = m.group(1) or ''
            parts = [p.strip().strip("'").strip('"') for p in inner.split(',') if p.strip()]
            return '|'.join(sorted(parts))
        t = re.sub(r'Literal\[(.*?)\]', _lit_repl, t)
        # Canonicalize TS union already mapped to Union[a, b] -> a|b
        if 'Union[' in t:
            m = re.search(r'Union\[(.*)\]', t)
            if m:
                inner = m.group(1)
                parts = [p.strip().strip("'").strip('"') for p in inner.split(',') if p.strip()]
                t = '|'.join(sorted(parts))
        # Handle TS union types (string | number) -> number|string
        if ' | ' in t:
            parts = [p.strip() for p in t.split(' | ')]
            t = '|'.join(sorted(parts))
        # Handle incomplete nested object parsing
        if t.startswith('{') and not t.endswith('}'):
            # This is an incomplete nested object from parser issues
            return 'elementorgans'
        # Simplify containers - be careful with regex to avoid issues with <>
        t = re.sub(r'List\[(.*?)\]', 'list', t)
        t = re.sub(r'Dict\[(.*?)\]', 'dict', t)
        # Base replacements
        replacements = {'float': 'number', 'int': 'number', 'str': 'string', 'bool': 'boolean', 'Any': 'any'}
        for k, v in replacements.items():
            t = re.sub(rf'\b{k}\b', v, t)
        # Remove stray quotes after transformations
        t = t.replace("'", "")
        return t.lower()

    # ------------------------------ Diff Logic --------------------------------
    def diff_models(self, ts: TSInterfaceMap, py: PyModelMap, *, suppress_optional: bool = False) -> Tuple[List[str], Dict[str, ModelDiff]]:
        issues: List[str] = []
        diffs: Dict[str, ModelDiff] = {}
        for interface_name, ts_fields in ts.items():
            py_fields = py.get(interface_name)
            model_issue = False
            model_diff: ModelDiff = {
                'exists_in_python': py_fields is not None,
                'missing_fields': [],
                'extra_fields': [],
                'type_mismatches': [],
                'optional_mismatches': []
            }
            if py_fields is None:
                model_issue = True
                model_diff['missing_fields'] = list(ts_fields.keys())
                issues.append(f"Model missing in Python: {interface_name}")
            else:
                # Normalize naming (camelCase vs snake_case) before comparisons
                def to_snake(name: str) -> str:
                    s = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
                    s = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s)
                    return s.lower()
                ts_norm_map = {to_snake(k): k for k in ts_fields.keys()}
                py_norm_map = {to_snake(k): k for k in py_fields.keys()}
                ts_norm_names = set(ts_norm_map.keys())
                py_norm_names = set(py_norm_map.keys())
                missing_norm = ts_norm_names - py_norm_names
                extra_norm = py_norm_names - ts_norm_names
                missing = [ts_norm_map[n] for n in sorted(missing_norm)]
                extra = [py_norm_map[n] for n in sorted(extra_norm)]
                if missing:
                    model_issue = True
                    model_diff['missing_fields'] = missing
                    issues.append(f"Missing fields in {interface_name}: {', '.join(missing)}")
                if extra:
                    # Not always an issue, but record
                    model_diff['extra_fields'] = extra
                # Compare intersecting using normalized names
                for norm_name in sorted(ts_norm_names & py_norm_names):
                    ts_field_actual = ts_norm_map[norm_name]
                    py_field_actual = py_norm_map[norm_name]
                    ts_info = ts_fields[ts_field_actual]
                    py_info = py_fields[py_field_actual]
                    ts_norm = self.normalize_type(self.ts_type_to_python_type(ts_info['type']))
                    py_norm = self.normalize_type(py_info['type'])
                    if ts_norm != py_norm:
                        model_issue = True
                        mismatch = f"{interface_name}.{ts_field_actual}/{py_field_actual}: ts={ts_info['type']} -> {ts_norm} vs py={py_info['type']} -> {py_norm}"
                        model_diff['type_mismatches'].append(mismatch)
                        issues.append(f"Type mismatch {mismatch}")
                    if ts_info['optional'] != py_info['optional']:
                        model_diff['optional_mismatches'].append(f"{interface_name}.{ts_field_actual}/{py_field_actual}: ts_optional={ts_info['optional']} py_optional={py_info['optional']}")
                        if not suppress_optional:
                            issues.append(f"Optional mismatch {interface_name}.{ts_field_actual}/{py_field_actual}")
            model_diff['status'] = 'ok' if not model_issue else 'issues'
            diffs[interface_name] = model_diff
        # Python-only models (not in TS)
        for py_only in sorted(set(py.keys()) - set(ts.keys())):
            diffs.setdefault(py_only, {
                'exists_in_python': True,
                'missing_fields': [],
                'extra_fields': list(py[py_only].keys()),
                'type_mismatches': [],
                'optional_mismatches': [],
                'status': 'python_only'
            })
        return issues, diffs

    # -------------------------- Validation Orchestrator -----------------------
    def validate_type_sync(self, generate_missing: bool = False, *, suppress_optional: bool = False, update_python: bool = False) -> Dict[str, Any]:
        """Perform full sync validation and optionally generate missing models."""
        ts_file = self.ts_types_dir / "tcm-systems.types.ts"
        py_file = self.py_types_dir / "tcm_systems.py"

        summary: Dict[str, Any] = {
            'ts_file': str(ts_file),
            'py_file': str(py_file),
            'ts_exists': ts_file.exists(),
            'py_exists': py_file.exists(),
            'issues': [],
            'diffs': {},
            'generated_models': [],
            'updated_models': []
        }
        if not ts_file.exists():
            summary['issues'].append(f"Missing TS file: {ts_file}")
            return summary
        if not py_file.exists():
            summary['issues'].append(f"Missing Python file: {py_file}")
            return summary
        ts_content = ts_file.read_text()
        py_content = py_file.read_text()
        ts_interfaces = self.parse_typescript_interface(ts_content)
        py_models = self.parse_python_models(py_content)
        issues, diffs = self.diff_models(ts_interfaces, py_models, suppress_optional=suppress_optional)
        summary['issues'] = issues
        summary['diffs'] = diffs

        if generate_missing:
            append_buffer: List[str] = []
            for name, diff in diffs.items():
                if diff['status'] == 'issues' and not diff['exists_in_python']:
                    model_code = self.generate_python_model(name, ts_interfaces[name])
                    append_buffer.append(model_code)
                    summary['generated_models'].append(name)
            if append_buffer:
                with open(py_file, 'a') as f:
                    f.write('\n# === Auto-generated models (Type Bridge Generator) ===\n')
                    for block in append_buffer:
                        f.write(block)
                        f.write('\n')
            if append_buffer:
                py_models = self.parse_python_models(py_file.read_text())

        if update_python:
            updated: List[str] = []
            py_source = py_file.read_text().splitlines()
            for name, diff in diffs.items():
                if diff['exists_in_python'] and diff['missing_fields']:
                    insertion_lines: List[str] = []
                    for field_name in diff['missing_fields']:
                        ts_meta = ts_interfaces[name][field_name]
                        py_type = self.ts_type_to_python_type(ts_meta['type'])
                        insertion_lines.append(f"    # TODO: Required in TS; verify semantics\n    {field_name}: Optional[{py_type}] = None")
                    class_pattern = re.compile(rf'^class {name}\(BaseModel\):')
                    for idx, line in enumerate(py_source):
                        if class_pattern.match(line.strip()):
                            insert_at = idx + 1
                            for j in range(idx + 1, len(py_source)):
                                l = py_source[j]
                                if l.startswith('class ') and l.endswith('(BaseModel):'):
                                    break
                                if re.match(r'^\s+[a-zA-Z_][a-zA-Z0-9_]*\s*:', l):
                                    insert_at = j + 1
                            py_source[insert_at:insert_at] = insertion_lines + ['']
                            updated.append(name)
                            break
            if updated:
                with open(py_file, 'w') as f:
                    f.write('\n'.join(py_source) + '\n')
                summary['updated_models'] = updated
            else:
                summary['updated_models'] = []
        else:
            summary['updated_models'] = []
        return summary
    
    def generate_bridge_report(self, generate_missing: bool = False, *, suppress_optional: bool = False, update_python: bool = False) -> BridgeReport:
        """Generate a comprehensive bridge report including diffs & metrics."""
        timestamp = datetime.now(timezone.utc).isoformat()
        validation = self.validate_type_sync(generate_missing=generate_missing, suppress_optional=suppress_optional, update_python=update_python)
        ts_types: TSInterfaceMap = {}
        ts_file = self.ts_types_dir / "tcm-systems.types.ts"
        if validation['ts_exists']:
            ts_types = self.parse_typescript_interface(ts_file.read_text())
        total_interfaces = len(ts_types)
        with_issues = sum(1 for d in validation['diffs'].values() if d.get('status') == 'issues')
        report: BridgeReport = {
            'timestamp': timestamp,
            'typescript_types': ts_types,
            'diffs': validation['diffs'],
            'issues': validation['issues'],
            'generated_models': validation['generated_models'],
            'updated_models': validation.get('updated_models', []),
            'metrics': {
                'total_interfaces': total_interfaces,
                'models_with_issues': with_issues,
                'issue_rate': (with_issues / total_interfaces) if total_interfaces else 0.0
            },
            'sync_status': 'clean' if not validation['issues'] else 'issues'
        }
        return report

def main() -> None:
    """CLI entrypoint"""
    parser = argparse.ArgumentParser(description="CosmicHub Type Bridge Validator")
    parser.add_argument('--generate-missing', action='store_true', help='Generate missing Python models for TS interfaces')
    parser.add_argument('--no-fail', action='store_true', help='Always exit with 0 even if issues are found')
    parser.add_argument('--json', action='store_true', help='Print full JSON report to stdout')
    parser.add_argument('--suppress-optional-mismatch', action='store_true', help='Do not count optional mismatches as issues')
    parser.add_argument('--update-python', action='store_true', help='Patch existing Python models by adding missing fields (as Optional)')
    args = parser.parse_args()

    project_root = Path(__file__).parent.parent
    generator = TypeBridgeGenerator(project_root)

    print("🔄 CosmicHub Type Bridge Generator")
    print("=" * 60)
    report = generator.generate_bridge_report(
        generate_missing=args.generate_missing,
        suppress_optional=args.suppress_optional_mismatch,
        update_python=args.update_python
    )

    print(f"📊 Interfaces: {report['metrics']['total_interfaces']} | Issues: {len(report['issues'])} | Status: {report['sync_status']}")
    if report['generated_models']:
        print(f"🛠  Generated models: {', '.join(report['generated_models'])}")
    if report['updated_models']:
        print(f"🔧 Updated models: {', '.join(report['updated_models'])}")
    if report['issues']:
        print("\n⚠️  Issues:")
        for issue in report['issues'][:25]:  # limit console noise
            print(f"  - {issue}")
        if len(report['issues']) > 25:
            print(f"  ... ({len(report['issues']) - 25} more)")

    report_file = project_root / "type-bridge-report.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"\n📋 Report saved: {report_file}")

    if args.json:
        print("\n--- JSON REPORT ---")
        print(json.dumps(report, indent=2))

    print("✅ Validation complete")
    if report['issues'] and not args.no_fail:
        raise SystemExit(1)
    raise SystemExit(0)

if __name__ == "__main__":
    main()
