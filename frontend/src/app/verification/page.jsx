'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import {
  ShieldCheck, FileText, Hash, GraduationCap, Building2,
  ArrowRight, CheckCircle, Clock, XCircle, AlertCircle,
} from 'lucide-react';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-colors duration-200';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400';

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending Review',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    description: 'Your verification documents are being reviewed by our admin team.',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    description: 'Your credentials have been verified. You are fully approved!',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    description: 'Your verification was rejected. Please update your details and resubmit.',
  },
};

export default function VerificationPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    licenseNumber: '',
    registrationNumber: '',
    degreeName: '',
    degreeUniversity: '',
    degreeYear: '',
  });
  const [status, setStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // Fetch existing verification status
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchVerification = async () => {
      try {
        const res = await axios.get('/verification');
        if (res.data) {
          setStatus(res.data.status || null);
          if (res.data.licenseNumber) setForm((p) => ({ ...p, licenseNumber: res.data.licenseNumber }));
          if (res.data.registrationNumber) setForm((p) => ({ ...p, registrationNumber: res.data.registrationNumber }));
          if (res.data.degree) {
            setForm((p) => ({
              ...p,
              degreeName: res.data.degree.name || '',
              degreeUniversity: res.data.degree.university || '',
              degreeYear: res.data.degree.year || '',
            }));
          }
        }
      } catch {
        // No existing verification — that's fine
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [isAuthenticated, user]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.licenseNumber.trim()) return showToast('License number is required', 'warning');
    if (!form.registrationNumber.trim()) return showToast('Registration number is required', 'warning');
    if (!form.degreeName.trim()) return showToast('Degree name is required', 'warning');

    setSubmitting(true);
    try {
      await axios.post('/verification', {
        licenseNumber: form.licenseNumber,
        registrationNumber: form.registrationNumber,
        degree: {
          name: form.degreeName,
          university: form.degreeUniversity,
          year: form.degreeYear,
        },
      });
      setStatus('pending');
      showToast('Verification submitted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentStatus = status ? statusConfig[status] : null;
  const StatusIcon = currentStatus?.icon || AlertCircle;

  return (
    <Sidebar>
      <div className="max-w-2xl mx-auto animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Doctor Verification
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Verify your medical credentials to start practicing
            </p>
          </div>
        </div>

        {/* Status Banner */}
        {currentStatus && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border mb-6 animate-fadeIn ${currentStatus.bg}`}>
            <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${currentStatus.color}`} />
            <div>
              <p className={`font-semibold text-sm ${currentStatus.color}`}>{currentStatus.label}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{currentStatus.description}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          /* Verification Form */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* License & Registration */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    License Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Medical License Number *</label>
                    <div className="relative">
                      <Hash className={iconClass} />
                      <input
                        type="text"
                        value={form.licenseNumber}
                        onChange={(e) => update('licenseNumber', e.target.value)}
                        placeholder="e.g. MCI-12345"
                        className={inputClass}
                        disabled={status === 'approved'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Registration Number *</label>
                    <div className="relative">
                      <Hash className={iconClass} />
                      <input
                        type="text"
                        value={form.registrationNumber}
                        onChange={(e) => update('registrationNumber', e.target.value)}
                        placeholder="e.g. REG-67890"
                        className={inputClass}
                        disabled={status === 'approved'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Degree Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Degree Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Degree Name *</label>
                    <div className="relative">
                      <GraduationCap className={iconClass} />
                      <input
                        type="text"
                        value={form.degreeName}
                        onChange={(e) => update('degreeName', e.target.value)}
                        placeholder="e.g. MBBS, MD, MS"
                        className={inputClass}
                        disabled={status === 'approved'}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>University / Institution</label>
                      <div className="relative">
                        <Building2 className={iconClass} />
                        <input
                          type="text"
                          value={form.degreeUniversity}
                          onChange={(e) => update('degreeUniversity', e.target.value)}
                          placeholder="e.g. AIIMS Delhi"
                          className={inputClass}
                          disabled={status === 'approved'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Year of Completion</label>
                      <div className="relative">
                        <Hash className={iconClass} />
                        <input
                          type="number"
                          value={form.degreeYear}
                          onChange={(e) => update('degreeYear', e.target.value)}
                          placeholder="e.g. 2020"
                          min="1950"
                          max={new Date().getFullYear()}
                          className={inputClass}
                          disabled={status === 'approved'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              {status !== 'approved' && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{status === 'rejected' ? 'Resubmit Verification' : 'Submit for Verification'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
