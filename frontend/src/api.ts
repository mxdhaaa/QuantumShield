import { ScanResult, SimulationReport, ValidationComparison, CopilotAnswer } from './types';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function fetchCurrentScan(): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/scan/current`);
  if (!res.ok) throw new Error(`Scan request failed: ${res.statusText}`);
  return res.json();
}

export async function runScan(repoPath?: string): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_path: repoPath })
  });
  if (!res.ok) throw new Error(`Scan execution failed: ${res.statusText}`);
  return res.json();
}

export async function runSimulation(findingIds?: string[], migrationMode: string = 'hybrid'): Promise<SimulationReport> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finding_ids: findingIds, migration_mode: migrationMode })
  });
  if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
  return res.json();
}

export async function runValidation(): Promise<ValidationComparison> {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Validation failed: ${res.statusText}`);
  return res.json();
}

export async function askCopilot(question: string, selectedFindingId?: string): Promise<CopilotAnswer> {
  const res = await fetch(`${API_BASE}/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, selected_finding_id: selectedFindingId })
  });
  if (!res.ok) throw new Error(`Copilot request failed: ${res.statusText}`);
  return res.json();
}

export async function exportScanData(): Promise<any> {
  const res = await fetch(`${API_BASE}/export`);
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
  return res.json();
}
