'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import { Activity, ShieldAlert, Sparkles, ArrowRight, CornerDownRight, RotateCcw } from 'lucide-react';

// Lazy load Three.js anatomy canvas — defers ~200KB from critical path
const AnatomyCanvas = dynamic(() => import('@/components/AnatomyCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
      <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
    </div>
  ),
});

export default function SymptomCheckerPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [symptoms, setSymptoms] = useState('');
  const [checkerLoading, setCheckerLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleRegionClick = useCallback((regionName, keywords) => {
    setSymptoms((prev) => {
      const current = prev.trim();
      if (!current) return keywords;
      // Check if keywords are already present to avoid duplicates
      const exists = current.toLowerCase().includes(keywords.toLowerCase());
      if (exists) return prev;
      return `${current}, ${keywords}`;
    });
    addToast(`Selected ${regionName}. Symptoms appended to console.`, 'success');
  }, [addToast]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms || symptoms.trim().length < 5) {
      addToast('Please describe your symptoms in at least 5 characters.', 'warning');
      return;
    }

    try {
      setCheckerLoading(true);
      addToast('AI triage model analyzing symptoms...', 'info');

      const res = await axios.post('/ai/symptom-checker', { symptoms });
      setResult(res.data);
      addToast('Analysis complete!', 'success');
    } catch (error) {
      console.error('Symptom analysis error:', error);
      addToast('Symptom checker analysis failed. Please try again.', 'error');
    } finally {
      setCheckerLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResult(null);
  };

  const getUrgencyBadgeColor = (urgency) => {
    if (urgency === 'High') {
      return 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400';
    }
    if (urgency === 'Medium') {
      return 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400';
    }
    return 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400';
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">AI Symptom Triage</h2>
          <p className="text-xs text-slate-400 font-medium">Click on body regions on the 3D model, write your symptoms, and review AI triage suggestions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left panel: 3D Anatomy Model (3D representation) */}
          <div className="lg:col-span-5 glass-card border border-slate-205/50 dark:border-slate-750/30 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between min-h-[400px]">
            <div className="w-full flex justify-between items-center mb-2 shrink-0">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350">Interactive 3D Anatomy</h3>
              <span className="text-[10px] text-slate-405 font-bold uppercase">Click body regions</span>
            </div>
            
            <div className="flex-1 w-full relative flex items-center justify-center">
              <AnatomyCanvas className="w-full h-80" onRegionClick={handleRegionClick} />
            </div>

            <div className="mt-2 text-[10px] text-slate-450 dark:text-slate-500 font-medium text-center shrink-0">
              Clicking a region adds related symptom tags to the text box.
            </div>
          </div>

          {/* Right panel: Symptom input and results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Input Form */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary-500">
                <Sparkles size={18} className="animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">Describe Your Symptoms</h3>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="symptomsText" className="text-xs font-bold text-slate-500">How are you feeling? Add details below:</label>
                  <textarea
                    id="symptomsText"
                    rows="4"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms in detail (e.g. 'I have a dry cough, low fever, and a mild headache since yesterday morning...') or use the 3D model on the left to add tags."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-primary-500 resize-none leading-relaxed text-slate-700 dark:text-slate-200"
                    required
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={checkerLoading}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 flex items-center justify-center gap-2"
                  >
                    {checkerLoading ? <Spinner size="sm" color="white" /> : 'Run AI Analysis'}
                  </button>
                  {symptoms && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* AI Results */}
            {result ? (
              <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/40 pb-3">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">AI Diagnostic Triage Report</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getUrgencyBadgeColor(result.urgency)}`}>
                    Urgency: {result.urgency}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/30 dark:border-slate-750/30">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Suspected Condition</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{result.condition}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/30 dark:border-slate-750/30">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Recommended Specialist</span>
                    <p className="text-sm font-bold text-primary-500 mt-1">{result.specialization}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-350">Clinical Precautions & Care Tips</h4>
                  <div className="space-y-2">
                    {result.precautions?.map((prec, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-slate-655 dark:text-slate-400 items-start">
                        <CornerDownRight size={13} className="text-primary-500 shrink-0 mt-0.5" />
                        <span>{prec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/20 rounded-2xl flex gap-3 text-[10px] text-amber-700 dark:text-amber-400 leading-normal">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Disclaimer:</strong> This triage checker utilizes a heuristic AI model for informational purposes only. It does not replace professional doctor consultation, medical advice, diagnosis, or clinical treatments.
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => router.push(`/doctors?specialization=${encodeURIComponent(result.specialization)}`)}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Book appointment with a {result.specialization}
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              // Empty state
              <div className="glass-card border border-slate-200/50 dark:border-slate-700/50 p-12 text-center text-slate-400 flex-1 flex flex-col justify-center items-center">
                <Activity className="text-slate-350 dark:text-slate-700 mb-3" size={36} />
                <h4 className="text-xs font-bold text-slate-650 dark:text-slate-355">Awaiting clinical input</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                  Enter symptoms or choose regions from the 3D model, then click "Run AI Analysis" to trigger our symptom triage model.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
