import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '../components/shared/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduManage AI — Modern Academy & School Management CMS',
  description: 'AI-Powered School and Academy Management System with Multi-Role Portals, Fee Recovery, and WhatsApp Notifications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
