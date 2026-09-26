"""Data models for QuantumShield."""
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class QuantumStatus(str, Enum):
    VULNERABLE = "quantum-vulnerable"
    SAFE = "quantum-safe"
    CONDITIONALLY_SAFE = "conditionally-safe" # e.g. AES-256 (Grover's reduces effective to 128, still secure), SHA-256
    LEGACY_BROKEN = "legacy-broken" # e.g. MD5, SHA-1, DES

class PrimitiveType(str, Enum):
    SIGNATURE = "signature"
    KEY_ESTABLISHMENT = "key_establishment"
    SYMMETRIC_ENCRYPTION = "symmetric_encryption"
    HASHING = "hashing"
    PKI_CERTIFICATE = "pki_certificate"
    HYBRID_SCHEME = "hybrid_scheme"

class RiskLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class CryptoFinding(BaseModel):
    id: str
    file: str
    line: int
    col: int = 0
    algorithm: str
    key_size: Optional[int] = None
    primitive: PrimitiveType
    usage: str
    library: str
    evidence: str
    confidence: float = 1.0 # 0.0 to 1.0
    quantum_status: QuantumStatus
    component_name: str
    context_notes: Optional[str] = None

class RiskFactor(BaseModel):
    factor_name: str
    score: float # 0 to 10
    weight: float # 0.0 to 1.0
    description: str
    evidence: str

class RiskAssessment(BaseModel):
    finding_id: str
    overall_score: float # 0 to 100
    level: RiskLevel # LOW (0-29), MEDIUM (30-59), HIGH (60-79), CRITICAL (80-100)
    engineering_prioritization_score: float # 0 to 100
    mosca_harvest_now_decrypt_later: bool = False
    affected_component: str
    blast_radius_summary: str
    recommended_action: str
    factors: List[RiskFactor]
    explanation: str

class DependencyNode(BaseModel):
    id: str
    label: str
    type: str # "application", "service", "module", "crypto_primitive", "algorithm", "external_api"
    data: Dict[str, Any] = {}

class DependencyEdge(BaseModel):
    id: str
    source: str
    target: str
    relation: str # "imports", "calls", "signs_with", "exchanges_with", "encrypts_with"
    label: Optional[str] = None

class BlastRadius(BaseModel):
    finding_id: str
    algorithm: str
    direct_dependents: List[str]
    indirect_dependents: List[str]
    total_affected_components: int
    data_flow_exposure: str
    criticality_summary: str

class DependencyGraph(BaseModel):
    nodes: List[DependencyNode]
    edges: List[DependencyEdge]
    blast_radii: Dict[str, BlastRadius] = {}

class MigrationCandidate(BaseModel):
    target_standard: str # e.g. "NIST FIPS 204 (ML-DSA-65 / Dilithium)", "NIST FIPS 203 (ML-KEM-768 / Kyber)"
    target_primitive: str
    hybrid_option: Optional[str] = None # e.g. "X25519 + ML-KEM-768"
    compatibility_risk: str
    performance_impact: str
    key_ciphertext_size_delta: str
    migration_steps: List[str]
    validation_requirements: List[str]
    rollback_plan: str

class FindingMigrationPlan(BaseModel):
    finding_id: str
    current_algorithm: str
    usage: str
    quantum_vulnerability_reason: str
    dependency_context: str
    migration_candidate: MigrationCandidate
    estimated_effort: str # "Low", "Medium", "High", "Critical Architectural"
    prerequisites: List[str]

class SimulationState(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    MIGRATED_HYBRID = "migrated_hybrid"
    MIGRATED_FULL_PQC = "migrated_full_pqc"
    ROLLBACK = "rollback"

class SimulationFindingStatus(BaseModel):
    finding_id: str
    original_algorithm: str
    simulated_algorithm: str
    status: SimulationState
    resolved_dependencies: List[str]
    remaining_compatibility_risks: List[str]

class SimulationReport(BaseModel):
    simulation_id: str
    total_vulnerabilities_original: int
    vulnerabilities_mitigated: int
    residual_vulnerabilities: int
    agility_readiness_score: float # 0 to 100
    findings_status: List[SimulationFindingStatus]
    breaking_changes_identified: List[str]
    performance_overhead_estimate: str
    summary: str

class ValidationComparison(BaseModel):
    before_quantum_vulnerable_count: int
    after_quantum_vulnerable_count: int
    migrated_count: int
    unresolved_dependencies_count: int
    risk_reduction_percentage: float
    coverage_percentage: float
    compliance_status: Dict[str, bool] # e.g. {"NIST_FIPS_203": True, "NIST_FIPS_204": True, "CNSA_2_0_ALIGNMENT": True}
    findings_diff: List[Dict[str, Any]]

class ScanResult(BaseModel):
    scan_id: str
    repo_path: str
    scanned_files_count: int
    findings: List[CryptoFinding]
    risk_assessments: Dict[str, RiskAssessment]
    dependency_graph: DependencyGraph
    migration_plans: Dict[str, FindingMigrationPlan]
    summary_stats: Dict[str, Any]

class CopilotQuery(BaseModel):
    question: str
    scan_id: Optional[str] = None
    selected_finding_id: Optional[str] = None

class CopilotAnswer(BaseModel):
    answer: str
    grounded_evidence: List[str]
    nist_references: List[str]
    suggested_actions: List[str]
