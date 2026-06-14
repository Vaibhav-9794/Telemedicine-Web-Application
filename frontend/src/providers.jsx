'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CallProvider } from '@/context/CallContext';
import { NotificationProvider } from '@/context/NotificationContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CallProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </CallProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
