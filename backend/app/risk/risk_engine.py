"""Deterministic, Explainable & Technically Defensible Quantum Risk Engine.
Calculates transparent risk scores based on 7 explicit factors, NIST PQC standards,
Mosca's theorem (HNDL), dependency blast radius, and migration complexity.
"""
from typing import List, Dict
from backend.app.models import (
    CryptoFinding, RiskAssessment, RiskFactor, RiskLevel, QuantumStatus, PrimitiveType, BlastRadius
)

class DeterministicRiskEngine:
    """Computes transparent, explainable 0–100 risk assessments for cryptographic findings."""

    @staticmethod
    def assess_risk(finding: CryptoFinding, blast_radius: BlastRadius) -> RiskAssessment:
        factors: List[RiskFactor] = []
        algo_upper = finding.algorithm.upper()
        usage_lower = finding.usage.lower()
        file_lower = finding.file.lower()

        # Context indicators
        is_vault = "vault" in usage_lower or "storage" in usage_lower or "aes" in algo_upper or "data-at-rest" in usage_lower
        is_payment = "payment" in usage_lower or "transaction" in usage_lower or "payment_gateway" in file_lower
        is_tls = "tls" in usage_lower or "channel" in usage_lower or "ecdh" in algo_upper or "dh" in algo_upper
        is_auth = not is_vault and ("authentication" in usage_lower or "identity" in usage_lower or "jwt" in algo_upper or "auth_service" in file_lower or "rsa" in algo_upper)

        # -------------------------------------------------------------------------
        # FACTOR 1: Quantum Cryptographic Vulnerability (Weight: 0.25)
        # -------------------------------------------------------------------------
        if finding.quantum_status == QuantumStatus.VULNERABLE:
            q_score = 10.0
            q_desc = f"{finding.algorithm} is fully vulnerable to polynomial-time Shor's algorithm on a Cryptographically Relevant Quantum Computer (CRQC)."
            q_evid = "Shor's Algorithm breaks Integer Factorization (RSA) and Discrete Logarithms (ECDSA/ECDH/DH) in O((log N)^3)."
        elif finding.quantum_status == QuantumStatus.LEGACY_BROKEN:
            q_score = 9.0
            q_desc = f"{finding.algorithm} is classically broken with practical collision/preimage attacks and must be replaced."
            q_evid = "Known classical collision vulnerabilities in MD5 / SHA-1."
        elif finding.quantum_status == QuantumStatus.CONDITIONALLY_SAFE:
            if "AES-128" in algo_upper:
                q_score = 4.5
                q_desc = "AES-128 effective security is reduced to 64 bits by Grover's search algorithm, presenting marginal safety."
                q_evid = "Grover's algorithm gives quadratic speedup (effective security = n/2)."
            else:
                q_score = 0.5
                q_desc = f"{finding.algorithm} maintains strong quantum resistance (128+ bit post-quantum security margin under Grover/BHT)."
                q_evid = "256-bit symmetric keys and SHA-256/384/512 retain robust quantum collision/search resistance."
        else: # SAFE
            q_score = 0.0
            q_desc = f"{finding.algorithm} is a verified Post-Quantum Cryptography primitive (NIST FIPS 203/204/205)."
            q_evid = "Lattice-based or stateless hash-based standard with no known quantum polynomial speedup."

        factors.append(RiskFactor(
            factor_name="Quantum Cryptographic Vulnerability",
            score=q_score,
            weight=0.25,
            description=q_desc,
            evidence=q_evid
        ))

        # -------------------------------------------------------------------------
        # FACTOR 2: Asset & Business Criticality (Weight: 0.15)
        # -------------------------------------------------------------------------
        if is_auth or is_payment:
            crit_score = 9.5
            crit_desc = f"Mission-critical tier: Compromise directly undermines enterprise identity, session tokens, or financial authorization."
            crit_evid = f"Component '{finding.component_name}' in {finding.file}:{finding.line} governs authentication/authorization."
        elif is_tls:
            crit_score = 8.5
            crit_desc = f"High infrastructure criticality: Governs secure channel transport."
            crit_evid = f"Transport layer in {finding.file}."
        elif is_vault:
            crit_score = 6.0
            crit_desc = f"Persistent storage tier: Encrypts data at rest; quantum safety of AES-256 preserves confidentiality."
            crit_evid = f"Storage vault in {finding.file}."
        elif "integrity" in usage_lower or "ledger" in usage_lower:
            crit_score = 4.0
            crit_desc = f"Moderate business criticality: Governs audit log verification and immutable record integrity."
            crit_evid = f"Audit module in {finding.file}."
        else:
            crit_score = 2.5
            crit_desc = f"Standard utility criticality: Module operates as auxiliary internal component."
            crit_evid = f"Internal module {finding.component_name}."

        factors.append(RiskFactor(
            factor_name="Asset & Business Criticality",
            score=crit_score,
            weight=0.15,
            description=crit_desc,
            evidence=crit_evid
        ))

        # -------------------------------------------------------------------------
        # FACTOR 3: External Attack Surface & Network Exposure (Weight: 0.15)
        # -------------------------------------------------------------------------
        if is_auth or is_payment:
            exp_score = 9.5
            exp_desc = "High External Exposure: Cryptographic endpoint directly interfaces with public clients, web portals, or partner APIs."
            exp_evid = f"Ingress boundary in {finding.file}:{finding.line}."
        elif is_tls:
            exp_score = 8.0
            exp_desc = "Network In-Transit Exposure: Operates across network transport boundaries accessible to traffic capture."
            exp_evid = "Network socket / inter-service communication channel."
        elif is_vault:
            exp_score = 2.5
            exp_desc = "Internal Storage Boundary: Encrypted data resides in persistent storage behind VPC perimeter."
            exp_evid = "Database storage layer."
        else:
            exp_score = 2.0
            exp_desc = "Internal Local Boundary: Execution contained within internal application memory."
            exp_evid = "Process-internal invocation."

        factors.append(RiskFactor(
            factor_name="External Attack Surface Exposure",
            score=exp_score,
            weight=0.15,
            description=exp_desc,
            evidence=exp_evid
        ))

        # -------------------------------------------------------------------------
        # FACTOR 4: Data Sensitivity & Harvest-Now-Decrypt-Later (HNDL) Threat (Weight: 0.15)
        # -------------------------------------------------------------------------
        is_key_exchange = finding.primitive == PrimitiveType.KEY_ESTABLISHMENT or is_tls or "ecdh" in algo_upper or "dh" in algo_upper
        is_data_at_rest = finding.primitive == PrimitiveType.SYMMETRIC_ENCRYPTION or is_vault

        if is_key_exchange:
            hndl_score = 10.0
            hndl_desc = "Critical HNDL Exposure: Key exchange ciphertext can be recorded today by passive adversaries for retrospective quantum decryption."
            hndl_evid = "Mosca's Theorem Threat: Intercepted Diffie-Hellman/ECDH session keys expose all underlying payload traffic."
            mosca_hndl = True
        elif is_data_at_rest:
            hndl_score = 2.0
            hndl_desc = "Negligible HNDL Risk: Stored data is protected with 256-bit symmetric cipher which retains 128-bit quantum security."
            hndl_evid = "AES-256 retains 128-bit quantum security margin."
            mosca_hndl = False
        elif finding.primitive == PrimitiveType.SIGNATURE:
            hndl_score = 3.0
            hndl_desc = "No Direct Retrospective Decryption: Signatures provide authentication; compromise allows future forgery, but not past session decryption."
            hndl_evid = "Signature keys do not encapsulate confidentiality secrets."
            mosca_hndl = False
        else:
            hndl_score = 0.5
            hndl_desc = "Negligible HNDL Threat: Hash or utility operation with no confidentiality payload."
            hndl_evid = "One-way cryptographic function."
            mosca_hndl = False

        factors.append(RiskFactor(
            factor_name="Data Sensitivity & HNDL Exposure",
            score=hndl_score,
            weight=0.15,
            description=hndl_desc,
            evidence=hndl_evid
        ))

        # -------------------------------------------------------------------------
        # FACTOR 5: Data Lifetime & Secrecy Horizon (Weight: 0.10)
        # -------------------------------------------------------------------------
        if is_key_exchange:
            life_score = 9.5
            life_desc = "Long Confidentiality Horizon (> 10 years): Regulated in-transit secrets and customer data streams."
            life_evid = "Enterprise retention policies require long-term confidentiality."
        elif is_data_at_rest:
            life_score = 4.0
            life_desc = "Persistent Storage Horizon: Database records retained long term, secured by quantum-resilient symmetric cipher."
            life_evid = "Persistent database archive."
        elif is_auth or "jwt" in algo_upper:
            life_score = 2.5
            life_desc = "Short / Ephemeral Lifetime (< 24 hours): Access tokens expire rapidly, limiting temporal exposure window per token."
            life_evid = "JWT token expiry is short-lived, though key reuse extends signature verification exposure."
        else:
            life_score = 1.0
            life_desc = "Transient Lifetime: Operational data with immediate lifecycle."
            life_evid = "Local runtime evaluation."

        factors.append(RiskFactor(
            factor_name="Data Lifetime & Secrecy Horizon",
            score=life_score,
            weight=0.10,
            description=life_desc,
            evidence=life_evid
        ))

        # -------------------------------------------------------------------------
        # FACTOR 6: Dependency Concentration & Blast-Radius Impact (Weight: 0.10)
        # -------------------------------------------------------------------------
        dep_count = blast_radius.total_affected_components
        dep_score = min(10.0, max(1.0, round(dep_count * 1.5, 1)))
        factors.append(RiskFactor(
            factor_name="Dependency Concentration & Blast Radius",
            score=dep_score,
            weight=0.10,
            description=f"Compromise or migration cascades across {dep_count} direct and indirect upstream/downstream components.",
            evidence=f"Direct: {', '.join(blast_radius.direct_dependents[:2]) if blast_radius.direct_dependents else 'Local'}; Flow: {blast_radius.data_flow_exposure}"
        ))

        # -------------------------------------------------------------------------
        # FACTOR 7: Migration Complexity & Protocol Coupling (Weight: 0.10)
        # -------------------------------------------------------------------------
        if "jwt" in algo_upper or "jwt" in usage_lower or is_tls:
            mig_score = 8.5
            mig_desc = "High Migration Complexity: Involves distributed client token headers (4.5KB size expansion), JWKS key rotation, or TLS cipher suite negotiation."
            mig_evid = "Requires coordinated multi-system rollout, proxy buffer adjustments, and dual-stack backward compatibility."
        elif finding.primitive == PrimitiveType.SIGNATURE:
            mig_score = 6.5
            mig_desc = "Moderate Complexity: ML-DSA signature size increases require database schema expansion and verification API updates."
            mig_evid = "ML-DSA-65 signature: 3,309 bytes (vs 256 bytes for classical)."
        elif "128" in algo_upper:
            mig_score = 5.0
            mig_desc = "Standard Key Rotation: Requires re-encrypting existing vault records with 256-bit keys."
            mig_evid = "Database re-encryption worker."
        else:
            mig_score = 1.0
            mig_desc = "Low / Zero Complexity: Primitive is already quantum-resilient; no architectural refactoring required."
            mig_evid = "Standard compliant."

        factors.append(RiskFactor(
            factor_name="Migration Complexity & Protocol Coupling",
            score=mig_score,
            weight=0.10,
            description=mig_desc,
            evidence=mig_evid
        ))

        # -------------------------------------------------------------------------
        # COMPUTATION: Transparent 0–100 Weighted Score & Risk Level
        # -------------------------------------------------------------------------
        weighted_sum = sum(f.score * f.weight for f in factors)
        overall_score = round(weighted_sum * 10.0, 1)

        # Exact Risk Level Boundaries:
        # 0–29 = LOW
        # 30–59 = MEDIUM
        # 60–79 = HIGH
        # 80–100 = CRITICAL
        if overall_score >= 80.0:
            level = RiskLevel.CRITICAL
        elif overall_score >= 60.0:
            level = RiskLevel.HIGH
        elif overall_score >= 30.0:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        # -------------------------------------------------------------------------
        # SEPARATE ENGINEERING PRIORITIZATION SCORE (0–100)
        # Combines Risk + Blast Radius + Migration Complexity + Exposure
        # -------------------------------------------------------------------------
        prio_raw = (overall_score * 0.60) + (dep_score * 2.0) + (mig_score * 1.5) + (exp_score * 0.5)
        engineering_priority = round(min(100.0, max(0.0, prio_raw)), 1)

        # Recommended Action
        if finding.quantum_status == QuantumStatus.VULNERABLE:
            if is_key_exchange:
                action = "Urgent: Deploy Hybrid X25519 + ML-KEM-768 (NIST FIPS 203) immediately to eliminate active HNDL exposure."
            else:
                action = "Deploy Dual-Signature JWKS / ML-DSA-65 (NIST FIPS 204) and expand gateway HTTP header buffers."
        elif finding.quantum_status == QuantumStatus.LEGACY_BROKEN:
            action = "Immediate remediation: Replace classically broken hash/algorithm with SHA-256 (NIST FIPS 180-4)."
        elif "AES-128" in algo_upper:
            action = "Upgrade symmetric cipher key length from 128-bit to AES-256-GCM to maintain 128-bit quantum security."
        else:
            action = "Maintain current standard. Algorithm provides robust 128+ bit quantum resistance."

        explanation = (
            f"Overall Quantum Risk is {level.value} ({overall_score}/100) with an Engineering Prioritization Score of {engineering_priority}/100. "
            f"{'CRITICAL HNDL: Subject to Harvest-Now-Decrypt-Later session interception. ' if mosca_hndl else ''}"
            f"Primary risk drivers: {factors[0].factor_name} ({factors[0].score}/10, wt 25%), {factors[1].factor_name} ({factors[1].score}/10, wt 15%), and {factors[3].factor_name} ({factors[3].score}/10, wt 15%)."
        )

        return RiskAssessment(
            finding_id=finding.id,
            overall_score=overall_score,
            level=level,
            engineering_prioritization_score=engineering_priority,
            mosca_harvest_now_decrypt_later=mosca_hndl,
            affected_component=f"{finding.component_name} ({finding.file}:{finding.line})",
            blast_radius_summary=blast_radius.criticality_summary,
            recommended_action=action,
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
