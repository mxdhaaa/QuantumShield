# QuantumShield
### Post-Quantum Cryptography (PQC) Migration & Dependency-Aware Crypto-Agility Engine

**QuantumShield** is an enterprise cybersecurity scanner and crypto-agility intelligence platform that automates discovery, blast-radius mapping, explainable risk assessment, and migration simulation to NIST Post-Quantum Cryptography standards (**FIPS 203 ML-KEM**, **FIPS 204 ML-DSA**, and **FIPS 205 SLH-DSA**).

---

## 🚀 Core Features

1. **Semantic AST Cryptographic Scanner:**
   - Performs Python AST-level static analysis without regex limitations.
   - Detects RSA, ECDSA, ECDH, Diffie-Hellman, DSA, AES, SHA-2/3, MD5/SHA-1, PyJWT signing algorithms, and TLS configurations.
   - Extracts exact file, line, key size, primitive type, usage context, library, and confidence evidence.

2. **Dependency Graph & Blast Radius Engine:**
   - Maps full invocation chains: `Application -> Microservices -> Cryptographic Primitives -> Downstream Clients/Databases`.
   - Computes direct and indirect blast radius, data flow exposure, and cascading rollover risks.

3. **Deterministic & Explainable Risk Engine:**
   - Calculates mathematical risk scores (0–100) based on weighted factors:
     - Quantum Cryptographic Vulnerability (30%)
     - Mosca's Theorem / Harvest-Now-Decrypt-Later (HNDL) Threat ($X+Y > Z$) (25%)
     - Attack Surface & Gateway Ingress Exposure (20%)
     - Dependency Concentration & Blast Radius (15%)
     - Migration Complexity & Protocol Coupling (10%)

4. **Context-Aware Migration Intelligence:**
   - Strictly enforces NIST primitive separation:
     - **Digital Signatures (RSA / ECDSA):** Migrate to **NIST FIPS 204 (ML-DSA-65)** / FIPS 205 (SLH-DSA).
     - **Key Establishment (ECDH / DH):** Migrate to **NIST FIPS 203 (ML-KEM-768)** or Hybrid X25519 + ML-KEM.
   - Highlights size expansions (e.g. ML-DSA 3.3KB signatures, HTTP header buffer limits) and schema adjustments.

5. **Crypto-Agility Simulator & Before/After Validator:**
   - Simulates hybrid and full PQC rollouts across target primitives without modifying production code.
   - Computes residual exposure, agility readiness score %, and formal compliance check (FIPS 203, 204, CNSA 2.0).

6. **Grounded AI Copilot:**
   - Answers critical PQC migration questions strictly grounded on AST scan data and NIST standards with zero hallucinations.

---

## 📦 Quick Start & Demo Flow

### 1. Run Automated Test Suite
```bash
python -m pytest backend/tests/ -v
```

### 2. Launch Master Application
Run the single unified launcher:
```bash
python run_quantumshield.py
```
Or start the FastAPI backend directly (which also serves the compiled React UI):
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open **`http://127.0.0.1:8000`** in your browser.

---

## 🎬 End-to-End Demo Workflow

1. **Dashboard:** Review enterprise agility index and active HNDL threats.
2. **Scanner:** Select the seeded demo repository and click **Run Deep AST Scan** to inspect AST code evidence.
3. **Inventory:** Filter and inspect normalized cryptographic findings with JSON export.
4. **Dependency Graph:** Select `RSA-2048` or `ECDH` to view the interactive React Flow DAG and downstream blast radius.
5. **Risk Analysis:** View deterministic scoring and Mosca theorem HNDL data lifecycle analysis.
6. **Migration Planner:** Review FIPS 203/204 target candidates, buffer size delta, and rollback plans.
7. **Simulator:** Select findings and execute **Hybrid Transition Simulation**.
8. **Validation Report:** Review BEFORE vs AFTER metrics and residual risk reduction.
9. **Copilot:** Ask questions like *"Why can't ML-KEM replace ECDSA?"* or *"What should we migrate first?"*.
