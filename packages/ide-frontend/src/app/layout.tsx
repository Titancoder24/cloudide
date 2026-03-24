import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LLM-IDE — Cloud IDE for AI',
  description: 'Cloud-based IDE for Node.js. Connect any AI coding tool via MCP.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-ide-bg text-ide-text">{children}</body>
    </html>
  );
}
