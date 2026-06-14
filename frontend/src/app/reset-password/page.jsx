'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import { Lock, Heart, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';

/* ─── Password Strength Helper ─────────────────────────── */
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%', textColor: 'text-red-500' };
  if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: '40%', textColor: 'text-amber-500' };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%', textColor: 'text-yellow-500' };
  if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500', width: '80%', textColor: 'text-emerald-500' };
  return { label: 'Very Strong', color: 'bg-primary-500', width: '100%', textColor: 'text-primary-500' };
}

/* ─── Inner form component (uses useSearchParams) ────── */
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) return showToast('Please enter a new password', 'warning');
    if (password.length < 6) return showToast('Password must be at least 6 characters', 'warning');
    if (password !== confirmPassword) return showToast('Passwords do not match', 'error');
    if (!token) return showToast('Invalid or missing reset token', 'error');

    setLoading(true);
    try {
      await axios.post('/auth/reset-password', { token, password });
      setSuccess(true);
      showToast('Password reset successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fadeInUp">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">MediCare</span>
      </div>

      {!success ? (
        <>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Create New Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your new password must be different from your previously used password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Password Strength</span>
                    <span className={`text-xs font-semibold ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} rounded-full transition-all duration-500 ease-out`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {[
                      { test: password.length >= 6, label: 'At least 6 characters' },
                      { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
                      { test: /[0-9]/.test(password), label: 'One number' },
                      { test: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
                    ].map((req) => (
                      <p key={req.label} className={`text-xs flex items-center gap-1.5 ${req.test ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <CheckCircle className={`w-3 h-3 ${req.test ? 'opacity-100' : 'opacity-40'}`} />
                        {req.label}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5 animate-fadeIn">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* Success state */
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Password Reset!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300"
          >
            <span>Go to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        <Link
          href="/login"
          className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

/* ─── Page (wraps form in Suspense for useSearchParams) ── */
export default function ResetPassword() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex pt-16">
        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-600 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="relative text-center text-white max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4">Secure Reset</h2>
            <p className="text-primary-100 text-lg leading-relaxed">
              Create a strong, unique password to keep your account safe and secure.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <Suspense fallback={
            <div className="w-full max-w-md flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
