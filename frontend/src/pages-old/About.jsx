import React from 'react';
import { Shield, Award, Sparkles, Smile } from 'lucide-react';
import Navbar from '../components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />

      <section className="py-16 max-w-5xl mx-auto px-6 space-y-16 flex-1 text-left">
        {/* Intro */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Redefining Healthcare Accessibility
          </h1>
          <p className="text-base sm:text-lg text-slate-655 dark:text-slate-355 leading-relaxed">
            Founded in 2026, TeleMedicare was built to bridge the gap between world-class medical specialists and patients in need of immediate, convenient care. We bring medical clinics into the digital age through WebRTC-powered high-definition video feeds, real-time message boards, and rule-based diagnostic aids.
          </p>
        </div>

        {/* Vision / Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-teal-650 dark:text-teal-400">Our Mission</h2>
            <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
              To provide immediate, reliable, and secure online medical care to anyone, anywhere. We believe quality healthcare is a fundamental human right, not a logistical privilege.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-teal-650 dark:text-teal-400">Our Vision</h2>
            <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
              A world where medical consultation is as fast and secure as sending a text. By integrating AI triage tools and remote prescription management, we aim to decrease clinical wait lines and optimize doctors' workflow.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Our Core Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Security & Privacy First</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-normal">
                  All consultations, chat data, and uploaded medical files are protected with tokenized JWT authentication and SSL secure transmission protocols.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Board-Certified Excellence</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-normal">
                  We verify each medical profile, checking qualifications, state registrations, and professional experience before giving doctors booking approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-850 py-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <p>&copy; {new Date().getFullYear()} TeleMedicare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
