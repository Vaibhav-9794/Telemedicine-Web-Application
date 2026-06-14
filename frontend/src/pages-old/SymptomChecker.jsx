import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Activity, ShieldAlert, Sparkles, ArrowRight, CornerDownRight } from 'lucide-react';
import Spinner from '../components/Spinner';

const SymptomChecker = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms || symptoms.trim().length < 5) {
      addToast('Please describe your symptoms in at least 5 characters.', 'warning');
      return;
    }

    try {
      setLoading(true);
      addToast('AI triage model analyzing symptoms...', 'info');
      const res = await axios.post('/ai/symptom-checker', { symptoms });
      setResult(res.data);
      addToast('Analysis complete!', 'success');
    } catch (error) {
      console.error('Symptom analysis error:', error);
      addToast('Symptom checker analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResult(null);
  };

  // Helper for Urgency colors
  const getUrgencyBadgeColor = (urgency) => {
    if (urgency === 'High') {
      return 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400';
    }
    if (urgency === 'Medium') {
      return 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400';
    }
    return 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">AI Symptom Checker</h2>
        <p className="text-xs text-slate-400 font-medium">Identify potential clinical conditions and receive specialist suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Symptoms Form Input (Left Column) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-teal-650 dark:text-teal-400">
            <Sparkles size={18} className="animate-pulse" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Describe Your Symptoms</h3>
          </div>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="symptomsText" className="text-xs text-slate-400 font-semibold">How are you feeling?</label>
              <textarea
                id="symptomsText"
                rows="6"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms in detail (e.g., 'I have a dry cough, low fever, and a mild headache since yesterday morning...')"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
                required
              ></textarea>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-450 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-500/10 hover:shadow-teal-500/25 flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size="sm" color="white" /> : 'Run AI Analysis'}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Diagnostic Results (Right Column) */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/40 pb-3">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">AI Diagnostic Report</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getUrgencyBadgeColor(result.urgency)}`}>
                  Urgency: {result.urgency}
                </span>
              </div>

              {/* Suspended Condition & recommended specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/30 dark:border-slate-750/30">
                  <span className="text-[10px] text-slate-400 font-bold block">POSSIBLE SUSPECTED CONDITION</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{result.condition}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/30 dark:border-slate-755/30">
                  <span className="text-[10px] text-slate-400 font-bold block">RECOMMENDED CLINICAL SPECIALIST</span>
                  <p className="text-sm font-bold text-teal-650 dark:text-teal-400 mt-1">{result.specialization}</p>
                </div>
              </div>

              {/* Precautions list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-350">Recommended Health Precautions</h4>
                <div className="space-y-2">
                  {result.precautions.map((prec, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-655 dark:text-slate-400 items-start">
                      <CornerDownRight size={13} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{prec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Triage Disclaimer notice */}
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/20 rounded-2xl flex gap-3 text-[10px] text-amber-700 dark:text-amber-400 leading-normal">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <p>
                  <strong>Disclaimer:</strong> This tool utilizes a heuristic AI triage model for informational guidance only. It does not replace professional doctor consultation, medical advice, diagnosis, or clinical treatments.
                </p>
              </div>

              {/* Direct Booking link button */}
              <button
                onClick={() => navigate(`/doctors?specialization=${encodeURIComponent(result.specialization)}`)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                Find & Book a {result.specialization}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-12 text-center text-slate-400 h-full flex flex-col justify-center items-center">
              <Activity className="text-slate-300 dark:text-slate-750 mb-3" size={40} />
              <h4 className="text-xs font-bold text-slate-650 dark:text-slate-355">Awaiting Input symptoms</h4>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                Submit a text description of your symptoms in the editor panel to initiate the AI diagnostic assistant.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
