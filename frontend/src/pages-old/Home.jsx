import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Video, ShieldCheck, Heart, ArrowRight, Activity, Users, Star, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Visual Glow Blobs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-teal-400/10 dark:bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide">
              <Activity size={14} className="animate-pulse" />
              24/7 Telemedicine Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              Your Health, <br />
              <span className="text-teal-600 dark:text-teal-400">Our Priority.</span> Anywhere.
            </h1>
            <p className="text-base sm:text-lg text-slate-655 dark:text-slate-355 max-w-xl">
              Connect instantly with board-certified medical professionals from the comfort of your home. Consult via real-time chat, video sessions, check symptoms using AI, and manage prescriptions securely.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md shadow-teal-500/10 hover:shadow-teal-500/25 flex items-center gap-2 group"
              >
                Get Started Today
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="px-6 py-3 text-sm font-bold border border-slate-250 dark:border-slate-700 text-slate-705 dark:text-slate-305 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>

          {/* Hero Decorative Card Panel */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/70 dark:bg-slate-850/70 border border-slate-200/50 dark:border-slate-700/50 shadow-xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Heart size={20} className="fill-current text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold leading-none">AI Symptom Diagnostic</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">Medical Report Summary</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full">Active</span>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Identified Condition:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Common Cold / Flu</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Recommended Specialist:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">General Physician</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Urgency Assessment:</span>
                  <span className="font-bold text-amber-500">Medium</span>
                </div>
              </div>

              <div className="flex justify-center border-t border-slate-100 dark:border-slate-700/40 pt-4">
                <Link to="/login" className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">
                  Try out the AI Symptom Checker
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="bg-white dark:bg-slate-850 border-y border-slate-200/50 dark:border-slate-850/50 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-650 dark:text-teal-400">15K+</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400">Happy Patients Served</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-650 dark:text-teal-400">500+</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400">Verified Doctors</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-650 dark:text-teal-400">24/7</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400">Consultation Availability</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-650 dark:text-teal-400">99.8%</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400">Positive Feedback</p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
            Complete Digital Health Infrastructure
          </h2>
          <p className="text-sm text-slate-655 dark:text-slate-355 leading-relaxed">
            Discover a comprehensive collection of advanced medical features designed to bring professional clinic experiences right into your web browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Calendar size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-105">Instant Booking</h3>
            <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
              Browse doctor specializations, filter by experience or fees, check calendar availabilities, and lock in appointments instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Video size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-105">Chat & Video Call</h3>
            <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
              Consult doctors via live Socket.io messaging and initiate secure WebRTC video sessions for face-to-face health checkups.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-105">Secure Prescriptions</h3>
            <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
              Doctors write digital prescriptions with detailed medicine dosages, and patients download professional signed PDFs instantly.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-100 dark:bg-slate-850/50 border-t border-slate-200/40 dark:border-slate-800/40 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">How It Works</h2>
            <p className="text-sm text-slate-450 dark:text-slate-400">Get quality medical advice in four simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md">1</div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Create Account</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400">Register as a patient, specify your contact details and securely log in.</p>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-650 text-white font-bold flex items-center justify-center text-sm shadow-md">2</div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Find Specialist</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400">Search verified doctors by specialization, filter schedule availability slots.</p>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-650 text-white font-bold flex items-center justify-center text-sm shadow-md">3</div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Consult Live</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400">Book appointment, chat with doctors instantly or start a live video call session.</p>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-650 text-white font-bold flex items-center justify-center text-sm shadow-md">4</div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Get Rx PDF</h4>
              <p className="text-xs text-slate-450 dark:text-slate-400">Download digital prescriptions signed by doctor or upload medical history files.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <p>&copy; {new Date().getFullYear()} TeleMedicare. All rights reserved. Built for modern digital telehealth care.</p>
      </footer>
    </div>
  );
};

export default Home;
