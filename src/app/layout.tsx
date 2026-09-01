import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Sentinel — Autonomous Background Intelligence Layer',
  description: "Don't monitor everything. Let AI watch what matters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-gray-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
