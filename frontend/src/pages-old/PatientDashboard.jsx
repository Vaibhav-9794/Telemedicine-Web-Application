import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, FileText, Activity, Search, ShieldCheck, Download, Clock } from 'lucide-react';
import Spinner from '../components/Spinner';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [apptRes, presRes, reportRes] = await Promise.all([
          axios.get('/appointments/patient'),
          axios.get('/prescriptions'),
          axios.get('/reports/patient')
        ]);
        setAppointments(apptRes.data);
        setPrescriptions(presRes.data);
        setReportsCount(reportRes.data.length);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [addToast]);

  const handleDownload = async (presId) => {
    try {
      addToast('Preparing PDF download...', 'info');
      // Fetch binary data
      const res = await axios.get(`/prescriptions/${presId}/download`, {
        responseType: 'blob'
      });
      
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `prescription-${presId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Download completed!', 'success');
    } catch (error) {
      console.error('PDF download error:', error);
      addToast('Failed to download prescription PDF', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Find next upcoming appointment
  const upcomingAppts = appointments.filter(a => ['pending', 'accepted'].includes(a.status));
  const nextAppt = upcomingAppts.length > 0 ? upcomingAppts[upcomingAppts.length - 1] : null;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Patient Overview</h2>
        <p className="text-xs text-slate-400 font-medium">Monitor your health history, schedules, and active prescriptions</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Active Appointments</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{upcomingAppts.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-550/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Prescriptions Issued</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{prescriptions.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Medical Reports</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{reportsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-550/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Next Appointment Card (Left Column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Next Consultation</h3>
            
            {nextAppt ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center font-bold text-teal-700 dark:text-teal-400 uppercase text-xs">
                    {nextAppt.doctorId?.userId?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Dr. {nextAppt.doctorId?.userId?.name || 'Physician'}
                    </h4>
                    <span className="text-[10px] text-teal-650 dark:text-teal-400 font-semibold block capitalize">
                      {nextAppt.doctorId?.specialization}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl space-y-2 text-xs border border-slate-100 dark:border-slate-750/30">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-semibold">{new Date(nextAppt.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="font-semibold">{nextAppt.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      nextAppt.status === 'accepted'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400'
                    }`}>
                      {nextAppt.status}
                    </span>
                  </div>
                </div>

                <Link
                  to="/chat"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Open Chat Room
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                <Clock className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={24} />
                No upcoming appointments.
                <Link to="/doctors" className="text-teal-650 dark:text-teal-400 font-bold block mt-2 hover:underline">
                  Find a Doctor & Book Slot
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Link
                to="/symptom-checker"
                className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200/30 dark:border-slate-700/30 flex flex-col items-center gap-2"
              >
                <Activity size={20} className="text-teal-600 dark:text-teal-400" />
                <span className="text-[10px] font-bold text-slate-750 dark:text-slate-305">AI Diagnosis</span>
              </Link>

              <Link
                to="/doctors"
                className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200/30 dark:border-slate-700/30 flex flex-col items-center gap-2"
              >
                <Search size={20} className="text-teal-600 dark:text-teal-400" />
                <span className="text-[10px] font-bold text-slate-750 dark:text-slate-305">Search Doctors</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Prescriptions List (Right Column) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Digital Prescriptions</h3>
          
          {prescriptions.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
              {prescriptions.slice(0, 5).map((pres) => (
                <div key={pres._id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-850 dark:text-slate-200">
                      Dr. {pres.doctorId?.userId?.name || 'Physician'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {pres.doctorId?.specialization || 'General Health'} | Date: {new Date(pres.createdAt || pres.date).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-655 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                      Medicines: {pres.medicineDetails?.map(m => m.name).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(pres._id)}
                    className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-600 dark:text-teal-400 transition-colors border border-teal-100/30 dark:border-teal-900/20 shrink-0"
                    title="Download PDF Prescription"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <FileText className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={32} />
              No prescriptions found in your account history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
