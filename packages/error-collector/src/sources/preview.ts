import type { RawError } from '../normalizer.js';

interface BrowserErrorEvent {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: { stack?: string };
}

/**
 * Parse browser console errors from the preview iframe.
 * These arrive via postMessage from a Service Worker bridge or window.onerror hook.
 */
export function parsePreviewError(event: BrowserErrorEvent): RawError {
  return {
    source: 'preview',
    severity: 'error',
    type: 'PreviewError',
    message: event.message,
    file: event.filename,
    line: event.lineno,
    column: event.colno,
    stack_trace: event.error?.stack,
  };
}
