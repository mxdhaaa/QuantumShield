"""Migration Intelligence Engine.
Generates context-aware, NIST-compliant Post-Quantum Cryptography migration plans.
Strictly distinguishes between Signatures (FIPS 204/205) and Key Encapsulation (FIPS 203).
"""
from typing import List, Dict
from backend.app.models import (
    CryptoFinding, FindingMigrationPlan, MigrationCandidate, PrimitiveType, QuantumStatus
)

class MigrationIntelligenceEngine:
    @staticmethod
    def generate_plan(finding: CryptoFinding) -> FindingMigrationPlan:
        algo_upper = finding.algorithm.upper()
        primitive = finding.primitive

        # 1. DIGITAL SIGNATURES (RSA, ECDSA, DSA, RS256, ES256)
        if primitive == PrimitiveType.SIGNATURE or "jwt" in algo_upper or "dsa" in algo_upper or "ecdsa" in algo_upper or ("rsa" in algo_upper and primitive != PrimitiveType.KEY_ESTABLISHMENT):
            if "jwt" in algo_upper or "auth" in finding.usage.lower():
                target_std = "NIST FIPS 204 (ML-DSA-65 / Module-Lattice-Based Digital Signature)"
                target_prim = "Digital Signature Algorithm (ML-DSA-65 / Category 3 Security)"
                hybrid_opt = "Hybrid Dual-Signature JWT (RS256 + ML-DSA-65) for backward compatibility"
                compat_risk = "JWT token size expands from ~800 bytes to ~4.5 KB. Ingress HTTP header buffers (e.g. Nginx, Envoy `large_client_header_buffers`) and authorization header max limits must be adjusted."
                perf_impact = "Verification is extremely fast (<0.1ms). Signature generation is ~2x faster than RSA-2048 signing, but transmission payload increases."
                delta = "Public Key: ~1,952 bytes (vs 256B for RSA). Signature: ~3,309 bytes (vs 256B for RSA-2048)."
                steps = [
                    "Phase 1: Implement Dual-Signature Header support accepting both classical RSA/ECDSA and ML-DSA signatures.",
                    "Phase 2: Deploy PQC-capable JWT signing module using liboqs or python-oqsprovider.",
                    "Phase 3: Update API Gateway header buffer configurations to accommodate ~5KB Authorization headers.",
                    "Phase 4: Rotate identity provider signing keys to ML-DSA-65 and deprecate legacy RSA tokens."
                ]
                validation = [
                    "Validate token verification across all microservice auth middleware.",
                    "Verify latency and payload limits on mobile clients over 4G/5G connections.",
                    "Perform fuzz testing on ML-DSA signature parser."
                ]
                rollback = "Maintain JWKS endpoint publishing both classical and ML-DSA keys with algorithm-pinning fallback switch."
                effort = "High"
            else:
                target_std = "NIST FIPS 204 (ML-DSA-65) or NIST FIPS 205 (SLH-DSA-128s / SPHINCS+)"
                target_prim = "Digital Signature Algorithm"
                hybrid_opt = "Composite Signature (ECDSA P-256 + ML-DSA-65)"
                compat_risk = "Database signature storage column capacity must be enlarged from VARCHAR(512) to TEXT/BLOB."
                perf_impact = "Negligible CPU overhead; slight memory bandwidth increase."
                delta = "Signature size increases from 64-256 bytes to 3,309 bytes (ML-DSA-65) or 7,856 bytes (SLH-DSA)."
                steps = [
                    "Phase 1: Update data models to store variable-length PQC signatures.",
                    "Phase 2: Introduce ML-DSA signature generator behind crypto-agile abstraction interface.",
                    "Phase 3: Execute shadow verification in production to validate signature integrity without blocking."
                ]
                validation = [
                    "Verify signature mathematical verification across target platforms.",
                    "Confirm schema migration for signature fields."
                ]
                rollback = "Toggle feature flag to fall back to classical ECDSA signing in event of verification mismatch."
                effort = "Medium"

            vuln_reason = "Shor's algorithm can factor RSA moduli or solve the elliptic curve discrete logarithm in polynomial time O((log N)^3), allowing private key extraction from public keys."

        # 2. KEY ESTABLISHMENT / KEY EXCHANGE (ECDH, DH, RSA Key Transport)
        elif primitive == PrimitiveType.KEY_ESTABLISHMENT or "ecdh" in algo_upper or "dh" in algo_upper or "channel" in finding.usage.lower() or "tls" in finding.usage.lower():
            target_std = "NIST FIPS 203 (ML-KEM-768 / Module-Lattice-Based Key Encapsulation)"
            target_prim = "Key Encapsulation Mechanism (ML-KEM-768 / Kyber)"
            hybrid_opt = "Hybrid Post-Quantum Key Exchange: X25519 + ML-KEM-768 (IETF RFC standard draft)"
            compat_risk = "TLS ClientHello / ServerHello packet size increases. Legacy middleboxes that reject fragmented TLS ClientHello packets may require padding or dual-record framing."
            perf_impact = "ML-KEM-768 key generation and encapsulation are significantly faster than classical ECDH (sub-millisecond)."
            delta = "Public Key: ~1,184 bytes; Ciphertext: ~1,088 bytes (vs 32-64 bytes for classical ECDH)."
            steps = [
                "Phase 1: Enable Hybrid X25519+ML-KEM-768 cipher suites in TLS edge and inter-service channels.",
                "Phase 2: Upgrade OpenSSL / TLS cryptographic providers to OpenSSL 3.3+ with oqsprovider.",
                "Phase 3: Enforce quantum-safe key exchange across all internal gRPC and REST service meshes.",
                "Phase 4: Verify external client negotiation with fallback to X25519 for non-PQC legacy clients."
            ]
            validation = [
                "Conduct network packet inspection to ensure no TCP fragmentation drops occur on middleboxes.",
                "Validate TLS handshake latency benchmarks (p99 < 5ms increase).",
                "Audit session key entropy and forward secrecy invariants."
            ]
            rollback = "Graceful downgrade negotiation in TLS handshake allowing classical X25519 when client does not advertise ML-KEM support."
            effort = "High"
            vuln_reason = "Vulnerable to Harvest-Now-Decrypt-Later (HNDL). Adversaries can record encrypted sessions today and decrypt them once a Cryptographically Relevant Quantum Computer is constructed."

        # 3. SYMMETRIC ENCRYPTION (AES-128 / AES-256)
        elif primitive == PrimitiveType.SYMMETRIC_ENCRYPTION or "aes" in algo_upper:
            if "128" in algo_upper:
                target_std = "NIST SP 800-38D (AES-256-GCM / 256-bit Key Length)"
                target_prim = "Authenticated Symmetric Encryption (AES-256-GCM)"
                hybrid_opt = "N/A - Direct Key Size Upgrade"
                compat_risk = "Requires re-encryption of existing data vaults or dual-key decryption compatibility during transition."
                perf_impact = "Negligible overhead on hardware with AES-NI instructions."
                delta = "Key size doubles from 16 bytes (128 bits) to 32 bytes (256 bits). Ciphertext length unchanged."
                steps = [
                    "Phase 1: Update Key Management Service (KMS) to generate 256-bit data encryption keys (DEKs).",
                    "Phase 2: Implement key versioning to decrypt legacy 128-bit records while encrypting new records with 256-bit.",
                    "Phase 3: Run background re-encryption worker to migrate legacy database records."
                ]
                validation = [
                    "Verify zero data corruption during background re-encryption.",
                    "Validate AES-NI hardware acceleration throughput."
                ]
                rollback = "Keep legacy 128-bit key decryptor active until 100% re-encryption is verified."
                effort = "Medium"
                vuln_reason = "Grover's search algorithm reduces the effective security of AES-128 to 64 bits (quadratic speedup), falling below acceptable security margins."
            else:
                target_std = "NIST SP 800-38D (AES-256-GCM - Already Quantum-Resilient)"
                target_prim = "Authenticated Symmetric Encryption"
                hybrid_opt = "N/A"
                compat_risk = "None. Retain current standard."
                perf_impact = "Optimal."
                delta = "None."
                steps = ["Maintain AES-256-GCM. Ensure key derivation functions (KDF) use 256-bit salt and quantum-resilient PRFs (HKDF-SHA384)."]
                validation = ["Verify 256-bit entropy source."]
                rollback = "N/A"
                effort = "Low"
                vuln_reason = "AES-256 provides 128-bit post-quantum security margin under Grover's algorithm, satisfying all NIST and CNSA 2.0 requirements."

        # 4. HASHING (MD5, SHA-1, SHA-256, SHA-512)
        elif primitive == PrimitiveType.HASHING:
            if "MD5" in algo_upper or "SHA-1" in algo_upper or "SHA1" in algo_upper:
                target_std = "NIST FIPS 180-4 (SHA-256 / SHA-384) or NIST FIPS 202 (SHA3-256)"
                target_prim = "Cryptographic Hash Function"
                hybrid_opt = "N/A - Direct Algorithm Replacement"
                compat_risk = "Digest output length changes (16/20 bytes to 32/48 bytes); hex string columns must be resized."
                perf_impact = "Negligible."
                delta = "Digest size increases to 32 bytes (256 bits) or 48 bytes (384 bits)."
                steps = [
                    "Phase 1: Deprecate MD5/SHA-1 across all codebase call sites.",
                    "Phase 2: Update database hash columns to CHAR(64) for SHA-256.",
                    "Phase 3: Migrate checksum verification pipelines."
                ]
                validation = ["Run test suite ensuring all hashes match expected SHA-256 hex lengths."]
                rollback = "N/A"
                effort = "Low"
                vuln_reason = "Classically broken with practical collision and length extension vulnerabilities."
            else:
                target_std = "NIST FIPS 180-4 (SHA-384 / SHA-512) or FIPS 202 (SHA3-256)"
                target_prim = "Cryptographic Hash Function"
                hybrid_opt = "N/A"
                compat_risk = "None."
                perf_impact = "Negligible."
                delta = "None."
                steps = ["Retain SHA-256/384. SHA-384 is recommended for CNSA 2.0 quantum collision margin."]
                validation = ["Confirm collision resistance invariants."]
                rollback = "N/A"
                effort = "Low"
                vuln_reason = "SHA-256/384 provides robust collision resistance against Brassard-Høyer-Tapp (BHT) quantum algorithm."

        # 5. PKI & TLS CERTIFICATES
        else:
            target_std = "NIST FIPS 203 (ML-KEM-768) + NIST FIPS 204 (ML-DSA-65) PKI"
            target_prim = "Quantum-Safe X.509 Certificate & TLS Configuration"
            hybrid_opt = "Dual-Certificate / Composite X.509 PKI Trust Chain"
            compat_risk = "Certificate size increases from ~1.5KB to ~8KB; web servers and trust stores must support composite OIDs."
            perf_impact = "Slight handshake latency increase; negligible after session resumption."
            delta = "Certificate chain size expands by ~4x."
            steps = [
                "Phase 1: Issue Hybrid X.509 certificates containing both RSA/ECDSA and ML-DSA public keys.",
                "Phase 2: Configure TLS terminations to advertise ML-KEM-768 key share.",
                "Phase 3: Roll out updated root CA certificates to internal trust stores."
            ]
            validation = ["Verify client compatibility across all supported OS and browser platforms."]
            rollback = "Retain classical CA root in trust store."
            effort = "Critical Architectural"
            vuln_reason = "Classical X.509 PKI relies on RSA/ECDSA signatures and ECDHE key exchange, vulnerable to both forgery and HNDL."

        return FindingMigrationPlan(
            finding_id=finding.id,
            current_algorithm=finding.algorithm,
            usage=finding.usage,
            quantum_vulnerability_reason=vuln_reason,
            dependency_context=f"Component: {finding.component_name} ({finding.file}:{finding.line})",
            migration_candidate=MigrationCandidate(
                target_standard=target_std,
                target_primitive=target_prim,
                hybrid_option=hybrid_opt,
                compatibility_risk=compat_risk,
                performance_impact=perf_impact,
                key_ciphertext_size_delta=delta,
                migration_steps=steps,
                validation_requirements=validation,
                rollback_plan=rollback
            ),
            estimated_effort=effort,
            prerequisites=[
                "Deploy crypto-agile abstraction layer in core SDK",
                "Upgrade underlying crypto runtime to support NIST FIPS 203/204",
                "Verify downstream client network buffer thresholds"
            ]
        )

    @staticmethod
    def generate_all_plans(findings: List[CryptoFinding]) -> Dict[str, FindingMigrationPlan]:
        return {f.id: MigrationIntelligenceEngine.generate_plan(f) for f in findings}
