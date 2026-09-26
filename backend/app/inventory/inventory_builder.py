"""Cryptographic Inventory Builder and Normalizer."""
from typing import List, Dict, Any
from backend.app.models import CryptoFinding, QuantumStatus

class InventoryBuilder:
    @staticmethod
    def build_inventory(findings: List[CryptoFinding]) -> Dict[str, Any]:
        """Normalizes and groups cryptographic findings into an actionable inventory."""
        total = len(findings)
        vulnerable = [f for f in findings if f.quantum_status == QuantumStatus.VULNERABLE]
        cond_safe = [f for f in findings if f.quantum_status == QuantumStatus.CONDITIONALLY_SAFE]
        legacy_broken = [f for f in findings if f.quantum_status == QuantumStatus.LEGACY_BROKEN]
        quantum_safe = [f for f in findings if f.quantum_status == QuantumStatus.SAFE]

        by_primitive: Dict[str, int] = {}
        by_algorithm: Dict[str, int] = {}
        by_component: Dict[str, int] = {}

        for f in findings:
            by_primitive[f.primitive.value] = by_primitive.get(f.primitive.value, 0) + 1
            by_algorithm[f.algorithm] = by_algorithm.get(f.algorithm, 0) + 1
            by_component[f.component_name] = by_component.get(f.component_name, 0) + 1

        return {
            "total_cryptographic_assets": total,
            "quantum_vulnerable_count": len(vulnerable),
            "conditionally_safe_count": len(cond_safe),
            "legacy_broken_count": len(legacy_broken),
            "quantum_safe_count": len(quantum_safe),
            "primitive_distribution": by_primitive,
            "algorithm_distribution": by_algorithm,
            "component_distribution": by_component,
            "findings": [f.model_dump() for f in findings]
        }
