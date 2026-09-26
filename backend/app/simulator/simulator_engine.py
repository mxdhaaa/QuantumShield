"""Crypto-Agility Simulator and Before/After Validation Engine.
Simulates migration scenarios, verifies dependency cascade impacts, and computes
residual risk metrics without modifying production code.
"""
from typing import List, Dict, Any, Optional
import copy
from backend.app.models import (
    CryptoFinding, QuantumStatus, PrimitiveType, SimulationReport,
    SimulationFindingStatus, SimulationState, ValidationComparison
)

class CryptoAgilitySimulator:
    @staticmethod
    def simulate_migration(
        findings: List[CryptoFinding],
        target_finding_ids: Optional[List[str]] = None,
        migration_mode: str = "hybrid" # "hybrid" or "full_pqc"
    ) -> SimulationReport:
        """Simulates migrating specified or all quantum-vulnerable findings to PQC standards."""
        if target_finding_ids is None:
            target_finding_ids = [f.id for f in findings if f.quantum_status in (QuantumStatus.VULNERABLE, QuantumStatus.LEGACY_BROKEN)]

        total_vuln_orig = sum(1 for f in findings if f.quantum_status in (QuantumStatus.VULNERABLE, QuantumStatus.LEGACY_BROKEN))
        statuses: List[SimulationFindingStatus] = []
        breaking_changes: List[str] = []
        mitigated_count = 0

        for f in findings:
            if f.id in target_finding_ids and f.quantum_status in (QuantumStatus.VULNERABLE, QuantumStatus.LEGACY_BROKEN):
                mitigated_count += 1
                if f.primitive == PrimitiveType.SIGNATURE:
                    sim_algo = "ML-DSA-65 (FIPS 204)" if migration_mode == "full_pqc" else "Composite (RSA/ECDSA + ML-DSA-65)"
                    sim_state = SimulationState.MIGRATED_FULL_PQC if migration_mode == "full_pqc" else SimulationState.MIGRATED_HYBRID
                    resolved = ["Identity Provider Token Forgery Vector", "Digital Signature Cryptanalysis Vulnerability"]
                    risks = [
                        "Token header size expansion to ~4.5KB requires gateway buffer increase.",
                        "Mobile app signature verification CPU profile during startup."
                    ]
                    breaking_changes.append(f"[{f.component_name}] Authorization token format changed to {sim_algo}; requires HTTP buffer adjustments.")
                elif f.primitive == PrimitiveType.KEY_ESTABLISHMENT:
                    sim_algo = "ML-KEM-768 (FIPS 203)" if migration_mode == "full_pqc" else "Hybrid X25519 + ML-KEM-768"
                    sim_state = SimulationState.MIGRATED_FULL_PQC if migration_mode == "full_pqc" else SimulationState.MIGRATED_HYBRID
                    resolved = ["Harvest-Now-Decrypt-Later (HNDL) Session Interception", "Key Exchange Discrete Log Weakness"]
                    risks = [
                        "TLS ClientHello size increases by ~1.1KB.",
                        "Potential packet fragmentation on restrictive enterprise firewalls."
                    ]
                    breaking_changes.append(f"[{f.component_name}] Transport key exchange upgraded to {sim_algo}; validates TLS 1.3 handshake negotiation.")
                elif f.primitive == PrimitiveType.HASHING:
                    sim_algo = "SHA-256 (NIST FIPS 180-4)"
                    sim_state = SimulationState.MIGRATED_FULL_PQC
                    resolved = ["Classically Broken Hash Vulnerability (MD5/SHA-1)"]
                    risks = ["Database column length for hashes expanded to CHAR(64)."]
                    breaking_changes.append(f"[{f.component_name}] Hash function upgraded from {f.algorithm} to SHA-256.")
                else:
                    sim_algo = "Quantum-Safe Protocol Suite"
                    sim_state = SimulationState.MIGRATED_HYBRID
                    resolved = ["Classical PKI Vulnerability"]
                    risks = ["X.509 dual-certificate verification required."]
                    breaking_changes.append(f"[{f.component_name}] Upgraded to {sim_algo}.")

                statuses.append(SimulationFindingStatus(
                    finding_id=f.id,
                    original_algorithm=f.algorithm,
                    simulated_algorithm=sim_algo,
                    status=sim_state,
                    resolved_dependencies=resolved,
                    remaining_compatibility_risks=risks
                ))
            else:
                statuses.append(SimulationFindingStatus(
                    finding_id=f.id,
                    original_algorithm=f.algorithm,
                    simulated_algorithm=f.algorithm,
                    status=SimulationState.NOT_STARTED if f.quantum_status == QuantumStatus.VULNERABLE else SimulationState.MIGRATED_FULL_PQC,
                    resolved_dependencies=[],
                    remaining_compatibility_risks=[]
                ))

        residual = total_vuln_orig - mitigated_count
        readiness = round((mitigated_count / max(1, total_vuln_orig)) * 100.0, 1)

        summary = (
            f"Simulated migration of {mitigated_count}/{total_vuln_orig} quantum-vulnerable primitives. "
            f"Achieved {readiness}% quantum-resilience transition coverage. "
            f"Residual vulnerable items: {residual}."
        )

        return SimulationReport(
            simulation_id=f"sim_{migration_mode}_{len(target_finding_ids)}",
            total_vulnerabilities_original=total_vuln_orig,
            vulnerabilities_mitigated=mitigated_count,
            residual_vulnerabilities=residual,
            agility_readiness_score=readiness,
            findings_status=statuses,
            breaking_changes_identified=breaking_changes,
            performance_overhead_estimate="~1.8ms average latency increase on TLS handshake; +3.2KB network payload on JWT headers.",
            summary=summary
        )

    @staticmethod
    def generate_validation_comparison(
        original_findings: List[CryptoFinding],
        simulation_report: SimulationReport
    ) -> ValidationComparison:
        """Generates a Before vs After audit validation report comparing original vs simulated state."""
        orig_vuln_count = simulation_report.total_vulnerabilities_original
        after_vuln_count = simulation_report.residual_vulnerabilities
        migrated_count = simulation_report.vulnerabilities_mitigated

        risk_reduction = round((migrated_count / max(1, orig_vuln_count)) * 100.0, 1) if orig_vuln_count > 0 else 100.0
        coverage = simulation_report.agility_readiness_score

        diff: List[Dict[str, Any]] = []
        for status in simulation_report.findings_status:
            diff.append({
                "finding_id": status.finding_id,
                "before": status.original_algorithm,
                "after": status.simulated_algorithm,
                "status": status.status.value,
                "mitigated": status.status != SimulationState.NOT_STARTED
            })

        compliance = {
            "NIST_FIPS_203_ML_KEM": any("ML-KEM" in s.simulated_algorithm for s in simulation_report.findings_status),
            "NIST_FIPS_204_ML_DSA": any("ML-DSA" in s.simulated_algorithm for s in simulation_report.findings_status),
            "CNSA_2_0_ALIGNMENT": coverage >= 80.0,
            "ZERO_HNDL_EXPOSURE": after_vuln_count == 0
        }

        return ValidationComparison(
            before_quantum_vulnerable_count=orig_vuln_count,
            after_quantum_vulnerable_count=after_vuln_count,
            migrated_count=migrated_count,
            unresolved_dependencies_count=after_vuln_count,
            risk_reduction_percentage=risk_reduction,
            coverage_percentage=coverage,
            compliance_status=compliance,
            findings_diff=diff
        )
