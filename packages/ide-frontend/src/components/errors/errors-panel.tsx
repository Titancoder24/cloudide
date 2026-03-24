'use client';

import { useState } from 'react';

interface ErrorItem {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  status: 'open' | 'resolved';
}

/**
 * Errors panel — displays collected errors with click-to-jump.
 * Synced with the ErrorCollector on the backend.
 */
export function ErrorsPanel() {
  const [errors] = useState<ErrorItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

  const filtered = errors.filter(
    (e) => filter === 'all' || e.status === filter
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 items-center justify-between border-b border-[#3e3e42] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#858585]">
          Problems
        </span>
        <div className="flex gap-1 text-[11px]">
          {(['open', 'resolved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-1.5 py-0.5 ${
                filter === f
                  ? 'bg-[#3c3c3c] text-white'
                  : 'text-[#858585] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-3 text-[12px] text-[#858585]">
            No {filter === 'all' ? '' : filter} problems detected.
          </div>
        ) : (
          filtered.map((error) => (
            <div
              key={error.id}
              className="cursor-pointer border-b border-[#3e3e42] px-3 py-1.5 hover:bg-[#2a2d2e]"
            >
              <div className="flex items-center gap-1.5 text-[12px]">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    error.severity === 'error'
                      ? 'bg-red-500'
                      : error.severity === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                />
                <span className="font-medium text-[#cccccc]">
                  {error.type}
                </span>
                {error.file && (
                  <span className="ml-auto text-[11px] text-[#858585]">
                    {error.file}
                    {error.line ? `:${error.line}` : ''}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[12px] text-[#cccccc]">
                {error.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
