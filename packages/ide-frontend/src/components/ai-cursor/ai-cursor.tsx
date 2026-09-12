'use client';

/**
 * AICursor component — renders a Figma-style labeled cursor
 * for an AI agent editing in the Monaco editor.
 *
 * This is rendered as an overlay on top of the Monaco editor
 * using CSS transforms for GPU-accelerated movement.
 */

export interface AICursorState {
  id: string;
  label: string;
  color: string;
  file: string;
  line: number;
  column: number;
  status: 'idle' | 'reading' | 'writing' | 'executing';
  visible: boolean;
}

interface AICursorProps {
  cursor: AICursorState;
  lineHeight: number;
  charWidth: number;
  scrollTop: number;
  scrollLeft: number;
}

export function AICursor({
  cursor,
  lineHeight,
  charWidth,
  scrollTop,
  scrollLeft,
}: AICursorProps) {
  if (!cursor.visible) return null;

  const x = (cursor.column - 1) * charWidth - scrollLeft;
  const y = (cursor.line - 1) * lineHeight - scrollTop;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: 'transform 150ms cubic-bezier(.4, 0, .2, 1)',
        zIndex: 100,
      }}
    >
      {/* Label pill */}
      <div
        className="mb-0.5 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[10px] font-medium text-white"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.label}
      </div>

      {/* Cursor bar */}
      <div
        className="ai-cursor-bar"
        style={{
          width: '2px',
          height: `${lineHeight}px`,
          backgroundColor: cursor.color,
        }}
      />
    </div>
  );
}

/**
 * Color palette for AI agents.
 */
export const AGENT_COLORS: Record<string, string> = {
  claude: '#D85A30',
  chatgpt: '#1D9E75',
  'gpt-4o': '#1D9E75',
  gemini: '#534AB7',
  copilot: '#185FA5',
  codex: '#1D9E75',
  cline: '#E06C75',
  roo: '#E5C07B',
  kilo: '#61AFEF',
};

export function getAgentColor(agentName: string): string {
  const lower = agentName.toLowerCase();
  for (const [key, color] of Object.entries(AGENT_COLORS)) {
    if (lower.includes(key)) return color;
  }
  // Hash-based color for unknown agents
  let hash = 0;
  for (let i = 0; i < agentName.length; i++) {
    hash = agentName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}
