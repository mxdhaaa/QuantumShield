"""Deterministic & Explainable Quantum Risk Engine.
Calculates transparent risk scores based on NIST PQC standards, Mosca's theorem,
exposure vectors, blast radius, and migration complexity.
"""
from typing import List, Dict
from backend.app.models import (
    CryptoFinding, RiskAssessment, RiskFactor, RiskLevel, QuantumStatus, PrimitiveType, BlastRadius
)

class DeterministicRiskEngine:
    @staticmethod
    def assess_risk(finding: CryptoFinding, blast_radius: BlastRadius) -> RiskAssessment:
        factors: List[RiskFactor] = []

        # 1. Cryptographic Quantum Vulnerability (Weight: 0.30)
        algo_upper = finding.algorithm.upper()
        if finding.quantum_status == QuantumStatus.VULNERABLE:
            q_score = 10.0
            q_desc = f"{finding.algorithm} is fully vulnerable to polynomial-time cryptanalysis by Shor's algorithm on a Cryptographically Relevant Quantum Computer (CRQC)."
            q_evid = f"Shor's Algorithm breaks integer factorization (RSA) and discrete logs (ECDSA/ECDH/DH) in O((log N)^3)."
        elif finding.quantum_status == QuantumStatus.LEGACY_BROKEN:
            q_score = 9.5
            q_desc = f"{finding.algorithm} is classically broken and must be phased out irrespective of quantum computing."
            q_evid = "Collision and preimage vulnerabilities known in classical literature."
        elif finding.quantum_status == QuantumStatus.CONDITIONALLY_SAFE:
            if "AES-128" in algo_upper:
                q_score = 5.5
                q_desc = "AES-128 effective key security is reduced to 64 bits by Grover's search algorithm, presenting marginal safety."
                q_evid = "Grover's algorithm provides quadratic speedup: effective security = n/2."
            else:
                q_score = 1.5
                q_desc = f"{finding.algorithm} maintains strong quantum resistance (128+ bit post-quantum security margin under Grover/BHT)."
                q_evid = "Symmetric 256-bit keys and SHA-256/384/512 retain sufficient quantum security margin."
        else:
            q_score = 0.5
            q_desc = f"{finding.algorithm} is a verified Quantum-Safe primitive (NIST FIPS 203/204/205 standard)."
            q_evid = "Lattice-based or stateless hash-based cryptography with no known quantum polynomial speedup."

        factors.append(RiskFactor(
            factor_name="Quantum Cryptographic Vulnerability",
            score=q_score,
            weight=0.30,
            description=q_desc,
            evidence=q_evid
        ))

        # 2. Mosca's Theorem & Harvest-Now-Decrypt-Later (HNDL) Exposure (Weight: 0.25)
        is_key_exchange = finding.primitive == PrimitiveType.KEY_ESTABLISHMENT or "tls" in finding.usage.lower() or "channel" in finding.usage.lower() or "ecdh" in algo_upper
        is_data_at_rest = finding.primitive == PrimitiveType.SYMMETRIC_ENCRYPTION or "vault" in finding.usage.lower()
        is_signature_auth = finding.primitive == PrimitiveType.SIGNATURE and ("jwt" in finding.usage.lower() or "auth" in finding.usage.lower())
        
        if is_key_exchange:
            hndl_score = 9.5
            hndl_desc = "Critical HNDL Exposure: Key establishment sessions can be intercepted and archived today by adversaries for retroactive decryption once a CRQC exists."
            hndl_evid = "Mosca's Theorem: Data Shelf Life (X > 10 yrs) + Migration Time (Y = 3 yrs) > Quantum Threat Timeline (Z = 5-10 yrs)."
            mosca_hndl = True
        elif is_data_at_rest:
            hndl_score = 4.0
            hndl_desc = "Moderate HNDL: Encrypted database records could be exfiltrated and stored, though symmetric cipher strength mitigates threat."
            hndl_evid = "Data longevity is long, but 256-bit symmetric cipher remains quantum-resistant."
            mosca_hndl = False
        elif is_signature_auth:
            hndl_score = 6.0
            hndl_desc = "Immediate Forgery Risk upon CRQC arrival: Attackers cannot retroactively decrypt past tokens, but can forge new tokens in real-time."
            hndl_evid = "Token lifetime is short (ephemeral), but private key compromise allows total identity spoofing."
            mosca_hndl = False
        else:
            hndl_score = 3.0
            hndl_desc = "Low HNDL Exposure: Operation has localized temporal relevance."
            hndl_evid = "Short data lifecycle and no long-term confidentiality payload."
            mosca_hndl = False

        factors.append(RiskFactor(
            factor_name="Mosca HNDL & Data Longevity Risk",
            score=hndl_score,
            weight=0.25,
            description=hndl_desc,
            evidence=hndl_evid
        ))

        # 3. Asset Exposure & Attack Surface (Weight: 0.20)
        if "auth" in finding.usage.lower() or "payment" in finding.usage.lower() or "tls" in finding.usage.lower():
            exposure_score = 9.0
            exp_desc = "High External Exposure: Cryptographic asset sits directly on network boundary, ingress gateway, or financial API."
            exp_evid = f"Asset located in {finding.file}:{finding.line} ({finding.component_name})."
        elif "vault" in finding.usage.lower() or "db" in finding.usage.lower():
            exposure_score = 6.5
            exp_desc = "Medium-High Exposure: Core persistent storage layer containing sensitive enterprise data."
            exp_evid = f"Internal persistence layer in {finding.file}."
        else:
            exposure_score = 4.0
            exp_desc = "Internal Exposure: Module operates within internal service mesh boundary."
            exp_evid = f"Internal service component {finding.component_name}."

        factors.append(RiskFactor(
            factor_name="Attack Surface & Gateway Exposure",
            score=exposure_score,
            weight=0.20,
            description=exp_desc,
            evidence=exp_evid
        ))

        # 4. Dependency Concentration & Blast Radius (Weight: 0.15)
        dep_count = blast_radius.total_affected_components
        blast_score = min(10.0, max(2.0, dep_count * 1.8))
        factors.append(RiskFactor(
            factor_name="Dependency Concentration & Blast Radius",
            score=blast_score,
            weight=0.15,
            description=f"Compromise impacts {dep_count} direct and indirect upstream/downstream components.",
            evidence=f"Direct: {', '.join(blast_radius.direct_dependents[:2])}; Flow: {blast_radius.data_flow_exposure}"
        ))

        # 5. Migration Complexity & Protocol Coupling (Weight: 0.10)
        if "jwt" in algo_upper or "jwt" in finding.usage.lower() or "tls" in finding.usage.lower() or "partner" in finding.usage.lower():
            comp_score = 8.5
            comp_desc = "High Migration Complexity: Involves distributed client ecosystem, token format updates, or public key infrastructure (PKI)."
            comp_evid = "Requires coordinated multi-system migration and backwards compatibility."
        elif finding.primitive == PrimitiveType.SIGNATURE:
            comp_score = 7.0
            comp_desc = "Moderate Complexity: Signature size expansion (ML-DSA vs RSA/ECDSA) requires payload buffer & database schema adjustments."
            comp_evid = "ML-DSA-65 public key: 1,952 bytes; signature: 3,309 bytes."
        else:
            comp_score = 4.0
            comp_desc = "Standard Complexity: Localized cryptographic primitive swap."
            comp_evid = "Module-contained cryptographic provider replacement."

        factors.append(RiskFactor(
            factor_name="Migration Complexity & Protocol Coupling",
            score=comp_score,
            weight=0.10,
            description=comp_desc,
            evidence=comp_evid
        ))

        # Calculate weighted overall score (0 to 100)
        raw_weighted = sum(f.score * f.weight for f in factors)
        overall_score = round(raw_weighted * 10.0, 1)

        if overall_score >= 75.0:
            level = RiskLevel.CRITICAL
        elif overall_score >= 55.0:
            level = RiskLevel.HIGH
        elif overall_score >= 35.0:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        explanation = (
            f"Overall Quantum Exposure is {level.value} ({overall_score}/100). "
            f"{'CRITICAL: Subject to Harvest-Now-Decrypt-Later (HNDL) attacks. ' if mosca_hndl else ''}"
            f"Key drivers: {factors[0].factor_name} ({factors[0].score}/10) and {factors[1].factor_name} ({factors[1].score}/10)."
        )

        return RiskAssessment(
            finding_id=finding.id,
            overall_score=overall_score,
            level=level,
            mosca_harvest_now_decrypt_later=mosca_hndl,
            factors=factors,
            explanation=explanation
        )

    @staticmethod
    def assess_all(findings: List[CryptoFinding], blast_radii: Dict[str, BlastRadius]) -> Dict[str, RiskAssessment]:
        assessments: Dict[str, RiskAssessment] = {}
        for f in findings:
            br = blast_radii.get(f.id, BlastRadius(
                finding_id=f.id,
                algorithm=f.algorithm,
                direct_dependents=[],
                indirect_dependents=[],
                total_affected_components=1,
                data_flow_exposure="Local",
                criticality_summary="Contained"
            ))
            assessments[f.id] = DeterministicRiskEngine.assess_risk(f, br)
        return assessments
