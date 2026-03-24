import type { ErrorEntry, ErrorSeverity, ErrorSource } from './types.js';

let errorCounter = 0;

function nextId(): string {
  errorCounter++;
  return `err_${String(errorCounter).padStart(3, '0')}`;
}

export function resetIdCounter(): void {
  errorCounter = 0;
}

export interface RawError {
  source: ErrorSource;
  severity?: ErrorSeverity;
  type?: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stack_trace?: string;
  related_files?: string[];
}

export function normalizeError(raw: RawError): ErrorEntry {
  const now = new Date().toISOString();
  return {
    id: nextId(),
    timestamp: now,
    source: raw.source,
    severity: raw.severity || 'error',
    type: raw.type || inferErrorType(raw.message, raw.source),
    message: raw.message,
    file: raw.file,
    line: raw.line,
    column: raw.column,
    stack_trace: raw.stack_trace,
    related_files: raw.related_files || [],
    status: 'open',
    resolved_by: null,
    occurrences: 1,
    first_seen: now,
    last_seen: now,
  };
}

function inferErrorType(message: string, source: ErrorSource): string {
  if (message.includes('Cannot find module')) return 'ModuleNotFound';
  if (message.includes('does not exist on type')) return 'TSError';
  if (message.includes('is not defined')) return 'ReferenceError';
  if (message.includes('SyntaxError') || message.includes('Unexpected token'))
    return 'SyntaxError';
  if (message.includes('is assigned but never used')) return 'ESLintWarning';

  const sourceTypeMap: Record<ErrorSource, string> = {
    terminal: 'ShellError',
    runtime: 'RuntimeError',
    build: 'BuildError',
    lint: 'LintError',
    preview: 'PreviewError',
    test: 'TestError',
  };
  return sourceTypeMap[source] || 'UnknownError';
}
