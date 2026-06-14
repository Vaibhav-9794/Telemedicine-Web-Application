'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Mail, Lock, User, Phone, MapPin, Heart, ArrowRight, ArrowLeft,
  Eye, EyeOff, Stethoscope, UserCheck, Calendar, Camera,
  Building2, Globe, Hash, ShieldCheck, FileText, Upload,
  Droplets, Ruler, Weight, Pill, Scissors, AlertTriangle,
  GraduationCap, Clock, DollarSign, X, Plus, Check, SkipForward,
  Users, Contact,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────── */
const STEP_LABELS = ['Account & Personal', 'Address & Emergency', 'Medical Info', 'Verification'];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'Brazil', 'South Africa',
  'United Arab Emirates', 'Singapore', 'New Zealand', 'Netherlands',
  'Sweden', 'Switzerland', 'Italy', 'Spain', 'Mexico', 'Other',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedist',
  'Neurologist', 'Psychiatrist', 'Pediatrician', 'Gynecologist',
  'Ophthalmologist', 'ENT Specialist', 'Urologist', 'Oncologist',
  'Endocrinologist', 'Gastroenterologist', 'Pulmonologist',
  'Rheumatologist', 'Nephrologist', 'Dentist', 'Radiologist', 'Other',
];

const RELATIONSHIPS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'];

const ID_TYPES = ['Aadhaar', 'PAN', 'Passport', "Driver's License", 'National ID'];

/* ─── Shared input class ───────────────────────────────────── */
const inputClass =
  'w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-colors duration-200';
const selectClass =
  'w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none cursor-pointer transition-colors duration-200';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400';

/* ─── Tag Input Component ──────────────────────────────────── */
function TagInput({ label, tags, setTags, placeholder, icon: Icon }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const value = input.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        {Icon && <Icon className={iconClass} />}
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${inputClass} ${Icon ? 'pl-10' : 'pl-4'} rounded-r-none border-r-0`}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-medium border border-primary-200 dark:border-primary-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-primary-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Step Indicator Component ────────────────────────────── */
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <React.Fragment key={stepNum}>
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : isActive
                    ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-200 dark:ring-primary-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <span
                className={`text-[11px] font-medium text-center leading-tight hidden sm:block ${
                  isActive || isCompleted
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div className="flex-1 h-0.5 mx-2 rounded-full relative -mt-5 sm:-mt-3">
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*                      MAIN COMPONENT                       */
/* ═══════════════════════════════════════════════════════════ */
export default function Register() {
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [direction, setDirection] = useState('forward'); // for transition
  const photoRef = useRef(null);
  const idRef = useRef(null);

  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    // Step 1
    name: '', email: '', password: '', confirmPassword: '',
    role: 'patient', phone: '', gender: '', dateOfBirth: '',
    profilePhoto: null,
    // Step 2
    address: '', city: '', state: '', country: '', postalCode: '',
    emergencyContactName: '', emergencyRelationship: '', emergencyPhone: '',
    // Step 3 — Patient
    bloodGroup: '', height: '', weight: '',
    allergies: [], chronicDiseases: [], currentMedications: [],
    previousSurgeries: [], familyMedicalHistory: '',
    // Step 3 — Doctor
    specialization: '', qualification: '', experience: '', consultationFee: '',
    // Step 4
    governmentIdType: '', governmentIdNumber: '', governmentIdFile: null,
    termsAccepted: false,
  });

  /* ─── Helpers ─────────────────────────────────────────── */
  const update = useCallback((key, val) => setForm((p) => ({ ...p, [key]: val })), []);

  const updateTags = useCallback((key) => (newTags) => setForm((p) => ({ ...p, [key]: newTags })), []);

  const age = useMemo(() => {
    if (!form.dateOfBirth) return '';
    const today = new Date();
    const birth = new Date(form.dateOfBirth);
    let a = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
    return a;
  }, [form.dateOfBirth]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      update('profilePhoto', file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleIdFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      update('governmentIdFile', file);
      const reader = new FileReader();
      reader.onloadend = () => setIdPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /* ─── Validation ──────────────────────────────────────── */
  const validateStep = (s) => {
    if (s === 1) {
      if (!form.name.trim()) { showToast('Full Name is required', 'warning'); return false; }
      if (!form.email.trim()) { showToast('Email is required', 'warning'); return false; }
      if (!form.password) { showToast('Password is required', 'warning'); return false; }
      if (form.password.length < 6) { showToast('Password must be at least 6 characters', 'warning'); return false; }
      if (form.password !== form.confirmPassword) { showToast('Passwords do not match', 'error'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setDirection('forward');
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => {
    setDirection('backward');
    setStep((s) => Math.max(s - 1, 1));
  };

  /* ─── Submit ──────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!form.termsAccepted) {
      showToast('Please accept the Terms & Conditions', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: form.name, email: form.email, password: form.password,
        role: form.role, phone: form.phone, address: form.address,
        profilePhoto: form.profilePhoto, gender: form.gender,
        dateOfBirth: form.dateOfBirth, city: form.city, state: form.state,
        country: form.country, postalCode: form.postalCode,
        bloodGroup: form.bloodGroup, height: form.height, weight: form.weight,
        allergies: form.allergies, chronicDiseases: form.chronicDiseases,
        currentMedications: form.currentMedications,
        previousSurgeries: form.previousSurgeries,
        familyMedicalHistory: form.familyMedicalHistory,
        governmentIdType: form.governmentIdType,
        governmentIdFile: form.governmentIdFile,
        governmentIdNumber: form.governmentIdNumber,
        emergencyContact: {
          name: form.emergencyContactName,
          relationship: form.emergencyRelationship,
          phone: form.emergencyPhone,
        },
        specialization: form.specialization, qualification: form.qualification,
        experience: form.experience, consultationFee: form.consultationFee,
      };
      const res = await axios.post('/auth/register', payload);
      localStorage.setItem('token', res.data.token);
      showToast('Account created successfully!', 'success');
      window.location.href = '/dashboard';
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Skip Step ───────────────────────────────────────── */
  const skipStep = () => {
    setDirection('forward');
    if (step < 4) setStep((s) => s + 1);
  };

  const skipAndSubmit = async () => {
    // Skip verification, submit with terms accepted
    update('termsAccepted', true);
    // Small delay to let state update
    setTimeout(() => handleSubmitDirect(), 50);
  };

  const handleSubmitDirect = async () => {
    try {
      setSubmitting(true);
      const payload = {
        name: form.name, email: form.email, password: form.password,
        role: form.role, phone: form.phone, address: form.address,
        profilePhoto: form.profilePhoto, gender: form.gender,
        dateOfBirth: form.dateOfBirth, city: form.city, state: form.state,
        country: form.country, postalCode: form.postalCode,
        bloodGroup: form.bloodGroup, height: form.height, weight: form.weight,
        allergies: form.allergies, chronicDiseases: form.chronicDiseases,
        currentMedications: form.currentMedications,
        previousSurgeries: form.previousSurgeries,
        familyMedicalHistory: form.familyMedicalHistory,
        governmentIdType: form.governmentIdType,
        governmentIdFile: form.governmentIdFile,
        governmentIdNumber: form.governmentIdNumber,
        emergencyContact: {
          name: form.emergencyContactName,
          relationship: form.emergencyRelationship,
          phone: form.emergencyPhone,
        },
        specialization: form.specialization, qualification: form.qualification,
        experience: form.experience, consultationFee: form.consultationFee,
      };
      const res = await axios.post('/auth/register', payload);
      localStorage.setItem('token', res.data.token);
      showToast('Account created successfully!', 'success');
      window.location.href = '/dashboard';
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════════════════════ */
  /*                       RENDER                           */
  /* ═══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex">
      {/* ── Left Branding Panel ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-500 via-primary-600 to-cyan-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-cyan-300/10 rounded-full blur-2xl animate-float" />
        <div className="relative text-center text-white max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Join MediCare</h2>
          <p className="text-primary-100 text-lg leading-relaxed mb-8">
            Create your account and start your journey to better healthcare today.
          </p>
          {/* Step-specific tips */}
          <div className="glass p-4 rounded-2xl text-left text-sm space-y-2">
            <p className="font-semibold text-white/90">
              Step {step} of 4 — {STEP_LABELS[step - 1]}
            </p>
            <p className="text-white/70">
              {step === 1 && 'Start with your basic account details. Fields marked * are required.'}
              {step === 2 && 'Add your address and emergency contact information for safety.'}
              {step === 3 && (form.role === 'patient'
                ? 'Share your medical details to help doctors serve you better.'
                : 'Provide your professional credentials and consultation details.')}
              {step === 4 && 'Verify your identity to unlock all platform features.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-2xl py-8 animate-fadeInUp">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">MediCare</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Complete the steps below to get started.</p>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} totalSteps={4} />

          {/* Step Content Container */}
          <div className="relative overflow-hidden">
            <div
              key={step}
              className={`transition-all duration-400 ease-out ${
                direction === 'forward' ? 'animate-slideInRight' : 'animate-slideInLeft'
              }`}
            >
              {/* ════════════════════════════════════════════ */}
              {/*           STEP 1 — Account & Personal       */}
              {/* ════════════════════════════════════════════ */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Role Selector */}
                  <div className="flex gap-3">
                    {[
                      { value: 'patient', label: 'Patient', icon: UserCheck, desc: 'Book appointments' },
                      { value: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients' },
                    ].map((r) => {
                      const Icon = r.icon;
                      const active = form.role === r.value;
                      return (
                        <button key={r.value} type="button" onClick={() => update('role', r.value)}
                          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-medium text-sm border-2 transition-all duration-300 ${
                            active
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-sm shadow-primary-500/10'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">{r.label}</div>
                            <div className="text-[11px] opacity-60">{r.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <div className="relative">
                        <User className={iconClass} />
                        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                          placeholder="John Doe" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Email *</label>
                      <div className="relative">
                        <Mail className={iconClass} />
                        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                          placeholder="you@example.com" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Password + Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Password *</label>
                      <div className="relative">
                        <Lock className={iconClass} />
                        <input type={showPw ? 'text' : 'password'} value={form.password}
                          onChange={(e) => update('password', e.target.value)} placeholder="••••••••"
                          className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Confirm Password *</label>
                      <div className="relative">
                        <Lock className={iconClass} />
                        <input type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword}
                          onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••••"
                          className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gender + DOB */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Gender</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                          <label key={g}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm cursor-pointer border transition-all duration-200 ${
                              form.gender === g
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                            }`}>
                            <input type="radio" name="gender" value={g} checked={form.gender === g}
                              onChange={(e) => update('gender', e.target.value)} className="sr-only" />
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                              form.gender === g ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {form.gender === g && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                            </div>
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
                      <div className="relative">
                        <Calendar className={iconClass} />
                        <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)}
                          className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Age + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Age</label>
                      <div className="relative">
                        <Hash className={iconClass} />
                        <input type="text" value={age !== '' ? `${age} years` : ''} readOnly
                          placeholder="Auto-calculated from DOB"
                          className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-500`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Mobile Number</label>
                      <div className="relative">
                        <Phone className={iconClass} />
                        <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                          placeholder="+1 (555) 000-0000" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className={labelClass}>Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => photoRef.current?.click()}
                        className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden group"
                      >
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <button type="button" onClick={() => photoRef.current?.click()}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                          {photoPreview ? 'Change photo' : 'Upload a photo'}
                        </button>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or WebP. Max 5MB.</p>
                      </div>
                      <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════ */}
              {/*         STEP 2 — Address & Emergency        */}
              {/* ════════════════════════════════════════════ */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Address Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Address</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Full address */}
                      <div>
                        <label className={labelClass}>Street Address</label>
                        <div className="relative">
                          <MapPin className={iconClass} />
                          <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)}
                            placeholder="123 Healthcare Avenue" className={inputClass} />
                        </div>
                      </div>

                      {/* City + State */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>City</label>
                          <div className="relative">
                            <Building2 className={iconClass} />
                            <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)}
                              placeholder="Mumbai" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>State / Province</label>
                          <div className="relative">
                            <Building2 className={iconClass} />
                            <input type="text" value={form.state} onChange={(e) => update('state', e.target.value)}
                              placeholder="Maharashtra" className={inputClass} />
                          </div>
                        </div>
                      </div>

                      {/* Country + Postal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Country</label>
                          <div className="relative">
                            <Globe className={iconClass} />
                            <select value={form.country} onChange={(e) => update('country', e.target.value)}
                              className={selectClass}>
                              <option value="">Select Country</option>
                              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Postal Code</label>
                          <div className="relative">
                            <Hash className={iconClass} />
                            <input type="text" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)}
                              placeholder="400001" className={inputClass} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="border-l-4 border-red-400 dark:border-red-500 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Emergency Contact</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Contact Name</label>
                          <div className="relative">
                            <Contact className={iconClass} />
                            <input type="text" value={form.emergencyContactName}
                              onChange={(e) => update('emergencyContactName', e.target.value)}
                              placeholder="Jane Doe" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Relationship</label>
                          <div className="relative">
                            <Users className={iconClass} />
                            <select value={form.emergencyRelationship}
                              onChange={(e) => update('emergencyRelationship', e.target.value)}
                              className={selectClass}>
                              <option value="">Select Relationship</option>
                              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Emergency Phone</label>
                        <div className="relative">
                          <Phone className={iconClass} />
                          <input type="tel" value={form.emergencyPhone}
                            onChange={(e) => update('emergencyPhone', e.target.value)}
                            placeholder="+1 (555) 000-0000" className={inputClass} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════ */}
              {/*       STEP 3 — Medical / Doctor Info        */}
              {/* ════════════════════════════════════════════ */}
              {step === 3 && (
                <div className="space-y-5">
                  {form.role === 'patient' ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Medical Information</h3>
                      </div>

                      {/* Blood Group + Height + Weight */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Blood Group</label>
                          <div className="relative">
                            <Droplets className={iconClass} />
                            <select value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)}
                              className={selectClass}>
                              <option value="">Select</option>
                              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Height (cm)</label>
                          <div className="relative">
                            <Ruler className={iconClass} />
                            <input type="number" value={form.height} onChange={(e) => update('height', e.target.value)}
                              placeholder="170" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Weight (kg)</label>
                          <div className="relative">
                            <Weight className={iconClass} />
                            <input type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)}
                              placeholder="70" className={inputClass} />
                          </div>
                        </div>
                      </div>

                      {/* Tag inputs */}
                      <TagInput label="Allergies" tags={form.allergies} setTags={updateTags('allergies')}
                        placeholder="Type allergy & press Enter" icon={AlertTriangle} />

                      <TagInput label="Chronic Diseases" tags={form.chronicDiseases} setTags={updateTags('chronicDiseases')}
                        placeholder="Type disease & press Enter" icon={Heart} />

                      <TagInput label="Current Medications" tags={form.currentMedications} setTags={updateTags('currentMedications')}
                        placeholder="Type medication & press Enter" icon={Pill} />

                      <TagInput label="Previous Surgeries" tags={form.previousSurgeries} setTags={updateTags('previousSurgeries')}
                        placeholder="Type surgery & press Enter" icon={Scissors} />

                      {/* Family History */}
                      <div>
                        <label className={labelClass}>Family Medical History</label>
                        <textarea value={form.familyMedicalHistory}
                          onChange={(e) => update('familyMedicalHistory', e.target.value)}
                          placeholder="Any family history of heart disease, diabetes, cancer, etc."
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none transition-colors duration-200"
                        />
                      </div>
                    </>
                  ) : (
                    /* ─── Doctor Fields ─────────────────── */
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Professional Details</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Specialization</label>
                          <div className="relative">
                            <Stethoscope className={iconClass} />
                            <select value={form.specialization} onChange={(e) => update('specialization', e.target.value)}
                              className={selectClass}>
                              <option value="">Select Specialization</option>
                              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Qualification</label>
                          <div className="relative">
                            <GraduationCap className={iconClass} />
                            <input type="text" value={form.qualification}
                              onChange={(e) => update('qualification', e.target.value)}
                              placeholder="MBBS, MD, etc." className={inputClass} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Experience (years)</label>
                          <div className="relative">
                            <Clock className={iconClass} />
                            <input type="number" value={form.experience}
                              onChange={(e) => update('experience', e.target.value)}
                              placeholder="5" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Consultation Fee ($)</label>
                          <div className="relative">
                            <DollarSign className={iconClass} />
                            <input type="number" value={form.consultationFee}
                              onChange={(e) => update('consultationFee', e.target.value)}
                              placeholder="50" className={inputClass} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════════ */}
              {/*           STEP 4 — Verification             */}
              {/* ════════════════════════════════════════════ */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Identity Verification</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Government ID Type</label>
                      <div className="relative">
                        <FileText className={iconClass} />
                        <select value={form.governmentIdType} onChange={(e) => update('governmentIdType', e.target.value)}
                          className={selectClass}>
                          <option value="">Select ID Type</option>
                          {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Government ID Number</label>
                      <div className="relative">
                        <Hash className={iconClass} />
                        <input type="text" value={form.governmentIdNumber}
                          onChange={(e) => update('governmentIdNumber', e.target.value)}
                          placeholder="XXXX-XXXX-XXXX" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* ID File Upload */}
                  <div>
                    <label className={labelClass}>Upload Government ID</label>
                    <div
                      onClick={() => idRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 group"
                    >
                      {idPreview ? (
                        <div className="space-y-2">
                          <img src={idPreview} alt="ID Preview" className="max-h-40 mx-auto rounded-lg shadow-sm" />
                          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary-500 mx-auto transition-colors" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Click to upload your government ID
                          </p>
                          <p className="text-xs text-slate-400">JPG, PNG or PDF. Max 10MB.</p>
                        </div>
                      )}
                    </div>
                    <input ref={idRef} type="file" accept="image/*,.pdf" onChange={handleIdFileChange} className="hidden" />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="mt-0.5">
                        <input type="checkbox" checked={form.termsAccepted}
                          onChange={(e) => update('termsAccepted', e.target.checked)}
                          className="sr-only" />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          form.termsAccepted
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {form.termsAccepted && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        I agree to the{' '}
                        <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                          Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                          Privacy Policy
                        </a>{' '}
                        of MediCare.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Navigation Buttons ──────────────────────── */}
          <div className="flex items-center justify-between mt-8 gap-3">
            {/* Left side */}
            <div>
              {step > 1 && (
                <button type="button" onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Skip button for steps 3 and 4 */}
              {(step === 3 || step === 4) && (
                <button type="button" onClick={step === 4 ? skipAndSubmit : skipStep}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <SkipForward className="w-3.5 h-3.5" /> Skip
                </button>
              )}

              {step < 4 ? (
                <button type="button" onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 text-sm">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 text-sm disabled:opacity-60">
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sign In link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
