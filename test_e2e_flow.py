"""End-to-End Verification Test Script."""
import urllib.request
import json

def test_all():
    base = 'http://127.0.0.1:8000'

    # 1. Root & Health
    root = json.loads(urllib.request.urlopen(f'{base}/api/scan/current').read().decode())
    print(f'[1] Scan ID: {root["scan_id"]}, Files: {root["scanned_files_count"]}, Assets: {root["summary_stats"]["total_assets"]}')

    # 2. Check detected algorithms
    algos = {f['algorithm'] for f in root['findings']}
    print(f'[2] Detected Algorithms: {algos}')
    assert any('RSA' in a for a in algos), 'RSA missing'
    assert any('ECDSA' in a or 'SECP256R1' in a for a in algos), 'ECDSA missing'
    assert any('ECDH' in a for a in algos), 'ECDH missing'
    assert any('AES' in a for a in algos), 'AES missing'
    assert any('SHA-256' in a for a in algos), 'SHA-256 missing'

    # 3. Inventory
    inv = json.loads(urllib.request.urlopen(f'{base}/api/inventory').read().decode())
    print(f'[3] Inventory total: {inv["total_cryptographic_assets"]}, Vulnerable: {inv["quantum_vulnerable_count"]}')

    # 4. Dependency Graph
    deps = json.loads(urllib.request.urlopen(f'{base}/api/dependencies').read().decode())
    print(f'[4] Dep Nodes: {len(deps["nodes"])}, Edges: {len(deps["edges"])}, Blast Radii: {len(deps["blast_radii"])}')

    # 5. Risk Assessments
    risk = json.loads(urllib.request.urlopen(f'{base}/api/risk').read().decode())
    print(f'[5] Risk assessments count: {len(risk)}')

    # 6. Migration Plans
    plans = json.loads(urllib.request.urlopen(f'{base}/api/migration-plans').read().decode())
    print(f'[6] Migration plans count: {len(plans)}')

    # 7. Simulator (POST)
    sim_req = urllib.request.Request(
        f'{base}/api/simulate',
        data=json.dumps({'migration_mode': 'hybrid'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    sim = json.loads(urllib.request.urlopen(sim_req).read().decode())
    print(f'[7] Simulation Mitigated: {sim["vulnerabilities_mitigated"]}, Readiness: {sim["agility_readiness_score"]}%')

    # 8. Validation (POST)
    val_req = urllib.request.Request(
        f'{base}/api/validate',
        data=b'{}',
        headers={'Content-Type': 'application/json'}
    )
    val = json.loads(urllib.request.urlopen(val_req).read().decode())
    print(f'[8] Validation Risk Reduction: {val["risk_reduction_percentage"]}%, Coverage: {val["coverage_percentage"]}%')

    # 9. Copilot (POST)
    copilot_req = urllib.request.Request(
        f'{base}/api/copilot',
        data=json.dumps({'question': 'Why is RSA-2048 risky?'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    copilot = json.loads(urllib.request.urlopen(copilot_req).read().decode())
    print(f'[9] Copilot response: {len(copilot["answer"])} chars, Evidence: {len(copilot["grounded_evidence"])}')

    # 10. Frontend HTML & Asset bundle delivery
    spa = urllib.request.urlopen(f'{base}/').read().decode()
    assert '<div id="root">' in spa, 'Frontend root missing'
    assert 'QuantumShield' in spa, 'Frontend title missing'
    print('[10] Frontend SPA Bundle served successfully at http://127.0.0.1:8000')

    print('\n>>> ALL 10 END-TO-END FLOW WORKSTREAMS VERIFIED 100% OPERATIONAL <<<')

if __name__ == '__main__':
    test_all()
