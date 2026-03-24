export type ErrorSeverity = 'error' | 'warning' | 'info';

export type ErrorSource =
  | 'terminal'
  | 'runtime'
  | 'build'
  | 'lint'
  | 'preview'
  | 'test';

export type ErrorStatus = 'open' | 'resolved';

export interface CodeSnippet {
  before: string[];
  error_line: string;
  after: string[];
}

export interface ErrorEntry {
  id: string;
  timestamp: string;
  source: ErrorSource;
  severity: ErrorSeverity;
  type: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stack_trace?: string;
  code_snippet?: CodeSnippet;
  related_files: string[];
  status: ErrorStatus;
  resolved_by: string | null;
  occurrences: number;
  first_seen: string;
  last_seen: string;
}

export interface ErrorFilter {
  status?: ErrorStatus | 'all';
  severity?: ErrorSeverity;
  source?: ErrorSource;
  since?: string;
  file?: string;
}

export interface ErrorSummary {
  open_count: number;
  resolved_count: number;
  errors: Array<{
    id: string;
    type: string;
    file?: string;
    line?: number;
    message: string;
  }>;
  most_affected_files: Array<{ file: string; count: number }>;
}
