import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Video, Brain, Calendar, MessageSquare, FileText, Shield, Stethoscope, Pill, ArrowRight } from 'lucide-react';

const services = [
  { icon: Video, title: 'Video Consultations', desc: 'High-quality video calls with specialists for face-to-face diagnoses from home.', color: 'from-blue-500 to-blue-600' },
  { icon: Brain, title: 'AI Symptom Checker', desc: 'Get instant AI-powered analysis of your symptoms and recommended specialists.', color: 'from-purple-500 to-purple-600' },
  { icon: Calendar, title: 'Appointment Booking', desc: 'Browse available doctors, compare ratings, and book appointments instantly.', color: 'from-primary-500 to-primary-600' },
  { icon: MessageSquare, title: 'Secure Messaging', desc: 'Real-time encrypted chat with your healthcare providers anytime.', color: 'from-emerald-500 to-emerald-600' },
  { icon: FileText, title: 'Medical Records', desc: 'Upload, organize, and securely share your medical documents and test results.', color: 'from-amber-500 to-amber-600' },
  { icon: Pill, title: 'E-Prescriptions', desc: 'Receive digital prescriptions from your doctor and download them as PDFs.', color: 'from-rose-500 to-rose-600' },
  { icon: Stethoscope, title: 'Specialist Network', desc: 'Access to 500+ verified specialists across 20+ medical specializations.', color: 'from-cyan-500 to-cyan-600' },
  { icon: Shield, title: 'Data Security', desc: 'Enterprise-grade encryption and HIPAA-compliant data handling.', color: 'from-slate-500 to-slate-600' },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <section className="pt-16">
        <div className="bg-gradient-to-br from-primary-600 via-emerald-600 to-cyan-600 py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">Our Services</h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">Comprehensive healthcare solutions designed to make your medical experience seamless and efficient.</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-primary-100 mb-8">Create your free account and experience healthcare reimagined.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group">
            Sign Up Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <footer className="py-8 bg-slate-900 text-center">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} MediCare. All rights reserved.</p>
      </footer>
    </div>
  );
}
