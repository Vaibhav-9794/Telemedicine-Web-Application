'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';

const PatientDashboard = dynamic(() => import('./PatientDashboard'), {
  loading: () => <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
});
const DoctorDashboard = dynamic(() => import('./DoctorDashboard'), {
  loading: () => <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
});
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
});

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Sidebar>
      {user.role === 'patient' && <PatientDashboard />}
      {user.role === 'doctor' && <DoctorDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </Sidebar>
  );
}
