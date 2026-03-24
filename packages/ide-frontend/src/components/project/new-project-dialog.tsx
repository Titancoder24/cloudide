'use client';

import { useState } from 'react';
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/lib/workspace-client';

interface Props {
  onSubmit: (template: ProjectTemplate, name: string) => void;
  onCancel: () => void;
}

export function NewProjectDialog({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('my-app');
  const [selected, setSelected] = useState<ProjectTemplate>('react');
  const [search, setSearch] = useState('');

  const filtered = PROJECT_TEMPLATES.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q));
  });

  const submit = () => onSubmit(selected, name.trim().replace(/[^a-zA-Z0-9_-]/g, '-') || 'my-app');

  return (
    <div className="flex h-screen items-center justify-center bg-ide-bg">
      <div className="w-full max-w-2xl px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ide-text">New Project</h2>
            <p className="mt-1 text-sm text-ide-text-secondary">Choose a template and name your project</p>
          </div>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-ide-text-secondary hover:bg-ide-hover hover:text-ide-text">×</button>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-ide-text-secondary">Project Name</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full rounded-md border border-ide-border bg-ide-input px-3 py-2 text-sm text-ide-text outline-none focus:border-ide-accent"
            placeholder="my-app" autoFocus
          />
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-ide-border bg-ide-input px-3 py-2 text-sm text-ide-text outline-none focus:border-ide-accent"
            placeholder="Search templates..."
          />
        </div>

        {/* Grid */}
        <div className="mb-6 grid max-h-[340px] grid-cols-3 gap-2 overflow-y-auto pr-1">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`rounded-lg border p-3 text-left transition-all ${
                selected === t.id
                  ? 'border-ide-accent bg-ide-accent-muted'
                  : 'border-ide-border bg-ide-sidebar hover:bg-ide-hover'
              }`}
            >
              <div className="mb-1 text-lg">{t.icon}</div>
              <div className="text-sm font-medium text-ide-text">{t.name}</div>
              <div className="mt-0.5 text-xs leading-snug text-ide-text-secondary">{t.description}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {t.tags.map((tag) => (
                  <span key={tag} className="rounded bg-ide-bg px-1.5 py-0.5 text-[10px] text-ide-text-secondary">{tag}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-ide-border bg-ide-bg px-4 py-2 text-sm font-medium text-ide-text hover:bg-ide-hover">
            Cancel
          </button>
          <button onClick={submit} className="rounded-md bg-ide-accent px-4 py-2 text-sm font-medium text-white hover:bg-ide-accent-hover">
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
