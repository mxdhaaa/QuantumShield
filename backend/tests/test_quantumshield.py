"""Unit and Integration Tests for QuantumShield."""
import pytest
import os
from backend.app.scanner.ast_scanner import CryptoASTScanner
from backend.app.inventory.inventory_builder import InventoryBuilder
from backend.app.dependencies.graph_builder import DependencyGraphBuilder
from backend.app.risk.risk_engine import DeterministicRiskEngine
from backend.app.migration.migration_planner import MigrationIntelligenceEngine
from backend.app.simulator.simulator_engine import CryptoAgilitySimulator
from backend.app.copilot.copilot_engine import QuantumCopilot
from backend.app.models import QuantumStatus, PrimitiveType, CopilotQuery

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../demo_repo"))

def test_ast_scanner_finds_all_primitives():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    assert len(findings) > 0

    algos = [f.algorithm for f in findings]
    # Verify RSA, ECDSA, ECDH, AES, SHA, DSA, JWT are found
    assert any("RSA" in a for a in algos)
    assert any("ECDSA" in a or "SECP256R1" in a for a in algos)
    assert any("ECDH" in a for a in algos)
    assert any("AES" in a for a in algos)
    assert any("SHA-256" in a or "SHA-512" in a for a in algos)
    assert any("DSA" in a for a in algos)
    assert any("JWT" in a or "RS256" in a for a in algos)

def test_quantum_classification_correctness():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    for f in findings:
        if "RSA" in f.algorithm or "ECDSA" in f.algorithm or "ECDH" in f.algorithm or "DSA" in f.algorithm or "RS256" in f.algorithm:
            assert f.quantum_status == QuantumStatus.VULNERABLE
        elif "AES-256" in f.algorithm or "SHA-256" in f.algorithm or "SHA-512" in f.algorithm:
            assert f.quantum_status == QuantumStatus.CONDITIONALLY_SAFE
        elif "MD5" in f.algorithm:
            assert f.quantum_status == QuantumStatus.LEGACY_BROKEN

def test_dependency_blast_radius():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    assert len(dep_graph.nodes) > len(findings)
    assert len(dep_graph.edges) > 0
    assert len(dep_graph.blast_radii) == len(findings)

    # Check that RSA auth finding has web and mobile dependents
    rsa_finding = next(f for f in findings if "RSA" in f.algorithm or "RS256" in f.algorithm)
    br = dep_graph.blast_radii[rsa_finding.id]
    assert br.total_affected_components > 0

def test_deterministic_risk_engine():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    risk_assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)

    assert len(risk_assessments) == len(findings)
    
    # ECDH should have high Mosca HNDL risk
    ecdh_finding = next(f for f in findings if "ECDH" in f.algorithm)
    ecdh_risk = risk_assessments[ecdh_finding.id]
    assert ecdh_risk.mosca_harvest_now_decrypt_later is True
    assert ecdh_risk.overall_score >= 70.0

def test_migration_planner_strict_primitive_separation():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    plans = MigrationIntelligenceEngine.generate_all_plans(findings)

    for f in findings:
        plan = plans[f.id]
        if f.primitive == PrimitiveType.SIGNATURE:
            # Must recommend ML-DSA (FIPS 204) or SLH-DSA (FIPS 205), NEVER ML-KEM
            assert "ML-DSA" in plan.migration_candidate.target_standard or "SLH-DSA" in plan.migration_candidate.target_standard
            assert "ML-KEM" not in plan.migration_candidate.target_standard
        elif f.primitive == PrimitiveType.KEY_ESTABLISHMENT:
            # Must recommend ML-KEM (FIPS 203)
            assert "ML-KEM" in plan.migration_candidate.target_standard

def test_simulator_and_validation():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    sim_report = CryptoAgilitySimulator.simulate_migration(findings, migration_mode="hybrid")
    assert sim_report.vulnerabilities_mitigated > 0
    assert sim_report.agility_readiness_score == 100.0

    val = CryptoAgilitySimulator.generate_validation_comparison(findings, sim_report)
    assert val.after_quantum_vulnerable_count == 0
    assert val.risk_reduction_percentage == 100.0
    assert val.compliance_status["NIST_FIPS_203_ML_KEM"] is True

def test_copilot_grounded_qa():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    risk_assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)
    plans = MigrationIntelligenceEngine.generate_all_plans(findings)

    # Ask Copilot why ML-KEM can't replace ECDSA
    ans = QuantumCopilot.answer(
        CopilotQuery(question="Why can't ML-KEM replace ECDSA?"),
        findings, risk_assessments, dep_graph, plans
    )
    assert "FIPS 203" in ans.answer
    assert "FIPS 204" in ans.answer
    assert "Key Encapsulation" in ans.answer

def test_api_integration():
    from fastapi.testclient import TestClient
    from backend.main import app

    client = TestClient(app)
    
    # Test scan
    res = client.post("/api/scan", json={})
    assert res.status_code == 200
    data = res.json()
    assert "findings" in data
    assert len(data["findings"]) > 0

    # Test inventory
    res = client.get("/api/inventory")
    assert res.status_code == 200
    assert "total_cryptographic_assets" in res.json()

    # Test dependencies
    res = client.get("/api/dependencies")
    assert res.status_code == 200
    assert "nodes" in res.json()
    assert "edges" in res.json()

    # Test risk
    res = client.get("/api/risk")
    assert res.status_code == 200

    # Test simulate
    res = client.post("/api/simulate", json={"migration_mode": "hybrid"})
    assert res.status_code == 200
    assert res.json()["agility_readiness_score"] > 0

    # Test validate
    res = client.post("/api/validate")
    assert res.status_code == 200
    assert res.json()["risk_reduction_percentage"] > 0

    # Test copilot
    res = client.post("/api/copilot", json={"question": "What should we migrate first?"})
    assert res.status_code == 200
    assert "ML-KEM" in res.json()["answer"] or "PQC" in res.json()["answer"]

    # Test export
    res = client.get("/api/export")
    assert res.status_code == 200

    # Test SPA root
    res = client.get("/")
    assert res.status_code == 200

