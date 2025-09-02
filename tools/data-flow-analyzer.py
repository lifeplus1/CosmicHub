#!/usr/bin/env python3
"""
CosmicHub Data Flow Analyzer
============================

A command-line tool to analyze and visualize data flows in the CosmicHub project.
This tool scans your project files and generates visual representations of:
- API endpoints and their connections
- Analytics event flows
- Database interactions
- Frontend-backend data flows
"""

import json
import os
import re
import argparse
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass, asdict
import subprocess

@dataclass
class DataFlow:
    source: str
    target: str
    flow_type: str
    data_type: str = ""
    frequency: str = ""

@dataclass 
class Component:
    name: str
    type: str  # 'frontend', 'backend', 'database', 'external'
    location: str
    endpoints: List[str] = None
    
    def __post_init__(self):
        if self.endpoints is None:
            self.endpoints = []

class DataFlowAnalyzer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.components: Dict[str, Component] = {}
        self.flows: List[DataFlow] = []
        
    def scan_project(self):
        """Scan the project to identify components and data flows"""
        print("🔍 Scanning CosmicHub project structure...")
        
        # Scan for components
        self._scan_frontend_apps()
        self._scan_backend_services()
        self._scan_databases()
        self._scan_external_services()
        
        # Analyze data flows
        self._analyze_api_flows()
        self._analyze_analytics_flows()
        self._analyze_database_flows()
        
        print(f"✅ Found {len(self.components)} components and {len(self.flows)} data flows")
    
    def _scan_frontend_apps(self):
        """Scan for frontend applications"""
        apps_dir = self.project_root / "apps"
        if apps_dir.exists():
            for app_dir in apps_dir.iterdir():
                if app_dir.is_dir() and app_dir.name != "mobile":
                    self.components[f"frontend-{app_dir.name}"] = Component(
                        name=f"{app_dir.name.title()} App",
                        type="frontend",
                        location=str(app_dir.relative_to(self.project_root))
                    )
        
        # Add mobile app
        mobile_dir = self.project_root / "apps" / "mobile"
        if mobile_dir.exists():
            self.components["frontend-mobile"] = Component(
                name="Mobile App",
                type="frontend", 
                location="apps/mobile"
            )
    
    def _scan_backend_services(self):
        """Scan for backend services"""
        backend_dir = self.project_root / "backend"
        if backend_dir.exists():
            self.components["backend-main"] = Component(
                name="Main API",
                type="backend",
                location="backend"
            )
            
            # Check for analytics service
            analytics_dir = backend_dir / "analytics"
            if analytics_dir.exists():
                self.components["backend-analytics"] = Component(
                    name="Analytics Service",
                    type="backend",
                    location="backend/analytics"
                )
        
        # Check for ephemeris server
        ephemeris_dir = self.project_root / "ephemeris_server"
        if ephemeris_dir.exists():
            self.components["backend-ephemeris"] = Component(
                name="Ephemeris Server",
                type="backend",
                location="ephemeris_server"
            )
    
    def _scan_databases(self):
        """Scan for database configurations"""
        # Check for Firebase config
        if (self.project_root / "firebase.json").exists():
            self.components["db-firebase"] = Component(
                name="Firebase",
                type="database",
                location="cloud"
            )
        
        # Check for SQLite databases
        for db_file in self.project_root.glob("*.db"):
            self.components[f"db-{db_file.stem}"] = Component(
                name=f"SQLite ({db_file.stem})",
                type="database",
                location=str(db_file.relative_to(self.project_root))
            )
    
    def _scan_external_services(self):
        """Scan for external service integrations"""
        # Look for analytics integrations
        config_files = list(self.project_root.glob("**/analytics.ts")) + \
                      list(self.project_root.glob("**/analytics.py"))
        
        external_services = set()
        for config_file in config_files:
            content = config_file.read_text()
            if 'google-analytics' in content or 'gtag' in content:
                external_services.add('Google Analytics')
            if 'mixpanel' in content.lower():
                external_services.add('Mixpanel')
            if 'posthog' in content.lower():
                external_services.add('PostHog')
        
        for service in external_services:
            self.components[f"external-{service.lower().replace(' ', '-')}"] = Component(
                name=service,
                type="external",
                location="cloud"
            )
    
    def _analyze_api_flows(self):
        """Analyze API endpoint flows between frontend and backend"""
        # Scan for API calls in frontend code
        frontend_dirs = [self.project_root / "apps" / "astro" / "src",
                        self.project_root / "apps" / "healwave" / "src"]
        
        api_patterns = [
            r'fetch\([\'"`]([^\'"`]+)[\'"`]',
            r'axios\.[get|post|put|delete]+\([\'"`]([^\'"`]+)[\'"`]',
            r'api\.[get|post|put|delete]+\([\'"`]([^\'"`]+)[\'"`]'
        ]
        
        for frontend_dir in frontend_dirs:
            if not frontend_dir.exists():
                continue
                
            app_name = frontend_dir.parent.name
            for ts_file in frontend_dir.rglob("*.ts"):
                if ts_file.is_file():
                    try:
                        content = ts_file.read_text()
                        for pattern in api_patterns:
                            matches = re.findall(pattern, content)
                            for match in matches:
                                if match.startswith('/api/') or match.startswith('http'):
                                    self.flows.append(DataFlow(
                                        source=f"frontend-{app_name}",
                                        target="backend-main",
                                        flow_type="api_call",
                                        data_type="HTTP request"
                                    ))
                    except Exception:
                        continue
    
    def _analyze_analytics_flows(self):
        """Analyze analytics event flows"""
        analytics_files = list(self.project_root.glob("**/analytics.ts")) + \
                         list(self.project_root.glob("**/analytics.py"))
        
        for analytics_file in analytics_files:
            try:
                content = analytics_file.read_text()
                
                # Check for tracking calls
                if 'track(' in content or 'trackEvent' in content:
                    source_type = "frontend" if "apps" in str(analytics_file) else "backend"
                    app_name = "astro" if "astro" in str(analytics_file) else "main"
                    
                    self.flows.append(DataFlow(
                        source=f"{source_type}-{app_name}",
                        target="backend-analytics",
                        flow_type="analytics_event",
                        data_type="user events"
                    ))
            except Exception:
                continue
    
    def _analyze_database_flows(self):
        """Analyze database interaction flows"""
        backend_files = list(self.project_root.glob("backend/**/*.py"))
        
        for py_file in backend_files:
            try:
                content = py_file.read_text()
                
                # Check for database operations
                if 'firebase' in content.lower():
                    self.flows.append(DataFlow(
                        source="backend-main",
                        target="db-firebase",
                        flow_type="database_operation",
                        data_type="user data"
                    ))
                
                if 'sqlite' in content.lower() or '.db' in content:
                    self.flows.append(DataFlow(
                        source="backend-main",
                        target="db-analytics",
                        flow_type="database_operation", 
                        data_type="analytics data"
                    ))
            except Exception:
                continue
    
    def generate_mermaid_diagram(self) -> str:
        """Generate a Mermaid diagram showing the data flows"""
        diagram = ["graph TD"]
        
        # Add nodes with styling
        for comp_id, comp in self.components.items():
            style_class = comp.type
            clean_name = comp.name.replace(" ", "_").replace("-", "_")
            diagram.append(f'    {comp_id}["{comp.name}"]:::{style_class}')
        
        # Add edges
        for flow in self.flows:
            if flow.source in self.components and flow.target in self.components:
                label = f"{flow.flow_type}: {flow.data_type}" if flow.data_type else flow.flow_type
                diagram.append(f'    {flow.source} -->|{label}| {flow.target}')
        
        # Add styling
        diagram.extend([
            "",
            "    classDef frontend fill:#45B7D1,stroke:#333,stroke-width:2px",
            "    classDef backend fill:#96CEB4,stroke:#333,stroke-width:2px", 
            "    classDef database fill:#FFEAA7,stroke:#333,stroke-width:2px",
            "    classDef external fill:#DDA0DD,stroke:#333,stroke-width:2px"
        ])
        
        return "\n".join(diagram)
    
    def generate_d3_data(self) -> Dict:
        """Generate D3.js compatible data structure"""
        nodes = []
        links = []
        
        # Create nodes
        for comp_id, comp in self.components.items():
            nodes.append({
                "id": comp_id,
                "name": comp.name,
                "type": comp.type,
                "location": comp.location
            })
        
        # Create links
        for flow in self.flows:
            if flow.source in self.components and flow.target in self.components:
                links.append({
                    "source": flow.source,
                    "target": flow.target,
                    "type": flow.flow_type,
                    "data_type": flow.data_type
                })
        
        return {"nodes": nodes, "links": links}
    
    def export_results(self, output_dir: str):
        """Export analysis results in multiple formats"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Export component list
        components_data = {comp_id: asdict(comp) for comp_id, comp in self.components.items()}
        with open(output_path / "components.json", "w") as f:
            json.dump(components_data, f, indent=2)
        
        # Export flows list
        flows_data = [asdict(flow) for flow in self.flows]
        with open(output_path / "flows.json", "w") as f:
            json.dump(flows_data, f, indent=2)
        
        # Export Mermaid diagram
        with open(output_path / "data-flow.mmd", "w") as f:
            f.write(self.generate_mermaid_diagram())
        
        # Export D3 data
        with open(output_path / "d3-data.json", "w") as f:
            json.dump(self.generate_d3_data(), f, indent=2)
        
        print(f"📊 Results exported to {output_path}/")
        print("   - components.json: List of all components")
        print("   - flows.json: List of all data flows") 
        print("   - data-flow.mmd: Mermaid diagram")
        print("   - d3-data.json: D3.js visualization data")
    
    def print_summary(self):
        """Print a summary of the analysis"""
        print("\n📋 CosmicHub Data Flow Analysis Summary")
        print("=" * 50)
        
        # Group components by type
        by_type = {}
        for comp in self.components.values():
            if comp.type not in by_type:
                by_type[comp.type] = []
            by_type[comp.type].append(comp.name)
        
        for comp_type, comps in by_type.items():
            print(f"\n{comp_type.title()} Components ({len(comps)}):")
            for comp in comps:
                print(f"  • {comp}")
        
        # Group flows by type
        flow_by_type = {}
        for flow in self.flows:
            if flow.flow_type not in flow_by_type:
                flow_by_type[flow.flow_type] = 0
            flow_by_type[flow.flow_type] += 1
        
        print(f"\nData Flows ({len(self.flows)} total):")
        for flow_type, count in flow_by_type.items():
            print(f"  • {flow_type}: {count}")

def main():
    parser = argparse.ArgumentParser(description="Analyze data flows in CosmicHub project")
    parser.add_argument("--project-root", "-p", default=".", 
                       help="Path to project root directory (default: current directory)")
    parser.add_argument("--output", "-o", default="./data-flow-analysis",
                       help="Output directory for analysis results")
    parser.add_argument("--format", "-f", choices=["all", "mermaid", "d3", "json"], 
                       default="all", help="Output format")
    parser.add_argument("--summary", "-s", action="store_true",
                       help="Print summary to console")
    
    args = parser.parse_args()
    
    # Initialize analyzer
    analyzer = DataFlowAnalyzer(args.project_root)
    
    # Scan project
    analyzer.scan_project()
    
    # Print summary if requested
    if args.summary:
        analyzer.print_summary()
    
    # Export results
    analyzer.export_results(args.output)
    
    print(f"\n🎉 Analysis complete!")
    print(f"📁 View results in: {args.output}")
    print(f"🌐 Open data-flow-visualization.html in browser for interactive view")

if __name__ == "__main__":
    main()
