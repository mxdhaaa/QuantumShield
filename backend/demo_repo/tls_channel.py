"""Secure Communication Channel.
Uses ECDH (Elliptic Curve Diffie-Hellman) key exchange and TLS Context.
"""
import ssl
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

class SecureTLSChannel:
    def __init__(self):
        # Ephemeral ECDH key pair for session establishment
        self.ephemeral_key = ec.generate_private_key(ec.SECP256R1())
        self.ssl_context = ssl.create_default_context()

    def derive_shared_secret(self, peer_public_key: ec.EllipticCurvePublicKey) -> bytes:
        """Performs ECDH key agreement to compute shared secret."""
        raw_secret = self.ephemeral_key.exchange(ec.ECDH(), peer_public_key)
        
        # Derive symmetric session key via HKDF
        derived_key = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=None,
            info=b"quantumshield-tls-session"
        ).derive(raw_secret)
        
        return derived_key
