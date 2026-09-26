"""FastAPI REST API Routes for QuantumShield."""
import os
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.app.models import (
    ScanResult, CryptoFinding, DependencyGraph, RiskAssessment,
    FindingMigrationPlan, SimulationReport, ValidationComparison,
    CopilotQuery, CopilotAnswer, QuantumStatus
)
from backend.app.scanner.ast_scanner import CryptoASTScanner
from backend.app.inventory.inventory_builder import InventoryBuilder
from backend.app.dependencies.graph_builder import DependencyGraphBuilder
from backend.app.risk.risk_engine import DeterministicRiskEngine
from backend.app.migration.migration_planner import MigrationIntelligenceEngine
from backend.app.simulator.simulator_engine import CryptoAgilitySimulator
from backend.app.copilot.copilot_engine import QuantumCopilot

router = APIRouter(prefix="/api")

# In-Memory State Cache
CURRENT_SCAN: Optional[ScanResult] = None
LATEST_SIMULATION: Optional[SimulationReport] = None

class ScanRequest(BaseModel):
    repo_path: Optional[str] = None

class SimulationRequest(BaseModel):
    finding_ids: Optional[List[str]] = None
    migration_mode: str = "hybrid" # "hybrid" or "full_pqc"

@router.post("/scan", response_model=ScanResult)
def execute_scan(req: ScanRequest):
    global CURRENT_SCAN
    target_path = req.repo_path
    if not target_path or not os.path.exists(target_path):
        # Default to backend/demo_repo
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../demo_repo"))
        target_path = base_dir

    findings = CryptoASTScanner.scan_directory(target_path)
    if not findings:
        # Fallback if empty
        findings = []

    dep_graph = DependencyGraphBuilder.build_graph(findings)
    risk_assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)
    migration_plans = MigrationIntelligenceEngine.generate_all_plans(findings)
    inventory = InventoryBuilder.build_inventory(findings)

    scan_id = f"scan_{uuid.uuid4().hex[:8]}"
    
    # Compute summary stats
    vuln_count = sum(1 for f in findings if f.quantum_status in (QuantumStatus.VULNERABLE, QuantumStatus.LEGACY_BROKEN))
    crit_count = sum(1 for ra in risk_assessments.values() if ra.level.value == "CRITICAL")
    hndl_count = sum(1 for ra in risk_assessments.values() if ra.mosca_harvest_now_decrypt_later)

    summary = {
        "total_assets": len(findings),
        "quantum_vulnerable": vuln_count,
        "critical_risk_findings": crit_count,
        "hndl_active_threats": hndl_count,
        "conditionally_safe": sum(1 for f in findings if f.quantum_status == QuantumStatus.CONDITIONALLY_SAFE),
        "quantum_safe": sum(1 for f in findings if f.quantum_status == QuantumStatus.SAFE),
        "dependency_nodes": len(dep_graph.nodes),
        "dependency_edges": len(dep_graph.edges),
        "crypto_agility_index": round(((len(findings) - vuln_count) / max(1, len(findings))) * 100.0, 1)
    }

    CURRENT_SCAN = ScanResult(
        scan_id=scan_id,
        repo_path=target_path,
        scanned_files_count=len(set(f.file for f in findings)),
        findings=findings,
        risk_assessments=risk_assessments,
        dependency_graph=dep_graph,
        migration_plans=migration_plans,
        summary_stats=summary
    )

    return CURRENT_SCAN

@router.get("/scan/current", response_model=ScanResult)
def get_current_scan():
    global CURRENT_SCAN
    if not CURRENT_SCAN:
        # Auto-run scan on seeded demo repo
        return execute_scan(ScanRequest())
    return CURRENT_SCAN

@router.get("/inventory")
def get_inventory():
    global CURRENT_SCAN
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())
    return InventoryBuilder.build_inventory(CURRENT_SCAN.findings)

@router.get("/dependencies", response_model=DependencyGraph)
def get_dependencies():
    global CURRENT_SCAN
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())
    return CURRENT_SCAN.dependency_graph

@router.get("/risk")
def get_risk():
    global CURRENT_SCAN
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())
    return CURRENT_SCAN.risk_assessments

@router.get("/migration-plans")
def get_migration_plans():
    global CURRENT_SCAN
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())
    return CURRENT_SCAN.migration_plans

@router.post("/simulate", response_model=SimulationReport)
def run_simulation(req: SimulationRequest):
    global CURRENT_SCAN, LATEST_SIMULATION
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())
    
    sim_report = CryptoAgilitySimulator.simulate_migration(
        findings=CURRENT_SCAN.findings,
        target_finding_ids=req.finding_ids,
        migration_mode=req.migration_mode
    )
    LATEST_SIMULATION = sim_report
    return sim_report

@router.post("/validate", response_model=ValidationComparison)
def run_validation():
    global CURRENT_SCAN, LATEST_SIMULATION
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())
    if not LATEST_SIMULATION:
        LATEST_SIMULATION = CryptoAgilitySimulator.simulate_migration(CURRENT_SCAN.findings, migration_mode="hybrid")

    return CryptoAgilitySimulator.generate_validation_comparison(
        original_findings=CURRENT_SCAN.findings,
        simulation_report=LATEST_SIMULATION
    )

@router.post("/copilot", response_model=CopilotAnswer)
def ask_copilot(query: CopilotQuery):
    global CURRENT_SCAN
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())

    return QuantumCopilot.answer(
        query=query,
        findings=CURRENT_SCAN.findings,
        risk_assessments=CURRENT_SCAN.risk_assessments,
        dependency_graph=CURRENT_SCAN.dependency_graph,
        migration_plans=CURRENT_SCAN.migration_plans
    )

@router.get("/export")
def export_data():
    global CURRENT_SCAN
    if not CURRENT_SCAN:
        CURRENT_SCAN = execute_scan(ScanRequest())
    return CURRENT_SCAN.model_dump()
