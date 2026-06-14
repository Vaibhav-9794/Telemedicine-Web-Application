import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all credentials', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      addToast('Logged in successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      addToast(error || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-8 shadow-lg space-y-6">
          
          {/* Logo & title */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-teal-650 dark:text-teal-400">
              <Heart className="fill-rose-505 text-rose-500 shrink-0" size={24} />
              <span className="text-xl tracking-tight">TeleMedicare</span>
            </Link>
            <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 mt-2">Welcome Back</h2>
            <p className="text-xs text-slate-400 font-medium">Log in to manage appointments and consults</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label htmlFor="email" className="text-xs font-bold text-slate-500">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-500">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-500/10 hover:shadow-teal-500/25 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Spinner size="sm" color="white" />
              ) : (
                <>
                  Log In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Prompt to register */}
          <div className="text-center border-t border-slate-100 dark:border-slate-700/40 pt-4">
            <p className="text-xs text-slate-450 dark:text-slate-400">
              New to TeleMedicare?{' '}
              <Link to="/register" className="font-bold text-teal-650 dark:text-teal-400 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
