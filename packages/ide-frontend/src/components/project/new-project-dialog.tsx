'use client';

import { useState } from 'react';
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/lib/workspace-client';
import { useTheme } from '@/lib/theme';

interface Props {
  onSubmit: (template: ProjectTemplate, name: string) => void;
  onCancel: () => void;
}

export function NewProjectDialog({ onSubmit, onCancel }: Props) {
  const { c } = useTheme();
  const [name, setName] = useState('my-app');
  const [selected, setSelected] = useState<ProjectTemplate>('react');
  const [search, setSearch] = useState('');

  const filtered = PROJECT_TEMPLATES.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q));
  });

  const handleSubmit = () => {
    const safeName = name.trim().replace(/[^a-zA-Z0-9_-]/g, '-') || 'my-app';
    onSubmit(selected, safeName);
  };

  return (
    <div className="flex h-screen items-center justify-center" style={{ background: c.bgPrimary }}>
      <div className="w-full max-w-2xl px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: c.textPrimary }}>New Project</h2>
            <p className="mt-1 text-sm" style={{ color: c.textSecondary }}>Choose a template and name your project</p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors"
            style={{ color: c.textSecondary, background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = c.hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ×
          </button>
        </div>

        {/* Project name */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium" style={{ color: c.textSecondary }}>
            Project Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full rounded-md px-3 py-2 text-sm outline-none"
            style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textPrimary }}
            onFocus={(e) => (e.currentTarget.style.borderColor = c.accent)}
            onBlur={(e) => (e.currentTarget.style.borderColor = c.border)}
            placeholder="my-app"
            autoFocus
          />
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm outline-none"
            style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textPrimary }}
            onFocus={(e) => (e.currentTarget.style.borderColor = c.accent)}
            onBlur={(e) => (e.currentTarget.style.borderColor = c.border)}
            placeholder="Search templates..."
          />
        </div>

        {/* Template grid */}
        <div className="mb-6 grid max-h-[340px] grid-cols-3 gap-2 overflow-y-auto pr-1">
          {filtered.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelected(tmpl.id)}
              className="rounded-lg p-3 text-left transition-all"
              style={{
                background: selected === tmpl.id ? c.accentMuted : c.bgSecondary,
                border: `1px solid ${selected === tmpl.id ? c.accent : c.border}`,
              }}
              onMouseEnter={(e) => {
                if (selected !== tmpl.id) e.currentTarget.style.background = c.hoverBg;
              }}
              onMouseLeave={(e) => {
                if (selected !== tmpl.id) e.currentTarget.style.background = c.bgSecondary;
              }}
            >
              <div className="mb-1 text-lg">{tmpl.icon}</div>
              <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{tmpl.name}</div>
              <div className="mt-0.5 text-xs leading-snug" style={{ color: c.textSecondary }}>{tmpl.description}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {tmpl.tags.map((tag) => (
                  <span key={tag} className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: c.bgTertiary, color: c.textSecondary }}>
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: c.bgTertiary, color: c.textPrimary, border: `1px solid ${c.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = c.hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = c.bgTertiary)}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ background: c.accent }}
            onMouseEnter={(e) => (e.currentTarget.style.background = c.accentHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = c.accent)}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
