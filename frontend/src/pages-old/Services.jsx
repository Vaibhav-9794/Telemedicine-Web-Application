import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Activity, Brain, User, Sparkles, Smile, ShieldAlert, FileDigit, CalendarDays } from 'lucide-react';
import Navbar from '../components/Navbar';

const Services = () => {
  const specialties = [
    {
      title: 'General Physician',
      description: 'Consult for common ailments, cold/flu, fevers, general fatigue, health guidance, and wellness checkups.',
      icon: Smile,
      color: 'text-emerald-500 bg-emerald-550/10'
    },
    {
      title: 'Cardiology',
      description: 'Expert consultation for chest pain, heart rate abnormalities, palpitations, high blood pressure, and vascular concerns.',
      icon: Heart,
      color: 'text-rose-500 bg-rose-550/10'
    },
    {
      title: 'Neurology',
      description: 'Consult for persistent migraines, dizziness, tremors, neurological symptoms, numbness, or cognitive concerns.',
      icon: Brain,
      color: 'text-indigo-500 bg-indigo-550/10'
    },
    {
      title: 'Dermatology',
      description: 'Consult for skin rashes, itching, acne, eczema, dermatitis, allergies, skin lesions, or cosmetic concerns.',
      icon: Sparkles,
      color: 'text-pink-500 bg-pink-550/10'
    },
    {
      title: 'Gastroenterology',
      description: 'Diagnosis and support for stomach pain, acid reflux, heartburn, IBS, nausea, food poisoning, or indigestion.',
      icon: Activity,
      color: 'text-teal-500 bg-teal-550/10'
    },
    {
      title: 'Psychiatry',
      description: 'Professional support for anxiety disorders, chronic stress, mood swings, clinical depression, and general mental well-being.',
      icon: User,
      color: 'text-amber-500 bg-amber-550/10'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />

      <section className="py-16 max-w-7xl mx-auto px-6 space-y-12 flex-1">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Our Medical Specializations
          </h1>
          <p className="text-sm text-slate-655 dark:text-slate-355 leading-relaxed">
            We offer expert virtual consultations across several core clinical disciplines, connecting you to certified specialists immediately.
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialties.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <div 
                key={i} 
                className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${spec.color}`}>
                  <Icon size={22} className="shrink-0" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{spec.title}</h3>
                <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
                  {spec.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="p-8 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-150 dark:border-teal-900/30 text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            Need Immediate Care or Have a Quick Symptom Query?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Our AI Symptom Checker is always online. Describe your symptoms to receive instant suggestions on which specialist fits your condition.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm"
            >
              Consult a Specialist Now
            </Link>
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

export default Services;
