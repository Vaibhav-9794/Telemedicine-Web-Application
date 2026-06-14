'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useToast } from '@/context/ToastContext';
import { Mail, Phone, MapPin, Send, Clock, Loader2, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!form.name.trim()) { showToast('Please enter your name', 'warning'); return false; }
    if (!form.email.trim()) { showToast('Please enter your email', 'warning'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { showToast('Please enter a valid email address', 'warning'); return false; }
    if (!form.subject.trim()) { showToast('Please enter a subject', 'warning'); return false; }
    if (!form.message.trim()) { showToast('Please enter your message', 'warning'); return false; }
    if (form.message.trim().length < 10) { showToast('Message must be at least 10 characters', 'warning'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await axios.post('/api/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website, // honeypot field — bots fill this, humans don't see it
      });
      setSubmitted(true);
      showToast('Message sent successfully! Check your email for confirmation.', 'success');
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
      // Reset success state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send message. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <section className="pt-16">
        <div className="bg-gradient-to-br from-primary-600 to-cyan-600 py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">Contact Us</h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-6">
              {[
                { icon: Mail, title: 'Email', value: 'support@medicare.com', sub: 'We reply within 24 hours' },
                { icon: Phone, title: 'Phone', value: '+1 (555) 123-4567', sub: 'Mon-Fri 9AM-6PM EST' },
                { icon: MapPin, title: 'Address', value: '123 Health Avenue', sub: 'New York, NY 10001' },
                { icon: Clock, title: 'Hours', value: '24/7 Online Support', sub: 'Always available for urgent queries' },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{c.title}</h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">{c.value}</p>
                      <p className="text-xs text-slate-500">{c.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="p-12 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-lg text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Thank you for reaching out. We&apos;ve sent a confirmation to your email. Our team will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-lg space-y-5">
                  {/* Honeypot — hidden from humans, bots will fill it */}
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
                    aria-hidden="true"
                  />

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name <span className="text-red-500">*</span></label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email <span className="text-red-500">*</span></label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject <span className="text-red-500">*</span></label>
                    <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message <span className="text-red-500">*</span></label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us how we can help..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none" />
                    <p className="text-[11px] text-slate-400 mt-1">{form.message.length}/5000 characters</p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-slate-900 text-center">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} MediCare. All rights reserved.</p>
      </footer>
    </div>
  );
}
