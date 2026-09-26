export type TabType = 
  | 'dashboard' 
  | 'scanner' 
  | 'inventory' 
  | 'dependencies' 
  | 'risk' 
  | 'migration' 
  | 'simulator' 
  | 'validation' 
  | 'copilot';

export type QuantumStatus = 'quantum-vulnerable' | 'quantum-safe' | 'conditionally-safe' | 'legacy-broken';

export type PrimitiveType = 'signature' | 'key_establishment' | 'symmetric_encryption' | 'hashing' | 'pki_certificate' | 'hybrid_scheme';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface CryptoFinding {
  id: string;
  file: string;
  line: number;
  col: number;
  algorithm: string;
  key_size: number | null;
  primitive: PrimitiveType;
  usage: string;
  library: string;
  evidence: string;
  confidence: number;
  quantum_status: QuantumStatus;
  component_name: string;
  context_notes?: string;
}

export interface RiskFactor {
  factor_name: string;
  score: number;
  weight: number;
  description: string;
  evidence: string;
}

export interface RiskAssessment {
  finding_id: string;
  overall_score: number;
  level: RiskLevel;
  engineering_prioritization_score: number;
  mosca_harvest_now_decrypt_later: boolean;
  affected_component: string;
  blast_radius_summary: string;
  recommended_action: string;
  factors: RiskFactor[];
  explanation: string;
}

export interface DependencyNode {
  id: string;
  label: string;
  type: string;
  data: Record<string, any>;
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  label?: string;
}

export interface BlastRadius {
  finding_id: string;
  algorithm: string;
  direct_dependents: string[];
  indirect_dependents: string[];
  total_affected_components: number;
  data_flow_exposure: string;
  criticality_summary: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  blast_radii: Record<string, BlastRadius>;
}

export interface MigrationCandidate {
  target_standard: string;
  target_primitive: string;
  hybrid_option?: string;
  compatibility_risk: string;
  performance_impact: string;
  key_ciphertext_size_delta: string;
  migration_steps: string[];
  validation_requirements: string[];
  rollback_plan: string;
}

export interface FindingMigrationPlan {
  finding_id: string;
  current_algorithm: string;
  usage: string;
  quantum_vulnerability_reason: string;
  dependency_context: string;
  migration_candidate: MigrationCandidate;
  estimated_effort: string;
  prerequisites: string[];
}

export interface SimulationFindingStatus {
  finding_id: string;
  original_algorithm: string;
  simulated_algorithm: string;
  status: 'not_started' | 'in_progress' | 'migrated_hybrid' | 'migrated_full_pqc' | 'rollback';
  resolved_dependencies: string[];
  remaining_compatibility_risks: string[];
}

export interface SimulationReport {
  simulation_id: string;
  total_vulnerabilities_original: number;
  vulnerabilities_mitigated: number;
  residual_vulnerabilities: number;
  agility_readiness_score: number;
  findings_status: SimulationFindingStatus[];
  breaking_changes_identified: string[];
  performance_overhead_estimate: string;
  summary: string;
}

export interface ValidationComparison {
  before_quantum_vulnerable_count: number;
  after_quantum_vulnerable_count: number;
  migrated_count: number;
  unresolved_dependencies_count: number;
  risk_reduction_percentage: number;
  coverage_percentage: number;
  compliance_status: Record<string, boolean>;
  findings_diff: Array<{
    finding_id: string;
    before: string;
    after: string;
    status: string;
    mitigated: boolean;
  }>;
}

export interface ScanResult {
  scan_id: string;
  repo_path: string;
  scanned_files_count: number;
  findings: CryptoFinding[];
  risk_assessments: Record<string, RiskAssessment>;
  dependency_graph: DependencyGraph;
  migration_plans: Record<string, FindingMigrationPlan>;
  summary_stats: {
    total_assets: number;
    quantum_vulnerable: number;
    critical_risk_findings: number;
    hndl_active_threats: number;
    conditionally_safe: number;
    quantum_safe: number;
    dependency_nodes: number;
    dependency_edges: number;
    crypto_agility_index: number;
  };
}

export interface CopilotAnswer {
  answer: string;
  grounded_evidence: string[];
  nist_references: string[];
  suggested_actions: string[];
}
