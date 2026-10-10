export type DiagnosticEntry = {
  label: string;
  time: number;
};

export function buildDiagnosticsSession() {
  const timeline: DiagnosticEntry[] = [];
  const logs: string[] = [];

  const mark = (label: string) => {
    const entry = { label, time: performance.now() };
    timeline.push(entry);
    logs.push(`${label}@${entry.time.toFixed(0)}ms`);
    return entry.time;
  };

  const addLog = (entry: string) => {
    logs.push(entry);
  };

  return {
    mark,
    addLog,
    getTimeline: () => timeline,
    getLogs: () => logs,
  };
}

export function logRuntimeSummary(diagnostics: ReturnType<typeof buildDiagnosticsSession>) {
  const lines: string[] = [];
  lines.push('OpenRocket + CheerpJ diagnostics');
  lines.push('---');

  for (const entry of diagnostics.getTimeline()) {
    lines.push(`${entry.label}: ${entry.time.toFixed(0)}ms`);
  }

  lines.push('');
  lines.push('Log output:');
  for (const entry of diagnostics.getLogs()) {
    lines.push(`- ${entry}`);
  }

  return lines.join('\n');
}
