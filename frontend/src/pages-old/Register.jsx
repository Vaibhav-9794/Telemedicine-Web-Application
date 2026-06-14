import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // 'patient' or 'doctor'
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role, phone, address } = formData;

    if (!name || !email || !password || !role) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'warning');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await register(name, email, password, role, phone, address);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      addToast(error || 'Registration failed. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 my-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-8 shadow-lg space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-teal-655 dark:text-teal-400">
              <Heart className="fill-rose-500 text-rose-500 shrink-0" size={24} />
              <span className="text-xl tracking-tight">TeleMedicare</span>
            </Link>
            <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 mt-2 font-sans">Create an Account</h2>
            <p className="text-xs text-slate-400 font-medium">Join our telemedicine platform today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {/* Role Switcher tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">I want to register as a:</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'patient' })}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    formData.role === 'patient'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'doctor' })}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    formData.role === 'doctor'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Doctor / Medical Provider
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-bold text-slate-500">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="text-xs font-bold text-slate-500">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-bold text-slate-500">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label htmlFor="address" className="text-xs font-bold text-slate-500">Home/Office Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  placeholder="123 Medical Dist, New York"
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
                  Register
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Prompt to login */}
          <div className="text-center border-t border-slate-100 dark:border-slate-700/40 pt-4">
            <p className="text-xs text-slate-450 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-650 dark:text-teal-400 hover:underline">
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
