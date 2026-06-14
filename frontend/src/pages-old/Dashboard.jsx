import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'patient') {
    return <PatientDashboard />;
  }
  if (user.role === 'doctor') {
    return <DoctorDashboard />;
  }
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="p-8 text-center text-rose-500 font-bold">
      Error: Unauthorized role detected. Please log out.
    </div>
  );
};

export default Dashboard;
