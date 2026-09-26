"""Unit and Integration Tests for QuantumShield Risk Management & Architecture."""
import pytest
import os
from backend.app.scanner.ast_scanner import CryptoASTScanner
from backend.app.inventory.inventory_builder import InventoryBuilder
from backend.app.dependencies.graph_builder import DependencyGraphBuilder
from backend.app.risk.risk_engine import DeterministicRiskEngine
from backend.app.migration.migration_planner import MigrationIntelligenceEngine
from backend.app.simulator.simulator_engine import CryptoAgilitySimulator
from backend.app.copilot.copilot_engine import QuantumCopilot
from backend.app.models import QuantumStatus, PrimitiveType, RiskLevel, BlastRadius, CryptoFinding, CopilotQuery

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../demo_repo"))

def test_ast_scanner_finds_all_primitives():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    assert len(findings) > 0

    algos = [f.algorithm for f in findings]
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

def test_deterministic_scoring_consistency():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    
    # Run twice on same findings and verify bitwise identical output
    run1 = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)
    run2 = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)

    assert len(run1) == len(run2)
    for k in run1:
        assert run1[k].overall_score == run2[k].overall_score
        assert run1[k].level == run2[k].level
        assert run1[k].engineering_prioritization_score == run2[k].engineering_prioritization_score
        assert len(run1[k].factors) == 7

def test_seven_factors_and_weights_sum():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)

    for a in assessments.values():
        assert len(a.factors) == 7
        total_weight = sum(f.weight for f in a.factors)
        assert abs(total_weight - 1.0) < 1e-6
        # Factor scores must be 0 to 10
        for f in a.factors:
            assert 0.0 <= f.score <= 10.0

def test_risk_level_boundaries():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)

    for a in assessments.values():
        if a.overall_score >= 80.0:
            assert a.level == RiskLevel.CRITICAL
        elif a.overall_score >= 60.0:
            assert a.level == RiskLevel.HIGH
        elif a.overall_score >= 30.0:
            assert a.level == RiskLevel.MEDIUM
        else:
            assert a.level == RiskLevel.LOW

def test_rsa_vs_aes_classification():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)

    rsa_finding = next(f for f in findings if "RSA" in f.algorithm or "RS256" in f.algorithm)
    aes_finding = next(f for f in findings if "AES-256" in f.algorithm)

    rsa_risk = assessments[rsa_finding.id]
    aes_risk = assessments[aes_finding.id]

    # RSA-2048 should have High or Critical risk
    assert rsa_risk.overall_score >= 60.0
    assert rsa_risk.level in (RiskLevel.HIGH, RiskLevel.CRITICAL)

    # AES-256 should have Low risk
    assert aes_risk.overall_score <= 29.0
    assert aes_risk.level == RiskLevel.LOW

def test_hndl_and_data_lifetime_impact():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)

    ecdh_finding = next(f for f in findings if "ECDH" in f.algorithm)
    ecdh_risk = assessments[ecdh_finding.id]

    assert ecdh_risk.mosca_harvest_now_decrypt_later is True
    assert ecdh_risk.overall_score >= 70.0
    
    # HNDL factor score should be 10.0
    hndl_factor = next(f for f in ecdh_risk.factors if "HNDL" in f.factor_name)
    assert hndl_factor.score == 10.0

def test_dependency_blast_radius_impact():
    f_dummy = CryptoFinding(
        id="test:1:rsa",
        file="test.py",
        line=1,
        algorithm="RSA",
        primitive=PrimitiveType.SIGNATURE,
        usage="Authentication",
        library="rsa",
        evidence="rsa()",
        confidence=1.0,
        quantum_status=QuantumStatus.VULNERABLE,
        component_name="Auth"
    )

    br_low = BlastRadius(
        finding_id="test:1:rsa",
        algorithm="RSA",
        direct_dependents=["Local Caller"],
        indirect_dependents=[],
        total_affected_components=1,
        data_flow_exposure="Internal",
        criticality_summary="Contained"
    )

    br_high = BlastRadius(
        finding_id="test:1:rsa",
        algorithm="RSA",
        direct_dependents=["Web Portal", "Mobile Client", "Partner API"],
        indirect_dependents=["Microservice A", "Microservice B", "Audit Log", "Database"],
        total_affected_components=7,
        data_flow_exposure="Ingress Internet",
        criticality_summary="Critical Enterprise Blast Radius"
    )

    risk_low = DeterministicRiskEngine.assess_risk(f_dummy, br_low)
    risk_high = DeterministicRiskEngine.assess_risk(f_dummy, br_high)

    assert risk_high.overall_score > risk_low.overall_score
    assert risk_high.engineering_prioritization_score > risk_low.engineering_prioritization_score

def test_engineering_prioritization_score():
    findings = CryptoASTScanner.scan_directory(DEMO_DIR)
    dep_graph = DependencyGraphBuilder.build_graph(findings)
    assessments = DeterministicRiskEngine.assess_all(findings, dep_graph.blast_radii)

    for a in assessments.values():
        assert 0.0 <= a.engineering_prioritization_score <= 100.0

def test_api_risk_response_structure():
    from fastapi.testclient import TestClient
    from backend.main import app

    client = TestClient(app)
    res = client.get("/api/risk")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0

    first_key = list(data.keys())[0]
    item = data[first_key]
    assert "overall_score" in item
    assert "level" in item
    assert "engineering_prioritization_score" in item
    assert "factors" in item
    assert len(item["factors"]) == 7
    assert "affected_component" in item
    assert "blast_radius_summary" in item
    assert "recommended_action" in item
    assert "explanation" in item
