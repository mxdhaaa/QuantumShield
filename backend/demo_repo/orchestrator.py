"""Enterprise Core Orchestrator.
Coordinates requests across authentication, payment, tls channel, and data vault.
"""
from backend.demo_repo.auth_service import AuthService
from backend.demo_repo.payment_gateway import PaymentGateway
from backend.demo_repo.tls_channel import SecureTLSChannel
from backend.demo_repo.data_vault import DataVault
from backend.demo_repo.integrity_service import IntegrityService
from backend.demo_repo.legacy_gateway import LegacyGateway

class CoreOrchestrator:
    def __init__(self):
        self.auth = AuthService()
        self.payment = PaymentGateway()
        self.tls = SecureTLSChannel()
        self.vault = DataVault()
        self.integrity = IntegrityService()
        self.legacy = LegacyGateway()

    def process_transaction_flow(self, user_id: str, amount: float, recipient: str):
        # 1. Issue auth token
        token = self.auth.issue_user_token(user_id, ["user", "payer"])
        
        # 2. Verify token
        claims = self.auth.verify_user_token(token)
        
        # 3. Sign payment payload
        tx = {"user": user_id, "amount": amount, "to": recipient}
        sig = self.payment.sign_transaction(tx)
        
        # 4. Encrypt for vault
        vault_rec = self.vault.encrypt_record(str(tx).encode())
        
        # 5. Compute audit trail
        audit_hash = self.integrity.compute_audit_hash(f"TX:{user_id}:{amount}:{recipient}")
        
        return {
            "status": "success",
            "token_verified": claims["sub"] == user_id,
            "signature_valid": self.payment.verify_transaction_signature(tx, sig),
            "vault_payload_len": len(vault_rec),
            "audit_hash": audit_hash
        }
