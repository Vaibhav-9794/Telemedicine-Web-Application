'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CallProvider } from '@/context/CallContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CallProvider>
            {children}
          </CallProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
