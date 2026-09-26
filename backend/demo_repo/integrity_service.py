"""Integrity & Audit Trail Service.
Uses SHA-256 and SHA-512 for cryptographic hashing and immutable ledger hashes.
"""
import hashlib
from cryptography.hazmat.primitives import hashes

class IntegrityService:
    @staticmethod
    def compute_audit_hash(event_log: str) -> str:
        """Computes SHA-256 integrity hash."""
        digest = hashes.Hash(hashes.SHA256())
        digest.update(event_log.encode('utf-8'))
        return digest.finalize().hex()

    @staticmethod
    def compute_deep_ledger_hash(block_data: bytes) -> str:
        """Computes SHA-512 block hash for high-assurance storage."""
        h = hashlib.sha512(block_data)
        return h.hexdigest()
