"""Dependency Graph and Blast Radius Engine.
Maps callers, microservices, protocols, and downstream dependents to cryptographic primitives.
"""
from typing import List, Dict, Any, Set
import os
from backend.app.models import (
    CryptoFinding, DependencyGraph, DependencyNode, DependencyEdge, BlastRadius, QuantumStatus, PrimitiveType
)

class DependencyGraphBuilder:
    @staticmethod
    def build_graph(findings: List[CryptoFinding]) -> DependencyGraph:
        nodes: List[DependencyNode] = []
        edges: List[DependencyEdge] = []
        node_ids: Set[str] = set()

        def add_node(node: DependencyNode):
            if node.id not in node_ids:
                node_ids.add(node.id)
                nodes.append(node)

        def add_edge(edge: DependencyEdge):
            edges.append(edge)

        # 1. Root Application Node
        app_node = DependencyNode(
            id="app:quantum_enterprise_core",
            label="Enterprise Application Core",
            type="application",
            data={"description": "Main corporate application orchestrating microservices."}
        )
        add_node(app_node)

        # 2. Downstream Client Ecosystem Nodes
        downstream_clients = [
            ("client:web_portal", "Web SPA Portal (Browser)", "external_client"),
            ("client:mobile_app", "iOS & Android Mobile Clients", "external_client"),
            ("client:partner_api", "B2B Partner API Gateway", "external_api"),
            ("client:db_storage", "Cold Storage & Database Backup", "storage")
        ]
        for c_id, c_label, c_type in downstream_clients:
            add_node(DependencyNode(id=c_id, label=c_label, type=c_type, data={}))

        # Track blast radius
        blast_radii: Dict[str, BlastRadius] = {}

        # 3. Create component nodes & algorithm nodes
        for f in findings:
            comp_id = f"component:{f.component_name.lower().replace(' ', '_')}"
            add_node(DependencyNode(
                id=comp_id,
                label=f"{f.component_name} Service",
                type="service",
                data={"file": f.file, "primitive": f.primitive.value}
            ))

            # Connect App -> Service
            add_edge(DependencyEdge(
                id=f"edge_app_{comp_id}",
                source="app:quantum_enterprise_core",
                target=comp_id,
                relation="invokes",
                label="orchestrates"
            ))

            # Crypto Finding Node
            finding_node_id = f"finding:{f.id}"
            add_node(DependencyNode(
                id=finding_node_id,
                label=f"{f.algorithm} [{f.primitive.value.upper()}]",
                type="crypto_primitive",
                data={
                    "algorithm": f.algorithm,
                    "key_size": f.key_size,
                    "quantum_status": f.quantum_status.value,
                    "usage": f.usage,
                    "file": f.file,
                    "line": f.line
                }
            ))

            # Connect Service -> Crypto Finding
            add_edge(DependencyEdge(
                id=f"edge_{comp_id}_{finding_node_id}",
                source=comp_id,
                target=finding_node_id,
                relation="executes_crypto",
                label=f.usage[:24] + "..."
            ))

            usage_lower = f.usage.lower()
            algo_upper = f.algorithm.upper()
            file_lower = f.file.lower()

            is_vault = "vault" in usage_lower or "storage" in usage_lower or "aes" in algo_upper or "data-at-rest" in usage_lower
            is_payment = "payment" in usage_lower or "transaction" in usage_lower or "payment_gateway" in file_lower
            is_tls = "tls" in usage_lower or "channel" in usage_lower or "ecdh" in algo_upper or "dh" in algo_upper
            is_auth = not is_vault and ("authentication" in usage_lower or "identity" in usage_lower or "jwt" in algo_upper or "auth_service" in file_lower or "rsa" in algo_upper)

            if is_auth:
                direct_deps = ["Web SPA Portal (Browser)", "iOS & Android Mobile Clients", "Auth Verification Middleware"]
                indirect_deps = ["B2B Partner API Gateway", "Microservices Mesh (All 14 Downstream Services)"]
                flow_exposure = "High Exposure: Ingress Authentication Gateway & Token Validation"
                crit_summary = "Critical Blast Radius: Compromise allows forgery of universal identity tokens."
                add_edge(DependencyEdge(id=f"edge_{finding_node_id}_web", source=finding_node_id, target="client:web_portal", relation="validates_sessions"))
                add_edge(DependencyEdge(id=f"edge_{finding_node_id}_mob", source=finding_node_id, target="client:mobile_app", relation="validates_sessions"))

            elif is_payment:
                direct_deps = ["B2B Partner API Gateway", "Payment Processing Engine", "Settlement Ledger"]
                indirect_deps = ["Financial Audit Log", "Treasury Reporting System"]
                flow_exposure = "High Financial Exposure: External Banking & Payment API"
                crit_summary = "Critical Financial Blast Radius: Compromise enables fraudulent transaction signing."
                add_edge(DependencyEdge(id=f"edge_{finding_node_id}_partner", source=finding_node_id, target="client:partner_api", relation="signs_transactions"))

            elif is_tls:
                direct_deps = ["TLS Ingress Controller", "Inter-Service Mutual TLS (mTLS) Mesh"]
                indirect_deps = ["All Microservice In-Transit RPC Traffic", "Customer Data Streams"]
                flow_exposure = "Critical In-Transit Exposure: Harvest-Now-Decrypt-Later (HNDL) Vulnerable"
                crit_summary = "Severe Blast Radius: Captured traffic can be retroactively decrypted once CRQC is available."
                add_edge(DependencyEdge(id=f"edge_{finding_node_id}_tls", source=finding_node_id, target="client:web_portal", relation="encrypts_in_transit"))
                add_edge(DependencyEdge(id=f"edge_{finding_node_id}_partner_tls", source=finding_node_id, target="client:partner_api", relation="encrypts_in_transit"))

            elif is_vault:
                direct_deps = ["Database Encryption Driver", "Customer PII Vault"]
                indirect_deps = ["Database Replication Targets", "Cold Backup Archive"]
                flow_exposure = "Internal Storage: Persistent Encrypted Database at Rest"
                crit_summary = "Symmetric encryption with AES-256 retains 128-bit quantum security under Grover's."
                add_edge(DependencyEdge(id=f"edge_{finding_node_id}_storage", source=finding_node_id, target="client:db_storage", relation="encrypts_at_rest"))

            else:
                direct_deps = [f"{f.component_name} Direct Callers"]
                indirect_deps = ["Application Logging Subsystem"]
                flow_exposure = "Internal Utility Component"
                crit_summary = "Contained blast radius within local module."

            blast_radii[f.id] = BlastRadius(
                finding_id=f.id,
                algorithm=f.algorithm,
                direct_dependents=direct_deps,
                indirect_dependents=indirect_deps,
                total_affected_components=len(direct_deps) + len(indirect_deps),
                data_flow_exposure=flow_exposure,
                criticality_summary=crit_summary
            )

        return DependencyGraph(
            nodes=nodes,
            edges=edges,
            blast_radii=blast_radii
        )
