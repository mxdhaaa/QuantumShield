"""Python AST-based Cryptographic Scanner.
Performs semantic static analysis to detect cryptographic primitives, key sizes,
algorithms, usage context, and quantum vulnerability according to NIST PQC standards.
"""
import ast
import os
import re
from typing import List, Dict, Any, Optional
from backend.app.models import CryptoFinding, QuantumStatus, PrimitiveType

class CryptoASTVisitor(ast.NodeVisitor):
    def __init__(self, filename: str, source_lines: List[str]):
        self.filename = filename
        self.source_lines = source_lines
        self.findings: List[CryptoFinding] = []
        self.imports: Dict[str, str] = {} # alias -> real name
        self.current_function: Optional[str] = None
        self.current_class: Optional[str] = None
        self.component_name = self._infer_component_name(filename)

    def _infer_component_name(self, filepath: str) -> str:
        base = os.path.basename(filepath)
        name, _ = os.path.splitext(base)
        return name.replace("_", " ").title()

    def _get_evidence(self, lineno: int, context_lines: int = 1) -> str:
        start = max(0, lineno - 1)
        end = min(len(self.source_lines), lineno + context_lines - 1)
        return "\n".join(self.source_lines[start:end]).strip()

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            name = alias.name
            asname = alias.asname or alias.name
            self.imports[asname] = name
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            full_name = f"{module}.{alias.name}" if module else alias.name
            asname = alias.asname or alias.name
            self.imports[asname] = full_name
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        prev_func = self.current_function
        self.current_function = node.name
        self.generic_visit(node)
        self.current_function = prev_func

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        prev_func = self.current_function
        self.current_function = node.name
        self.generic_visit(node)
        self.current_function = prev_func

    def visit_ClassDef(self, node: ast.ClassDef):
        prev_class = self.current_class
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = prev_class

    def _determine_usage(self, default_usage: str) -> str:
        ctx = []
        if self.current_class:
            ctx.append(self.current_class)
        if self.current_function:
            ctx.append(self.current_function)
        
        ctx_str = " -> ".join(ctx).lower()
        if "auth" in ctx_str or "login" in ctx_str or "token" in ctx_str or "jwt" in ctx_str:
            return f"Authentication & Identity Tokens ({default_usage})"
        elif "payment" in ctx_str or "transaction" in ctx_str or "order" in ctx_str or "checkout" in ctx_str:
            return f"Payment & Transaction Authorization ({default_usage})"
        elif "tls" in ctx_str or "handshake" in ctx_str or "channel" in ctx_str or "session" in ctx_str:
            return f"Secure Channel Key Establishment ({default_usage})"
        elif "vault" in ctx_str or "storage" in ctx_str or "db" in ctx_str or "encrypt" in ctx_str:
            return f"Data-at-Rest Encryption ({default_usage})"
        elif "sign" in ctx_str or "verify" in ctx_str:
            return f"Digital Signature & Integrity ({default_usage})"
        return default_usage

    def visit_Call(self, node: ast.Call):
        call_str = ast.unparse(node) if hasattr(ast, "unparse") else ""
        func_name = ""
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            func_name = node.func.attr
            # Check full chain
            attr_chain = []
            curr = node.func
            while isinstance(curr, ast.Attribute):
                attr_chain.append(curr.attr)
                curr = curr.value
            if isinstance(curr, ast.Name):
                attr_chain.append(curr.id)
            attr_chain.reverse()
            func_name = ".".join(attr_chain)

        # 1. RSA Key Generation / Usage
        if "rsa.generate_private_key" in func_name or ("generate_private_key" in func_name and "rsa" in call_str.lower()):
            key_size = 2048
            for kw in node.keywords:
                if kw.arg == "key_size" and isinstance(kw.value, ast.Constant):
                    key_size = int(kw.value.value)
            
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:rsa_keygen",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm="RSA",
                key_size=key_size,
                primitive=PrimitiveType.SIGNATURE,
                usage=self._determine_usage(f"Asymmetric Key Generation (RSA-{key_size})"),
                library="cryptography.hazmat.primitives.asymmetric.rsa",
                evidence=self._get_evidence(node.lineno, 3),
                confidence=1.0,
                quantum_status=QuantumStatus.VULNERABLE,
                component_name=self.component_name,
                context_notes=f"Classical RSA-{key_size} factoring is solvable in polynomial time via Shor's Algorithm."
            ))

        # 2. Elliptic Curve Key Generation (ECDSA / ECDH)
        elif "ec.generate_private_key" in func_name or ("generate_private_key" in func_name and "ec." in call_str):
            curve_name = "SECP256R1 / P-256"
            if "SECP384R1" in call_str:
                curve_name = "SECP384R1 / P-384"
            elif "SECP521R1" in call_str:
                curve_name = "SECP521R1 / P-521"
            elif "SECP256K1" in call_str:
                curve_name = "SECP256K1"

            # Check if used for ECDH or ECDSA
            is_ecdh = "exchange" in call_str.lower() or "ecdh" in call_str.lower() or "channel" in self.filename.lower() or "tls" in self.filename.lower()
            primitive = PrimitiveType.KEY_ESTABLISHMENT if is_ecdh else PrimitiveType.SIGNATURE
            algo = f"ECDH ({curve_name})" if is_ecdh else f"ECDSA ({curve_name})"
            
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:ec_keygen",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm=algo,
                key_size=256 if "256" in curve_name else (384 if "384" in curve_name else 521),
                primitive=primitive,
                usage=self._determine_usage(f"Elliptic Curve {'Key Establishment' if is_ecdh else 'Digital Signature'}"),
                library="cryptography.hazmat.primitives.asymmetric.ec",
                evidence=self._get_evidence(node.lineno, 3),
                confidence=1.0,
                quantum_status=QuantumStatus.VULNERABLE,
                component_name=self.component_name,
                context_notes=f"Elliptic Curve Discrete Logarithm Problem (ECDLP) broken by Shor's algorithm."
            ))

        # 3. ECDH key exchange call (`peer_public_key.exchange(ec.ECDH(), ...)`)
        elif "exchange" in func_name and ("ECDH" in call_str or "ecdh" in call_str.lower()):
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:ecdh_exchange",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm="ECDH (Key Agreement)",
                key_size=256,
                primitive=PrimitiveType.KEY_ESTABLISHMENT,
                usage=self._determine_usage("Ephemeral Session Key Derivation (ECDH)"),
                library="cryptography.hazmat.primitives.asymmetric.ec.ECDH",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=1.0,
                quantum_status=QuantumStatus.VULNERABLE,
                component_name=self.component_name,
                context_notes="Harvest-Now-Decrypt-Later (HNDL) risk: Recorded ciphertext can be decrypted retroactively once CRQC is available."
            ))

        # 4. DSA Key Generation / Usage
        elif "dsa.generate_parameters" in func_name or "dsa.generate_private_key" in func_name or "dsa" in func_name:
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:dsa_usage",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm="DSA (Legacy Digital Signature Algorithm)",
                key_size=1024,
                primitive=PrimitiveType.SIGNATURE,
                usage=self._determine_usage("Legacy Digital Signature Verification"),
                library="cryptography.hazmat.primitives.asymmetric.dsa",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=1.0,
                quantum_status=QuantumStatus.VULNERABLE,
                component_name=self.component_name,
                context_notes="DSA is quantum-vulnerable via Shor's discrete logarithm attack and deprecated under classical standards."
            ))

        # 5. Diffie-Hellman Key Exchange
        elif "dh.generate_parameters" in func_name or "DiffieHellman" in call_str or "dh.DH" in call_str:
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:dh_exchange",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm="Diffie-Hellman (DH)",
                key_size=2048,
                primitive=PrimitiveType.KEY_ESTABLISHMENT,
                usage=self._determine_usage("Diffie-Hellman Key Exchange"),
                library="cryptography.hazmat.primitives.asymmetric.dh",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=1.0,
                quantum_status=QuantumStatus.VULNERABLE,
                component_name=self.component_name,
                context_notes="Finite field DH is vulnerable to Shor's algorithm (discrete log). Subject to HNDL."
            ))

        # 6. PyJWT token encoding/decoding
        elif "jwt.encode" in func_name or "jwt.decode" in func_name:
            algo = "RS256"
            for kw in node.keywords:
                if kw.arg == "algorithm" and isinstance(kw.value, ast.Constant):
                    algo = str(kw.value.value)
                elif kw.arg == "algorithms" and isinstance(kw.value, ast.List):
                    if kw.value.elts and isinstance(kw.value.elts[0], ast.Constant):
                        algo = str(kw.value.elts[0].value)

            # Check if algo is quantum vulnerable
            is_quantum_vuln = algo.startswith("RS") or algo.startswith("ES") or algo.startswith("PS")
            q_status = QuantumStatus.VULNERABLE if is_quantum_vuln else (QuantumStatus.CONDITIONALLY_SAFE if algo.startswith("HS") else QuantumStatus.LEGACY_BROKEN)
            
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:jwt_{algo}",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm=f"JWT ({algo})",
                key_size=2048 if algo.startswith("RS") else (256 if algo.startswith("ES") else None),
                primitive=PrimitiveType.SIGNATURE,
                usage=self._determine_usage(f"JWT Token Signing & Claims Verification ({algo})"),
                library="jwt (PyJWT)",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=1.0,
                quantum_status=q_status,
                component_name=self.component_name,
                context_notes=f"JWT with {algo} relies on classical asymmetric primitives (RSA/ECDSA) vulnerable to Shor's algorithm."
            ))

        # 7. AES Symmetric Ciphers
        elif "AES" in func_name or "algorithms.AES" in call_str:
            key_size = 256
            if "AES128" in call_str or "128" in call_str:
                key_size = 128
            
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:aes_{key_size}",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm=f"AES-{key_size}-GCM",
                key_size=key_size,
                primitive=PrimitiveType.SYMMETRIC_ENCRYPTION,
                usage=self._determine_usage(f"Authenticated Symmetric Payload Encryption (AES-{key_size})"),
                library="cryptography.hazmat.primitives.ciphers.algorithms.AES",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=0.95,
                quantum_status=QuantumStatus.CONDITIONALLY_SAFE,
                component_name=self.component_name,
                context_notes=f"AES-{key_size} is resilient against quantum attacks. Grover's algorithm halves effective security to {key_size // 2} bits ({'acceptable' if key_size >= 256 else 'marginal'})."
            ))

        # 8. Cryptographic Hash Functions
        elif any(h in func_name for h in ["hashes.SHA256", "hashes.SHA512", "hashes.SHA384", "hashlib.sha256", "hashlib.sha512", "hashlib.sha384", "SHA256", "SHA512", "SHA384"]):
            algo = "SHA-256"
            if "512" in func_name or "512" in call_str:
                algo = "SHA-512"
            elif "384" in func_name or "384" in call_str:
                algo = "SHA-384"
            
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:{algo.lower().replace('-', '')}",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm=algo,
                key_size=int(algo.split("-")[1]),
                primitive=PrimitiveType.HASHING,
                usage=self._determine_usage(f"Cryptographic Hash & Integrity Verification ({algo})"),
                library="cryptography.hazmat.primitives.hashes" if "hashes." in func_name else "hashlib",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=1.0,
                quantum_status=QuantumStatus.CONDITIONALLY_SAFE,
                component_name=self.component_name,
                context_notes=f"{algo} is quantum-resilient. Brassard-Høyer-Tapp (BHT) quantum collision algorithm requires 2^(n/3) operations, providing robust security margin."
            ))

        # 9. Broken Hashes (MD5, SHA1)
        elif any(h in func_name for h in ["hashlib.md5", "hashes.MD5", "hashlib.sha1", "hashes.SHA1"]):
            algo = "MD5" if "md5" in func_name.lower() or "md5" in call_str.lower() else "SHA-1"
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:{algo.lower().replace('-', '')}",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm=algo,
                key_size=128 if algo == "MD5" else 160,
                primitive=PrimitiveType.HASHING,
                usage=self._determine_usage(f"Legacy Insecure Hashing ({algo})"),
                library="hashlib",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=1.0,
                quantum_status=QuantumStatus.LEGACY_BROKEN,
                component_name=self.component_name,
                context_notes=f"{algo} is classically broken with practical collision attacks and must be replaced immediately with SHA-256/SHA-3."
            ))

        # 10. TLS / SSL Context Configuration
        elif "create_default_context" in func_name or "ssl.SSLContext" in call_str:
            self.findings.append(CryptoFinding(
                id=f"{os.path.basename(self.filename)}:{node.lineno}:tls_config",
                file=self.filename,
                line=node.lineno,
                col=node.col_offset,
                algorithm="TLS Configuration (X.509 / Classical CipherSuites)",
                key_size=None,
                primitive=PrimitiveType.PKI_CERTIFICATE,
                usage=self._determine_usage("Transport Layer Security (TLS Session Config)"),
                library="ssl (Standard Library)",
                evidence=self._get_evidence(node.lineno, 2),
                confidence=0.9,
                quantum_status=QuantumStatus.VULNERABLE,
                component_name=self.component_name,
                context_notes="TLS session negotiation using classical PKI certificates and key exchange (ECDHE/RSA) vulnerable to Store-Now-Decrypt-Later."
            ))

        self.generic_visit(node)


class CryptoASTScanner:
    """Orchestrates scanning across all source files in a repository directory."""
    
    @staticmethod
    def scan_directory(repo_path: str) -> List[CryptoFinding]:
        findings: List[CryptoFinding] = []
        if not os.path.exists(repo_path):
            return findings

        for root, _, files in os.walk(repo_path):
            for file in files:
                if file.endswith(".py"):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, repo_path).replace("\\", "/")
                    try:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                        
                        source_lines = content.splitlines()
                        tree = ast.parse(content, filename=rel_path)
                        visitor = CryptoASTVisitor(rel_path, source_lines)
                        visitor.visit(tree)
                        findings.extend(visitor.findings)
                    except Exception as e:
                        # Log error or continue
                        pass
        return findings
