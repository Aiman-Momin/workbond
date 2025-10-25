import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { AIAssistant } from '../components/AIAssistant';
import { ErrorBoundary } from '../components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Adaptive Escrow Pro - AI-Driven Smart Escrow Platform',
  description: 'Revolutionary escrow platform powered by AI that adapts contract terms based on freelancer performance. Built on Stellar blockchain with Soroban smart contracts.',
  keywords: ['escrow', 'blockchain', 'AI', 'freelance', 'stellar', 'soroban', 'smart contracts'],
  authors: [{ name: 'Adaptive Escrow Pro Team' }],
  openGraph: {
    title: 'Adaptive Escrow Pro',
    description: 'AI-driven smart escrow platform on Stellar blockchain',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adaptive Escrow Pro',
    description: 'AI-driven smart escrow platform on Stellar blockchain',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
          <AIAssistant />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
