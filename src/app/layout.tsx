import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { StoreProvider } from '@/lib/store';
import { Navigation } from '@/components/Navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TeachQL — Multi-Class SQL Learning & Assessment Platform',
  description: 'Production-ready SQL learning, practice, testing, and analytics platform for faculty and students.',
  icons: {
    icon: [
      { url: '/logo.png?v=3', type: 'image/png' },
      { url: '/icon.png?v=3', type: 'image/png' },
      { url: '/favicon.ico?v=3', sizes: 'any' },
    ],
    shortcut: '/logo.png?v=3',
    apple: '/logo.png?v=3',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png?v=3" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=3" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <StoreProvider>
          <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
            <Navigation />
          </Suspense>
          <main className="flex-1">
            <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
