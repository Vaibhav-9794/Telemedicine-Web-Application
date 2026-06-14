import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'MediCare — Premium Telemedicine Platform',
  description: 'Connect with top doctors online. Book appointments, chat in real-time, get AI-powered symptom analysis, and manage your health records securely.',
  keywords: 'telemedicine, healthcare, doctor, appointment, online consultation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
