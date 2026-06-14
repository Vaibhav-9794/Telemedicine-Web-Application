import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DnaCanvas from '@/components/DnaCanvasWrapper';
import { Shield, Video, Brain, MessageSquare, FileText, Calendar, Star, ArrowRight, Heart, Users, Clock, Award } from 'lucide-react';

const features = [
  { icon: Video, title: 'Video Consultations', desc: 'Face-to-face sessions with top specialists from the comfort of your home.' },
  { icon: Brain, title: 'AI Symptom Checker', desc: 'Get instant AI-powered analysis and doctor recommendations.' },
  { icon: Calendar, title: 'Easy Booking', desc: 'Search by specialty, view availability, and book in seconds.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Secure instant messaging with your healthcare providers.' },
  { icon: FileText, title: 'Medical Records', desc: 'Upload, store, and share your health documents securely.' },
  { icon: Shield, title: 'Prescriptions', desc: 'Receive digital prescriptions and download them as PDFs.' },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Patients' },
  { icon: Heart, value: '500+', label: 'Expert Doctors' },
  { icon: Star, value: '98%', label: 'Satisfaction' },
  { icon: Clock, value: '24/7', label: 'Availability' },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up as a patient or doctor in under a minute.' },
  { num: '02', title: 'Find Your Doctor', desc: 'Search by specialty, experience, and ratings.' },
  { num: '03', title: 'Get Treated', desc: 'Book appointments, consult online, and receive prescriptions.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-cyan-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 border border-primary-200 dark:border-primary-800">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Trusted by 10,000+ patients worldwide
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
              Healthcare{' '}
              <span className="gradient-text">Reimagined</span>
              <br />for the Modern Age
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
              Connect with world-class doctors online. Get AI-powered symptom analysis, book appointments instantly, and manage your health — all from one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 group">
                Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300">
                Learn More
              </Link>
            </div>
          </div>

          <div className="hidden lg:block h-[500px] animate-fadeIn delay-300">
            <DnaCanvas />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-8 h-8 text-primary-200 mx-auto mb-3" />
                  <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                  <div className="text-primary-200 text-sm font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">A comprehensive suite of healthcare tools designed to make your medical journey seamless.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Three simple steps to better healthcare.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center p-8">
                <div className="text-6xl font-extrabold gradient-text mb-4">{step.num}</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Ready to Transform Your Healthcare?</h2>
          <p className="text-primary-100 text-lg mb-8">Join thousands of patients who trust MediCare for their health needs.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-primary-700 font-bold bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group">
            Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">MediCare</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/about" className="hover:text-primary-400 transition-colors">About</Link>
              <Link href="/services" className="hover:text-primary-400 transition-colors">Services</Link>
              <Link href="/contact" className="hover:text-primary-400 transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} MediCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
