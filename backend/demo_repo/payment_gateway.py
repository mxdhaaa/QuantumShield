"""Payment & B2B Transaction Gateway.
Uses ECDSA with SECP256R1 (P-256) curve for digital transaction signing.
"""
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
import json

class PaymentGateway:
    def __init__(self):
        # Generate SECP256R1 ECDSA private key for high-throughput transaction signing
        self.signing_key = ec.generate_private_key(ec.SECP256R1())
        self.verifying_key = self.signing_key.public_key()

    def sign_transaction(self, transaction_data: dict) -> bytes:
        """Signs financial payload using ECDSA P-256."""
        payload_bytes = json.dumps(transaction_data, sort_keys=True).encode('utf-8')
        signature = self.signing_key.sign(
            payload_bytes,
            ec.ECDSA(hashes.SHA256())
        )
        return signature

    def verify_transaction_signature(self, transaction_data: dict, signature: bytes) -> bool:
        """Verifies ECDSA signature."""
        payload_bytes = json.dumps(transaction_data, sort_keys=True).encode('utf-8')
        try:
            self.verifying_key.verify(
                signature,
                payload_bytes,
                ec.ECDSA(hashes.SHA256())
            )
            return True
        except Exception:
            return False
