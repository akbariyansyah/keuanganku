import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Keuanganku',
  description: 'A simple personal finance management app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
