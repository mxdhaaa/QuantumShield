"""Legacy Gateway Service.
Contains legacy cryptography (DSA-1024, MD5) for backwards compatibility with legacy banking hosts.
"""
import hashlib
from cryptography.hazmat.primitives.asymmetric import dsa

class LegacyGateway:
    def __init__(self):
        # Generate legacy 1024-bit DSA key (Vulnerable to classical and quantum cryptanalysis)
        self.dsa_params = dsa.generate_parameters(key_size=1024)
        self.dsa_key = self.dsa_params.generate_private_key()

    def generate_legacy_checksum(self, payload: str) -> str:
        """MD5 Checksum (Classically broken)."""
        return hashlib.md5(payload.encode()).hexdigest()
