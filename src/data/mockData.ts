import type { 
  CryptoFinding, 
  RepositoryItem, 
  CertificateItem, 
  MigrationPhase, 
  CryptoProviderDetails 
} from '../types';

export const MOCK_REPOSITORIES: RepositoryItem[] = [
  {
    id: 'repo-1',
    name: 'azure-auth-gateway-service',
    url: 'https://github.com/contoso-enterprise/azure-auth-gateway',
    branch: 'main',
    language: 'TypeScript / C++',
    totalFiles: 428,
    cryptoCount: 38,
    riskScore: 84,
    lastScanned: '10 mins ago',
    status: 'Critical Vulnerabilities'
  },
  {
    id: 'repo-2',
    name: 'payment-token-vault-api',
    url: 'https://github.com/contoso-enterprise/payment-vault',
    branch: 'release/v4.2',
    language: 'Java / Spring Boot',
    totalFiles: 612,
    cryptoCount: 52,
    riskScore: 91,
    lastScanned: '1 hour ago',
    status: 'Critical Vulnerabilities'
  },
  {
    id: 'repo-3',
    name: 'cloud-kms-keywrapper',
    url: 'https://github.com/contoso-enterprise/kms-keywrapper',
    branch: 'main',
    language: 'Go / C',
    totalFiles: 184,
    cryptoCount: 22,
    riskScore: 68,
    lastScanned: '3 hours ago',
    status: 'Action Required'
  },
  {
    id: 'repo-4',
    name: 'quantum-hybrid-ingress-proxy',
    url: 'https://github.com/contoso-enterprise/quantum-ingress',
    branch: 'feature/kyber-hybrid',
    language: 'Rust',
    totalFiles: 95,
    cryptoCount: 14,
    riskScore: 18,
    lastScanned: '5 hours ago',
    status: 'Clean'
  },
  {
    id: 'repo-5',
    name: 'legacy-partner-sftp-server',
    url: 'https://github.com/contoso-enterprise/partner-sftp',
    branch: 'master',
    language: 'Python',
    totalFiles: 310,
    cryptoCount: 45,
    riskScore: 78,
    lastScanned: '1 day ago',
    status: 'Action Required'
  }
];

export const MOCK_FINDINGS: CryptoFinding[] = [
  {
    id: 'FIND-101',
    repository: 'azure-auth-gateway-service',
    file: 'src/crypto/rsaKeyManager.cpp',
    line: 142,
    evidence: 'RSA_generate_key_ex(rsa, 2048, e, NULL); // Legacy RSA-2048 key generation',
    algorithm: 'RSA-2048',
    category: 'Asymmetric Encryption',
    severity: 'Critical',
    confidence: 'High',
    migrationConcern: 'Immediate Action',
    migrationPriority: 'Immediate',
    replacementRecommendation: 'Migrate to ML-KEM-768 (NIST FIPS 203) for key encapsulation or ML-DSA-65 (NIST FIPS 204) for signatures.',
    detectedAt: '2026-09-26 10:14',
    snippet: `// Hardcoded legacy RSA key size vulnerable to Shor's algorithm
int CKeyManager::GenerateKeyPair() {
    BBOX* e = BN_new();
    BN_set_word(e, RSA_F4);
    RSA* rsa = RSA_new();
    // CRITICAL: 2048-bit RSA is vulnerable to quantum cryptanalysis
    if (RSA_generate_key_ex(rsa, 2048, e, NULL) != 1) {
        return CRYPTO_ERROR_GENKEY_FAILED;
    }
    return CRYPTO_OK;
}`
  },
  {
    id: 'FIND-102',
    repository: 'payment-token-vault-api',
    file: 'src/main/java/com/contoso/vault/SignatureValidator.java',
    line: 88,
    evidence: 'Signature.getInstance("SHA1withRSA", "BC"); // Deprecated SHA-1 and RSA',
    algorithm: 'SHA1',
    category: 'Hash Function',
    severity: 'Critical',
    confidence: 'High',
    migrationConcern: 'Immediate Action',
    migrationPriority: 'Immediate',
    replacementRecommendation: 'Replace SHA-1 with SHA-384/SHA-512 and upgrade RSA signature to Dilithium (ML-DSA-65).',
    detectedAt: '2026-09-26 09:30',
    snippet: `public boolean verifyTokenSignature(byte[] payload, byte[] sig) throws Exception {
    // SHA1 digest has collision vulnerabilities and zero quantum resilience
    Signature signature = Signature.getInstance("SHA1withRSA", "BC");
    signature.initVerify(this.publicSigningKey);
    signature.update(payload);
    return signature.verify(sig);
}`
  },
  {
    id: 'FIND-103',
    repository: 'azure-auth-gateway-service',
    file: 'src/auth/jwtSigner.ts',
    line: 65,
    evidence: 'jwt.sign(payload, secretKey, { algorithm: "RS256" });',
    algorithm: 'ECDSA',
    category: 'Digital Signature',
    severity: 'High',
    confidence: 'High',
    migrationConcern: 'High Risk',
    migrationPriority: 'Immediate',
    replacementRecommendation: 'Wrap JWT signing with a hybrid PQC header (e.g. Composite Signature RS256 + Dilithium).',
    detectedAt: '2026-09-26 08:45',
    snippet: `import jwt from 'jsonwebtoken';

export function createAuthToken(userClaims: Record<string, any>): string {
    // RS256 uses RSA 2048 bit signatures vulnerable to HNDL (Harvest Now, Decrypt Later)
    return jwt.sign(userClaims, process.env.JWT_PRIVATE_KEY!, {
        algorithm: 'RS256',
        expiresIn: '1h'
    });
}`
  },
  {
    id: 'FIND-104',
    repository: 'cloud-kms-keywrapper',
    file: 'pkg/kms/ecdh_wrapper.go',
    line: 215,
    evidence: 'elliptic.P256() // NIST P-256 Curve for ECDH Key Exchange',
    algorithm: 'ECDSA',
    category: 'Key Exchange',
    severity: 'High',
    confidence: 'High',
    migrationConcern: 'High Risk',
    migrationPriority: 'Q2 2026',
    replacementRecommendation: 'Upgrade ECDH P-256 to X25519 + Kyber768 (Hybrid Post-Quantum Key Exchange).',
    detectedAt: '2026-09-26 07:12',
    snippet: `func GenerateEphemeralECDH() (*ecdsa.PrivateKey, error) {
    // P-256 Elliptic Curve is vulnerable to quantum Shor's Algorithm
    curve := elliptic.P256()
    return ecdsa.GenerateKey(curve, rand.Reader)
}`
  },
  {
    id: 'FIND-105',
    repository: 'legacy-partner-sftp-server',
    file: 'app/security/tls_config.py',
    line: 34,
    evidence: 'ssl_version = ssl.PROTOCOL_TLSv1_1 # Deprecated TLS 1.1 protocol',
    algorithm: 'TLS',
    category: 'TLS Transport',
    severity: 'Critical',
    confidence: 'High',
    migrationConcern: 'Immediate Action',
    migrationPriority: 'Immediate',
    replacementRecommendation: 'Force TLS 1.3 with X25519MLKEM768 cipher suite support.',
    detectedAt: '2026-09-26 06:00',
    snippet: `import ssl

def get_legacy_context():
    # Deprecated TLS 1.1 context allows fallback attacks and lacks PQC cipher negotiations
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_1)
    context.set_ciphers('ECDHE-RSA-AES128-SHA')
    return context`
  },
  {
    id: 'FIND-106',
    repository: 'payment-token-vault-api',
    file: 'pom.xml',
    line: 112,
    evidence: '<groupId>org.bouncycastle</groupId><artifactId>bcprov-jdk15on</artifactId><version>1.65</version>',
    algorithm: 'BouncyCastle',
    category: 'Symmetric Cipher',
    severity: 'Medium',
    confidence: 'High',
    migrationConcern: 'Medium Concern',
    migrationPriority: 'Q2 2026',
    replacementRecommendation: 'Upgrade BouncyCastle dependency to >=1.78 which ships native NIST PQC standards (FIPS 203/204).',
    detectedAt: '2026-09-25 18:22',
    snippet: `<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk15on</artifactId>
    <!-- Outdated BouncyCastle version lacks ML-KEM and Falcon provider implementations -->
    <version>1.65</version>
</dependency>`
  },
  {
    id: 'FIND-107',
    repository: 'cloud-kms-keywrapper',
    file: 'src/hsm/pkcs11_session.c',
    line: 98,
    evidence: 'CKM_RSA_PKCS_KEY_PAIR_GEN // PKCS#11 Hardware Security Module RSA slot',
    algorithm: 'OpenSSL',
    category: 'Asymmetric Encryption',
    severity: 'High',
    confidence: 'Medium',
    migrationConcern: 'High Risk',
    migrationPriority: 'Q2 2026',
    replacementRecommendation: 'Prepare HSM firmware upgrade for PKCS#11 v3.1 PQC mechanisms.',
    detectedAt: '2026-09-25 14:05',
    snippet: `CK_MECHANISM mechanism = {
    CKM_RSA_PKCS_KEY_PAIR_GEN, NULL_PTR, 0
};
// HSM Hardware Key slot configured for RSA 4096`
  },
  {
    id: 'FIND-108',
    repository: 'azure-auth-gateway-service',
    file: 'config/crypto-policy.json',
    line: 19,
    evidence: '"defaultHashAlgorithm": "SHA-256", "signatureScheme": "RSA-PSS-2048"',
    algorithm: 'SHA256',
    category: 'Hash Function',
    severity: 'Low',
    confidence: 'High',
    migrationConcern: 'Low Risk',
    migrationPriority: 'Scheduled',
    replacementRecommendation: 'SHA-256 remains quantum-resistant under Grover search, but signature scheme requires PQC upgrade.',
    detectedAt: '2026-09-25 11:30',
    snippet: `{
  "cryptoPolicy": {
    "defaultHashAlgorithm": "SHA-256",
    "signatureScheme": "RSA-PSS-2048"
  }
}`
  }
];

export const MOCK_CERTIFICATES: CertificateItem[] = [
  {
    id: 'CERT-001',
    name: 'api.contoso-payments.com',
    issuer: 'DigiCert Global Root G2',
    signatureAlgorithm: 'SHA256withRSA',
    keyType: 'RSA',
    keySize: 2048,
    expirationDate: '2026-11-14',
    daysToExpiry: 49,
    riskLevel: 'Critical',
    hybridReadiness: false,
    fingerprint: '9E:4D:7C:1A:8F:33:0B:44:E2:71',
    associatedService: 'Payment Gateway API'
  },
  {
    id: 'CERT-002',
    name: 'auth.azure.contoso.internal',
    issuer: 'Contoso Enterprise Sub-CA 01',
    signatureAlgorithm: 'ECDSAwithSHA384',
    keyType: 'ECC (P-384)',
    keySize: 384,
    expirationDate: '2027-04-20',
    daysToExpiry: 206,
    riskLevel: 'High',
    hybridReadiness: false,
    fingerprint: '3B:90:FE:D2:1C:89:70:E5:A1:64',
    associatedService: 'Azure Auth Gateway'
  },
  {
    id: 'CERT-003',
    name: 'kms.cloud.contoso.io',
    issuer: 'Microsoft ECC TLS Issuing CA 02',
    signatureAlgorithm: 'ECDSAwithSHA256',
    keyType: 'ECC (P-256)',
    keySize: 256,
    expirationDate: '2026-10-05',
    daysToExpiry: 9,
    riskLevel: 'Critical',
    hybridReadiness: false,
    fingerprint: '12:AB:56:CD:78:EF:90:12:34:56',
    associatedService: 'Cloud KMS Keywrapper'
  },
  {
    id: 'CERT-004',
    name: 'hybrid-pqc-mesh.contoso-security.net',
    issuer: 'QUANTUMSHIFT Hybrid Root CA',
    signatureAlgorithm: 'Composite (Dilithium3 + RSA-4096)',
    keyType: 'Hybrid PQC',
    keySize: 4096,
    expirationDate: '2028-09-30',
    daysToExpiry: 734,
    riskLevel: 'Low',
    hybridReadiness: true,
    fingerprint: 'AA:FF:44:88:CC:22:99:11:33:66',
    associatedService: 'Quantum Ingress Proxy'
  },
  {
    id: 'CERT-005',
    name: 'sftp.legacy-partner.net',
    issuer: 'Let\'s Encrypt Authority X3',
    signatureAlgorithm: 'SHA1withRSA (Legacy)',
    keyType: 'RSA',
    keySize: 1024,
    expirationDate: '2026-10-18',
    daysToExpiry: 22,
    riskLevel: 'Critical',
    hybridReadiness: false,
    fingerprint: '88:77:66:55:44:33:22:11:00:FF',
    associatedService: 'Partner SFTP Server'
  }
];

export const MOCK_MIGRATION_PHASES: MigrationPhase[] = [
  {
    id: 1,
    title: 'Phase 1: Discovery & Crypto Asset Inventory',
    subtitle: 'Identify 100% of cryptographic algorithms, keys, certificates, and hardcoded ciphers across source code & infrastructure.',
    targetWindow: 'Q4 2025 - Q1 2026',
    status: 'Completed',
    progress: 100,
    tasks: [
      { id: 'T1-1', title: 'Scan all enterprise Git repositories for RSA, ECC, and SHA-1 dependencies', category: 'Confirmed', completed: true, priority: 'Critical', assignedTeam: 'SecOps' },
      { id: 'T1-2', title: 'Inventory public and private TLS certificates across cloud endpoints', category: 'Confirmed', completed: true, priority: 'High', assignedTeam: 'Cloud Infra' },
      { id: 'T1-3', title: 'Map cryptographic data flows from ingress gateways to backend storage vaults', category: 'Probable', completed: true, priority: 'Medium', assignedTeam: 'Architecture' }
    ]
  },
  {
    id: 2,
    title: 'Phase 2: Risk Reduction & Deprecated Algorithm Sunsetting',
    subtitle: 'Eliminate legacy vulnerable primitives (SHA-1, 1024-bit RSA, TLS 1.0/1.1) to immediately reduce Shor\'s algorithm exposure.',
    targetWindow: 'Q2 2026 - Q3 2026',
    status: 'In Progress',
    progress: 68,
    tasks: [
      { id: 'T2-1', title: 'Deprecate SHA1withRSA in payment-token-vault-api and force SHA-384', category: 'Confirmed', completed: true, priority: 'Critical', assignedTeam: 'Payment Engineering' },
      { id: 'T2-2', title: 'Replace 2048-bit RSA keys in azure-auth-gateway-service with hybrid certificates', category: 'Confirmed', completed: false, priority: 'Critical', assignedTeam: 'Identity Team' },
      { id: 'T2-3', title: 'Update BouncyCastle library dependency to version >=1.78 in Java microservices', category: 'Probable', completed: true, priority: 'High', assignedTeam: 'DevOps' }
    ]
  },
  {
    id: 3,
    title: 'Phase 3: Crypto Abstraction & Provider Decoupling',
    subtitle: 'Introduce ICryptoProvider abstraction interfaces so cryptographic primitives can be hot-swapped without altering business logic.',
    targetWindow: 'Q4 2026 - Q1 2027',
    status: 'Upcoming',
    progress: 25,
    tasks: [
      { id: 'T3-1', title: 'Implement Crypto Agility SDK wrapper across core microservice templates', category: 'Confirmed', completed: false, priority: 'High', assignedTeam: 'Core Platform' },
      { id: 'T3-2', title: 'Refactor direct OpenSSL calls in C++ auth modules into Provider abstraction', category: 'Uncertain', completed: false, priority: 'Medium', assignedTeam: 'SecOps' }
    ]
  },
  {
    id: 4,
    title: 'Phase 4: Hybrid PQC Protocol Validation',
    subtitle: 'Deploy dual-algorithm key encapsulation (X25519 + ML-KEM-768) and composite signatures (Dilithium + RSA).',
    targetWindow: 'Q2 2027 - Q3 2027',
    status: 'Upcoming',
    progress: 0,
    tasks: [
      { id: 'T4-1', title: 'Validate ML-KEM-768 key exchange performance under high TLS connection load', category: 'Confirmed', completed: false, priority: 'High', assignedTeam: 'Performance Team' },
      { id: 'T4-2', title: 'Conduct compatibility testing with external partner systems and web browsers', category: 'Probable', completed: false, priority: 'Medium', assignedTeam: 'QA / Security' }
    ]
  },
  {
    id: 5,
    title: 'Phase 5: Full Post-Quantum Deployment Readiness',
    subtitle: 'Achieve complete post-quantum cryptography readiness for all regulatory, financial, and cloud standards.',
    targetWindow: 'Q4 2027 - Q1 2028',
    status: 'Upcoming',
    progress: 0,
    tasks: [
      { id: 'T5-1', title: 'Finalize CISO audit sign-off for NIST FIPS 203, 204, and 205 compliance', category: 'Confirmed', completed: false, priority: 'Critical', assignedTeam: 'Compliance & Legal' },
      { id: 'T5-2', title: 'Decommission legacy non-agile cryptographic key stores and HSM slots', category: 'Probable', completed: false, priority: 'High', assignedTeam: 'Cloud Infra' }
    ]
  }
];

export const CRYPTO_LAB_PROVIDERS: Record<string, CryptoProviderDetails> = {
  'RSA Provider': {
    id: 'RSA Provider',
    name: 'RSA-2048 Cryptographic Provider',
    algorithm: 'RSA / PKCS#1 v1.5',
    keyExchange: 'RSA Key Encapsulation (Legacy)',
    signature: 'SHA256withRSA',
    quantumSafetyScore: 12, // Vulnerable
    keySizeBits: 2048,
    signatureSizeBytes: 256,
    latencyMs: 1.4,
    pqcStandards: 'Vulnerable to Shor\'s Algorithm (Quantum Breakthrough Risk)',
    sampleCode: `// Legacy RSA-2048 Implementation
const provider = new RSACryptoProvider({ keyBits: 2048 });

// Business Logic
const data = Buffer.from("Sensitive Payment Transaction");
const signature = await provider.sign(data, privateKey);
const isValid = await provider.verify(data, signature, publicKey);`
  },
  'ECC Provider': {
    id: 'ECC Provider',
    name: 'NIST ECDSA P-256 Provider',
    algorithm: 'ECDSA / secp256r1',
    keyExchange: 'ECDH (Elliptic Curve Diffie-Hellman)',
    signature: 'ECDSA-P256-SHA256',
    quantumSafetyScore: 28, // Vulnerable
    keySizeBits: 256,
    signatureSizeBytes: 64,
    latencyMs: 0.6,
    pqcStandards: 'Vulnerable to Shor\'s Algorithm on Quantum Computers',
    sampleCode: `// Standard Elliptic Curve P-256 Implementation
const provider = new ECCCryptoProvider({ curve: 'secp256r1' });

// Business Logic remains unchanged!
const data = Buffer.from("Sensitive Payment Transaction");
const signature = await provider.sign(data, privateKey);
const isValid = await provider.verify(data, signature, publicKey);`
  },
  'Hybrid Provider': {
    id: 'Hybrid Provider',
    name: 'Composite Dual-Mode Provider (RSA-4096 + ML-KEM-768)',
    algorithm: 'Composite Dual-Mode Cryptography',
    keyExchange: 'X25519 + ML-KEM-768 (Kyber)',
    signature: 'Dilithium3 + RSA-4096 Composite',
    quantumSafetyScore: 88, // High Safety
    keySizeBits: 4096,
    signatureSizeBytes: 2750,
    latencyMs: 2.1,
    pqcStandards: 'NIST FIPS 203 (ML-KEM) + Traditional Fallback Compliance',
    sampleCode: `// Hybrid Crypto-Agility Provider
const provider = new HybridCryptoProvider({
  classical: new RSACryptoProvider({ keyBits: 4096 }),
  postQuantum: new MLKEMCryptoProvider({ parameterSet: '768' })
});

// Business Logic remains 100% identical!
const data = Buffer.from("Sensitive Payment Transaction");
const signature = await provider.sign(data, privateKey);
const isValid = await provider.verify(data, signature, publicKey);`
  },
  'Post-Quantum Provider': {
    id: 'Post-Quantum Provider',
    name: 'NIST Native PQC Provider (ML-KEM / ML-DSA)',
    algorithm: 'ML-KEM-768 & ML-DSA-65 (Dilithium)',
    keyExchange: 'ML-KEM-768 (NIST FIPS 203)',
    signature: 'ML-DSA-65 (NIST FIPS 204)',
    quantumSafetyScore: 99, // Maximum Quantum Security
    keySizeBits: 1184,
    signatureSizeBytes: 3293,
    latencyMs: 1.1,
    pqcStandards: 'Full NIST FIPS 203 & FIPS 204 Standardized Compliance',
    sampleCode: `// Native Post-Quantum Cryptography Provider
const provider = new PostQuantumProvider({
  kemScheme: 'ML-KEM-768', // FIPS 203
  dsaScheme: 'ML-DSA-65'   // FIPS 204
});

// Hot-swapped Provider executing seamless operation!
const data = Buffer.from("Sensitive Payment Transaction");
const signature = await provider.sign(data, privateKey);
const isValid = await provider.verify(data, signature, publicKey);`
  }
};
