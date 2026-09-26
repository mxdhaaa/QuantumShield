"""Data Vault Persistent Storage.
Uses AES-256-GCM symmetric encryption for data at rest.
"""
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class DataVault:
    def __init__(self):
        # 256-bit AES key (Quantum-resistant: 128-bit post-Grover margin)
        self.master_key = AESGCM.generate_key(bit_length=256)
        self.aesgcm = AESGCM(self.master_key)

    def encrypt_record(self, plaintext: bytes, associated_data: bytes = b"") -> bytes:
        """Encrypts database record with AES-256-GCM."""
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, plaintext, associated_data)
        return nonce + ciphertext

    def decrypt_record(self, encrypted_payload: bytes, associated_data: bytes = b"") -> bytes:
        """Decrypts database record."""
        nonce = encrypted_payload[:12]
        ciphertext = encrypted_payload[12:]
        return self.aesgcm.decrypt(nonce, ciphertext, associated_data)
