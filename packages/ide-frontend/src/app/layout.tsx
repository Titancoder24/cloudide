import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LLM-IDE — Cloud IDE for AI',
  description:
    'A cloud-based IDE built for the Node.js ecosystem that acts as a universal backend for every AI coding tool.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen overflow-hidden bg-[#1e1e1e] text-[#cccccc]">
        {children}
      </body>
    </html>
  );
}
