import Navbar from '@/components/Navbar';
import { Heart, Target, Eye, Shield, Award, Users, Globe } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Patient First', desc: 'Every decision we make puts patient health and comfort at the forefront.' },
  { icon: Shield, title: 'Privacy & Security', desc: 'Your health data is protected with enterprise-grade encryption.' },
  { icon: Award, title: 'Excellence', desc: 'We partner only with verified, highly-rated medical professionals.' },
  { icon: Globe, title: 'Accessibility', desc: 'Quality healthcare should be available to everyone, everywhere.' },
];

const team = [
  { name: 'Dr. Sarah Mitchell', role: 'Chief Medical Officer', initials: 'SM', color: 'from-primary-400 to-primary-600' },
  { name: 'Dr. James Wilson', role: 'Head of Cardiology', initials: 'JW', color: 'from-emerald-400 to-emerald-600' },
  { name: 'Dr. Priya Sharma', role: 'Neurology Specialist', initials: 'PS', color: 'from-cyan-400 to-cyan-600' },
  { name: 'Dr. Michael Chen', role: 'Pediatrics Lead', initials: 'MC', color: 'from-violet-400 to-violet-600' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-16">
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700 py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">About MediCare</h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">Transforming healthcare delivery through technology, compassion, and innovation since 2020.</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-primary-950/30 dark:to-cyan-950/30 border border-primary-100 dark:border-primary-900">
            <Target className="w-10 h-10 text-primary-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">To make quality healthcare accessible to everyone by bridging the gap between patients and healthcare professionals through innovative telemedicine solutions.</p>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900">
            <Eye className="w-10 h-10 text-emerald-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Vision</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">A world where distance is no barrier to receiving expert medical care, and every individual has access to personalized, AI-enhanced healthcare.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-center hover:shadow-lg transition-shadow">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold`}>
                  {t.initials}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.name}</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-center">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} MediCare. All rights reserved.</p>
      </footer>
    </div>
  );
}
