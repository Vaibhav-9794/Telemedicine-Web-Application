'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import { Mail, Heart, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return showToast('Please enter your email', 'warning');

    setLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email });
      setSent(true);
      showToast('Reset link sent to your email!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

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
              <KeyRound className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4">Reset Password</h2>
            <p className="text-primary-100 text-lg leading-relaxed">
              Don&apos;t worry, it happens to the best of us. Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-md animate-fadeInUp">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">MediCare</span>
            </div>

            {!sent ? (
              <>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                  Forgot Password?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Enter your email address and we&apos;ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                      />
                    </div>
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
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary-500" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                  Check Your Email
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{email}</span>.
                  Please check your inbox.
                </p>
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900 mb-6">
                  <p className="text-xs text-primary-700 dark:text-primary-300">
                    Didn&apos;t receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setSent(false)}
                      className="font-semibold hover:underline"
                    >
                      try again
                    </button>.
                  </p>
                </div>
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
        </div>
      </div>
    </>
  );
}
