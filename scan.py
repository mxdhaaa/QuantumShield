"""QuantumShield AST Scanner CLI."""
import sys
import os
import json
from backend.app.scanner.ast_scanner import CryptoASTScanner

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "backend/demo_repo"
    abs_target = os.path.abspath(target)
    
    print(f"[*] QuantumShield AST Scanner running against: {abs_target}\n")
    findings = CryptoASTScanner.scan_directory(abs_target)
    
    print(f"[+] Total Cryptographic Findings: {len(findings)}\n")
    print(f"{'FILE:LINE':<25} | {'ALGORITHM':<22} | {'PRIMITIVE':<20} | {'QUANTUM STATUS':<20}")
    print("-" * 95)
    for f in findings:
        print(f"{f.file + ':' + str(f.line):<25} | {f.algorithm:<22} | {f.primitive.value:<20} | {f.quantum_status.value:<20}")
        
    print("\n[+] Full JSON Output:")
    print(json.dumps([f.model_dump() for f in findings], indent=2))

if __name__ == "__main__":
    main()
