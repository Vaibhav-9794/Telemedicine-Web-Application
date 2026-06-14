'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import {
  User, Phone, MapPin, Award, DollarSign, Clock, ShieldCheck, Plus, Trash2,
  Camera, Lock, Mail, BadgeCheck, Heart, AlertTriangle, Shield, Stethoscope,
  X, Calendar, Ruler, Weight, Droplets, Pill, Scissors, Users, FileText,
  ChevronRight, Save, Info, Upload, Eye, EyeOff, Activity
} from 'lucide-react';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RELATIONSHIPS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'];

const ID_TYPES = ['Passport', 'Driver License', 'National ID', 'Aadhaar Card', 'SSN Card'];

// ─── Reusable TagInput Component ──────────────────────────────────────────────
function TagInput({ label, tags = [], onChange, placeholder, icon: Icon, colorClass = 'primary' }) {
  const [input, setInput] = useState('');

  const colorMap = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-950/40',
      text: 'text-primary-700 dark:text-primary-300',
      border: 'border-primary-200 dark:border-primary-800',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-violet-200 dark:border-violet-800',
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-800',
    },
  };

  const colors = colorMap[colorClass] || colorMap.primary;

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInput('');
    }
  };

  const removeTag = (idx) => onChange(tags.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label}
      </label>
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {tags.map((tag, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-medium border ${colors.border}`}
          >
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="hover:opacity-70 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(); }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Tab Definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'health', label: 'Health Profile', icon: Heart },
  { id: 'emergency', label: 'Emergency Contact', icon: AlertTriangle },
  { id: 'security', label: 'Security & ID', icon: Shield },
  { id: 'doctor', label: 'Doctor Settings', icon: Stethoscope },
];

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, loading, isAuthenticated, updateProfile } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('personal');
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Form States ────
  const [personalForm, setPersonalForm] = useState({
    name: '', gender: '', dateOfBirth: '', phone: '',
    address: '', city: '', state: '', country: '', postalCode: '', profilePhoto: '',
  });

  const [healthForm, setHealthForm] = useState({
    bloodGroup: '', height: '', weight: '',
    allergies: [], chronicDiseases: [], currentMedications: [],
    previousSurgeries: [], familyMedicalHistory: '',
  });

  const [emergencyForm, setEmergencyForm] = useState({
    name: '', relationship: '', phone: '',
  });

  const [securityForm, setSecurityForm] = useState({
    governmentId: { type: '', number: '', status: 'not_uploaded', fileUrl: '' },
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [doctorForm, setDoctorForm] = useState({
    specialization: '', experience: '', qualification: '', consultationFee: '',
    availability: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] },
  });

  const [tempSlot, setTempSlot] = useState({ day: 'Monday', time: '09:00 AM' });

  // ── Load Profile Data ────
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      setPersonalForm({
        name: user.name || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        postalCode: user.postalCode || '',
        profilePhoto: user.profilePhoto || '',
      });

      setHealthForm({
        bloodGroup: user.bloodGroup || '',
        height: user.height || '',
        weight: user.weight || '',
        allergies: user.allergies || [],
        chronicDiseases: user.chronicDiseases || [],
        currentMedications: user.currentMedications || [],
        previousSurgeries: user.previousSurgeries || [],
        familyMedicalHistory: user.familyMedicalHistory || '',
      });

      setEmergencyForm({
        name: user.emergencyContact?.name || '',
        relationship: user.emergencyContact?.relationship || '',
        phone: user.emergencyContact?.phone || '',
      });

      setSecurityForm((prev) => ({
        ...prev,
        governmentId: user.governmentId || { type: '', number: '', status: 'not_uploaded', fileUrl: '' },
      }));

      if (user.role === 'doctor' && user.doctorProfile) {
        const dp = user.doctorProfile;
        setDoctorForm({
          specialization: dp.specialization || 'General Physician',
          experience: dp.experience !== undefined ? String(dp.experience) : '5',
          qualification: dp.qualification || 'MBBS',
          consultationFee: dp.consultationFee !== undefined ? String(dp.consultationFee) : '45',
          availability: dp.availability || {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [],
          },
        });
      }
    }
  }, [loading, isAuthenticated, user, router]);

  // ── Computed Values ────
  const age = useMemo(() => {
    if (!personalForm.dateOfBirth) return null;
    const birth = new Date(personalForm.dateOfBirth);
    const today = new Date();
    let a = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) a--;
    return a >= 0 ? a : null;
  }, [personalForm.dateOfBirth]);

  const bmi = useMemo(() => {
    const h = parseFloat(healthForm.height) / 100;
    const w = parseFloat(healthForm.weight);
    if (!h || !w || h <= 0) return null;
    return (w / (h * h)).toFixed(1);
  }, [healthForm.height, healthForm.weight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' };
    if (val < 25) return { label: 'Normal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' };
    return { label: 'Obese', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40' };
  }, [bmi]);

  const initials = useMemo(() => {
    const n = personalForm.name || 'U';
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }, [personalForm.name]);

  // ── Profile Photo Upload ────
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be under 2MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPersonalForm((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  }, [addToast]);

  // ── Doctor Slot Management ────
  const handleAddSlot = () => {
    const { day, time } = tempSlot;
    const currentSlots = doctorForm.availability[day] || [];
    if (currentSlots.includes(time)) {
      addToast('Time slot already exists for this day', 'warning');
      return;
    }
    const updatedSlots = [...currentSlots, time].sort();
    setDoctorForm({
      ...doctorForm,
      availability: { ...doctorForm.availability, [day]: updatedSlots },
    });
    addToast('Time slot added. Click Save to commit changes.', 'info');
  };

  const handleRemoveSlot = (day, slot) => {
    const updatedSlots = (doctorForm.availability[day] || []).filter((s) => s !== slot);
    setDoctorForm({
      ...doctorForm,
      availability: { ...doctorForm.availability, [day]: updatedSlots },
    });
  };

  // ── Save Handlers ────
  const savePersonal = async () => {
    if (!personalForm.name.trim()) { addToast('Name is required', 'warning'); return; }
    try {
      setSubmitLoading(true);
      await updateProfile({ ...personalForm });
      addToast('Personal information updated!', 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Failed to update personal info', 'error');
    } finally { setSubmitLoading(false); }
  };

  const saveHealth = async () => {
    try {
      setSubmitLoading(true);
      await updateProfile({ ...healthForm });
      addToast('Health profile updated!', 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Failed to update health profile', 'error');
    } finally { setSubmitLoading(false); }
  };

  const saveEmergency = async () => {
    try {
      setSubmitLoading(true);
      await updateProfile({ emergencyContact: { ...emergencyForm } });
      addToast('Emergency contact updated!', 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Failed to update emergency contact', 'error');
    } finally { setSubmitLoading(false); }
  };

  const saveSecurity = async () => {
    if (securityForm.newPassword) {
      addToast('Password change feature coming soon', 'info');
      return;
    }
    try {
      setSubmitLoading(true);
      await updateProfile({ governmentId: securityForm.governmentId });
      addToast('Security information updated!', 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Failed to update security info', 'error');
    } finally { setSubmitLoading(false); }
  };

  const saveDoctor = async () => {
    try {
      setSubmitLoading(true);
      const payload = {
        doctorProfile: {
          ...doctorForm,
          experience: Number(doctorForm.experience),
          consultationFee: Number(doctorForm.consultationFee),
        },
      };
      await updateProfile(payload);
      addToast('Doctor profile updated!', 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Failed to update doctor profile', 'error');
    } finally { setSubmitLoading(false); }
  };

  // ── Determine visible tabs ────
  const visibleTabs = useMemo(() => {
    if (!user) return TABS.filter((t) => t.id !== 'doctor');
    return user.role === 'doctor' ? TABS : TABS.filter((t) => t.id !== 'doctor');
  }, [user]);

  // ── Loading / Auth Guard ────
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Input field helper ────
  const inputClass = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all';
  const inputReadonlyClass = 'w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed focus:outline-none';
  const labelClass = 'text-xs font-bold text-slate-500 dark:text-slate-400';
  const selectClass = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all appearance-none';

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <Sidebar>
      <div className="space-y-6 text-left max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Profile Settings
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
            Manage your account details, health information, and preferences
          </p>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="glass-card border border-slate-200/50 dark:border-slate-700/50 p-1 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: Personal Info                                               */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Profile Header Card */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile Photo */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary-200 dark:border-primary-800 shadow-xl">
                    {personalForm.profilePhoto ? (
                      <img src={personalForm.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-2xl font-black text-white">{initials}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 w-28 h-28 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={24} className="text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Badges & Name */}
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {personalForm.name || 'Your Name'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {/* Patient ID Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
                      <span className="text-[10px] font-medium text-primary-600 dark:text-primary-400">
                        {user?.role === 'doctor' ? 'Doctor ID' : 'Patient ID'}
                      </span>
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                        {user?.patientId || user?._id?.slice(0, 8).toUpperCase() || 'Not assigned'}
                      </span>
                    </div>

                    {/* Verified Badge */}
                    {user?.isVerified && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Verified</span>
                      </div>
                    )}

                    {/* Role Badge */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details Form */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <User size={16} className="text-primary-500" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={personalForm.name}
                      onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input type="email" value={user?.email || ''} className={`${inputReadonlyClass} pl-10`} readOnly />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Gender</label>
                  <div className="flex gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <label
                        key={g}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          personalForm.gender === g
                            ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-400 dark:border-primary-600 text-primary-700 dark:text-primary-300'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={personalForm.gender === g}
                          onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                          className="hidden"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date of Birth + Age */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Date of Birth</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar size={14} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={personalForm.dateOfBirth}
                        onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                    {age !== null && (
                      <div className="flex items-center px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 min-w-[80px] justify-center">
                        <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{age} yrs</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Mobile Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={personalForm.phone}
                      onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin size={12} />
                  Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className={labelClass}>Street Address</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={personalForm.address}
                        onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                        placeholder="Street Address"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      value={personalForm.city}
                      onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                      placeholder="City"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>State / Province</label>
                    <input
                      type="text"
                      value={personalForm.state}
                      onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                      placeholder="State"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Country</label>
                    <input
                      type="text"
                      value={personalForm.country}
                      onChange={(e) => setPersonalForm({ ...personalForm, country: e.target.value })}
                      placeholder="Country"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Postal Code</label>
                    <input
                      type="text"
                      value={personalForm.postalCode}
                      onChange={(e) => setPersonalForm({ ...personalForm, postalCode: e.target.value })}
                      placeholder="Postal Code"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={savePersonal}
                  disabled={submitLoading}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitLoading ? <Spinner size="sm" /> : <><Save size={14} /> Save Personal Info</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: Health Profile                                              */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'health' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Vitals Card */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Activity size={16} className="text-primary-500" />
                Vitals &amp; Measurements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Blood Group */}
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    <Droplets size={12} className="inline mr-1" />
                    Blood Group
                  </label>
                  <select
                    value={healthForm.bloodGroup}
                    onChange={(e) => setHealthForm({ ...healthForm, bloodGroup: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    <Ruler size={12} className="inline mr-1" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={healthForm.height}
                    onChange={(e) => setHealthForm({ ...healthForm, height: e.target.value })}
                    placeholder="170"
                    className={inputClass}
                    min="0"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    <Weight size={12} className="inline mr-1" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={healthForm.weight}
                    onChange={(e) => setHealthForm({ ...healthForm, weight: e.target.value })}
                    placeholder="70"
                    className={inputClass}
                    min="0"
                  />
                </div>

                {/* BMI */}
                <div className="space-y-1.5">
                  <label className={labelClass}>BMI</label>
                  <div className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold text-center ${
                    bmiCategory ? `${bmiCategory.bg} ${bmiCategory.color} border-transparent` : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}>
                    {bmi ? (
                      <span>{bmi} <span className="text-[10px] font-medium ml-1">({bmiCategory?.label})</span></span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Health Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <TagInput
                  label="Allergies"
                  tags={healthForm.allergies}
                  onChange={(v) => setHealthForm({ ...healthForm, allergies: v })}
                  placeholder="e.g. Penicillin, Peanuts"
                  icon={AlertTriangle}
                  colorClass="rose"
                />
              </div>

              <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <TagInput
                  label="Chronic Diseases"
                  tags={healthForm.chronicDiseases}
                  onChange={(v) => setHealthForm({ ...healthForm, chronicDiseases: v })}
                  placeholder="e.g. Diabetes, Hypertension"
                  icon={Heart}
                  colorClass="amber"
                />
              </div>

              <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <TagInput
                  label="Current Medications"
                  tags={healthForm.currentMedications}
                  onChange={(v) => setHealthForm({ ...healthForm, currentMedications: v })}
                  placeholder="e.g. Metformin 500mg"
                  icon={Pill}
                  colorClass="violet"
                />
              </div>

              <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <TagInput
                  label="Previous Surgeries"
                  tags={healthForm.previousSurgeries}
                  onChange={(v) => setHealthForm({ ...healthForm, previousSurgeries: v })}
                  placeholder="e.g. Appendectomy (2020)"
                  icon={Scissors}
                  colorClass="teal"
                />
              </div>
            </div>

            {/* Family Medical History */}
            <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-2">
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Users size={14} className="text-slate-400" />
                Family Medical History
              </label>
              <textarea
                value={healthForm.familyMedicalHistory}
                onChange={(e) => setHealthForm({ ...healthForm, familyMedicalHistory: e.target.value })}
                placeholder="Describe any hereditary conditions, family diseases, etc."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveHealth}
                disabled={submitLoading}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2 disabled:opacity-50"
              >
                {submitLoading ? <Spinner size="sm" /> : <><Save size={14} /> Save Health Profile</>}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: Emergency Contact                                           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'emergency' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <AlertTriangle size={16} className="text-rose-500" />
                Emergency Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Contact Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={emergencyForm.name}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                      placeholder="Full name of emergency contact"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Relationship */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Relationship</label>
                  <select
                    value={emergencyForm.relationship}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select relationship</option>
                    {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Phone */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className={labelClass}>Emergency Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={emergencyForm.phone}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={saveEmergency}
                  disabled={submitLoading}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitLoading ? <Spinner size="sm" /> : <><Save size={14} /> Save Emergency Contact</>}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                This contact will be notified in case of medical emergencies. Please ensure the phone number is correct and the contact person is aware of their designation.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: Security & ID                                               */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Government ID Section */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText size={16} className="text-primary-500" />
                  Government ID Verification
                </h3>
                {/* Status Badge */}
                {securityForm.governmentId.status === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
                {securityForm.governmentId.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                    <Clock size={12} /> Pending Review
                  </span>
                )}
                {(!securityForm.governmentId.status || securityForm.governmentId.status === 'not_uploaded') && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    <Upload size={12} /> Not Uploaded
                  </span>
                )}
              </div>

              {securityForm.governmentId.status === 'verified' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>ID Type</label>
                    <div className={inputReadonlyClass}>{securityForm.governmentId.type || '—'}</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>ID Number</label>
                    <div className={inputReadonlyClass}>
                      {'•••• •••• ' + (securityForm.governmentId.number?.slice(-4) || '••••')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>ID Type</label>
                    <select
                      value={securityForm.governmentId.type}
                      onChange={(e) => setSecurityForm({
                        ...securityForm,
                        governmentId: { ...securityForm.governmentId, type: e.target.value },
                      })}
                      className={selectClass}
                    >
                      <option value="">Select ID type</option>
                      {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>ID Number</label>
                    <input
                      type="text"
                      value={securityForm.governmentId.number}
                      onChange={(e) => setSecurityForm({
                        ...securityForm,
                        governmentId: { ...securityForm.governmentId, number: e.target.value },
                      })}
                      placeholder="Enter your ID number"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Lock size={16} className="text-amber-500" />
                Change Password
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Current Password</label>
                  <input
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Info size={16} className="text-slate-400" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Created</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user?.status === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user?.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {user?.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveSecurity}
                disabled={submitLoading}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2 disabled:opacity-50"
              >
                {submitLoading ? <Spinner size="sm" /> : <><Save size={14} /> Save Security Settings</>}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: Doctor Settings (doctor role only)                           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'doctor' && user?.role === 'doctor' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Doctor Details */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Award size={16} className="text-primary-500" />
                Clinical Specialty Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Specialization */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className={labelClass}>Specialization</label>
                  <input
                    type="text"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Qualification */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className={labelClass}>Qualification</label>
                  <input
                    type="text"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    placeholder="e.g. MBBS, M.D. Cardiology"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Experience (Years)</label>
                  <input
                    type="number"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                    className={inputClass}
                    min="0"
                    required
                  />
                </div>

                {/* Consultation Fee */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Consultation Fee ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      value={doctorForm.consultationFee}
                      onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                      className={`${inputClass} pl-8`}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Availability Schedule */}
            <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Clock size={16} className="text-primary-500" />
                Availability Slots
              </h3>

              {/* Add Availability Slot controls */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Select Day</label>
                  <select
                    value={tempSlot.day}
                    onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })}
                    className={selectClass}
                  >
                    {WEEK_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Select Time</label>
                  <select
                    value={tempSlot.time}
                    onChange={(e) => setTempSlot({ ...tempSlot, time: e.target.value })}
                    className={selectClass}
                  >
                    {[
                      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
                    ].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 h-[42px]"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Displaying Availability by Day */}
              <div className="space-y-3 pt-2">
                {WEEK_DAYS.map((day) => {
                  const slots = doctorForm.availability[day] || [];
                  return (
                    <div key={day} className="flex flex-col sm:flex-row gap-1 sm:gap-4 sm:items-start text-xs border-b border-slate-50 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0">
                      <span className="font-bold text-slate-600 dark:text-slate-300 w-24 shrink-0 mt-1">{day}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {slots.length > 0 ? (
                          slots.map((slot) => (
                            <span
                              key={slot}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-100/30 dark:border-primary-900/20 font-bold"
                            >
                              {slot}
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(day, slot)}
                                className="text-slate-400 hover:text-red-500 font-normal transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px] mt-1">No time slots configured.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={saveDoctor}
                  disabled={submitLoading}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitLoading ? <Spinner size="sm" /> : <><Save size={14} /> Save Doctor Profile</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
