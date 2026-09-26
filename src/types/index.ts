export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type AlgorithmCategory = 
  | 'Asymmetric Encryption' 
  | 'Hash Function' 
  | 'Key Exchange' 
  | 'Digital Signature' 
  | 'TLS Transport' 
  | 'Symmetric Cipher';

export type MigrationConcern = 'Immediate Action' | 'High Risk' | 'Medium Concern' | 'Low Risk' | 'Quantum Safe';

export interface CryptoFinding {
  id: string;
  file: string;
  line: number;
  evidence: string;
  algorithm: string;
  category: AlgorithmCategory;
  severity: SeverityLevel;
  confidence: 'High' | 'Medium' | 'Low';
  migrationConcern: MigrationConcern;
  migrationPriority: 'Immediate' | 'Q2 2026' | 'Scheduled' | 'Low';
  replacementRecommendation: string;
  repository: string;
  detectedAt: string;
  snippet: string;
}

export interface RepositoryItem {
  id: string;
  name: string;
  url: string;
  branch: string;
  language: string;
  totalFiles: number;
  cryptoCount: number;
  riskScore: number;
  lastScanned: string;
  status: 'Clean' | 'Action Required' | 'Critical Vulnerabilities';
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  signatureAlgorithm: string;
  keyType: string;
  keySize: number;
  expirationDate: string;
  daysToExpiry: number;
  riskLevel: SeverityLevel;
  hybridReadiness: boolean;
  fingerprint: string;
  associatedService: string;
}

export interface DependencyNode {
  id: string;
  label: string;
  type: 'application' | 'service' | 'dependency' | 'library' | 'certificate' | 'algorithm';
  riskLevel: SeverityLevel | 'Safe';
  details: {
    description: string;
    version?: string;
    pqcReplacement?: string;
    impactScore?: number;
  };
}

export interface MigrationPhase {
  id: number;
  title: string;
  subtitle: string;
  targetWindow: string;
  status: 'In Progress' | 'Upcoming' | 'Completed' | 'Pending Review';
  progress: number;
  tasks: {
    id: string;
    title: string;
    category: 'Confirmed' | 'Probable' | 'Uncertain';
    completed: boolean;
    priority: SeverityLevel;
    assignedTeam: string;
  }[];
}

export type CryptoProviderType = 'RSA Provider' | 'ECC Provider' | 'Hybrid Provider' | 'Post-Quantum Provider';

export interface CryptoProviderDetails {
  id: CryptoProviderType;
  name: string;
  algorithm: string;
  keyExchange: string;
  signature: string;
  quantumSafetyScore: number;
  keySizeBits: number;
  signatureSizeBytes: number;
  latencyMs: number;
  pqcStandards: string;
  sampleCode: string;
}
