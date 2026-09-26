"""QuantumShield Master Launch Script.
Starts both the FastAPI backend (Port 8000) and Vite frontend (Port 5173).
"""
import subprocess
import time
import sys
import os

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    print("==================================================")
    print("      QUANTUMSHIELD - POST-QUANTUM CRYPTO SCANNER")
    print("==================================================")
    print("Starting FastAPI Backend...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=base_dir
    )

    print("Starting React Frontend...")
    frontend_dir = os.path.join(base_dir, "frontend")
    frontend_proc = subprocess.Popen(
        ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"],
        cwd=frontend_dir
    )

    print("\n[+] QuantumShield Backend running at: http://127.0.0.1:8000")
    print("[+] QuantumShield Frontend running at: http://localhost:5173\n")
    print("Press Ctrl+C to terminate both servers.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping QuantumShield...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
