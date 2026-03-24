import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LLM-IDE — Cloud IDE for AI',
  description: 'A cloud-based IDE built for the Node.js ecosystem. Connect any AI coding tool via MCP.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
