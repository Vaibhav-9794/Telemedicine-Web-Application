import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Phone, MapPin, Award, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import Spinner from '../components/Spinner';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Doctor-specific profile state
  const [doctorProfile, setDoctorProfile] = useState({
    specialization: '',
    experience: '',
    qualification: '',
    consultationFee: '',
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });

      if (user.role === 'doctor' && user.doctorProfile) {
        const dp = user.doctorProfile;
        setDoctorProfile({
          specialization: dp.specialization || 'General Physician',
          experience: dp.experience !== undefined ? String(dp.experience) : '1',
          qualification: dp.qualification || 'MBBS',
          consultationFee: dp.consultationFee !== undefined ? String(dp.consultationFee) : '50',
          availability: dp.availability || {
            Monday: ['09:00 AM - 05:00 PM'],
            Tuesday: ['09:00 AM - 05:00 PM'],
            Wednesday: ['09:00 AM - 05:00 PM'],
            Thursday: ['09:00 AM - 05:00 PM'],
            Friday: ['09:00 AM - 05:00 PM']
          }
        });
      }
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Full name is required', 'warning');
      return;
    }

    try {
      setLoading(true);
      addToast('Updating profile data...', 'info');

      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      if (user.role === 'doctor') {
        payload.doctorProfile = {
          specialization: doctorProfile.specialization,
          experience: Number(doctorProfile.experience),
          qualification: doctorProfile.qualification,
          consultationFee: Number(doctorProfile.consultationFee),
          availability: doctorProfile.availability
        };
      }

      await updateProfile(payload);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Profile update error:', error);
      addToast(error || 'Failed to update profile settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Profile Settings</h2>
        <p className="text-xs text-slate-400 font-medium">Manage your clinical credentials, contact info, and profile preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleUpdate} className="space-y-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
            <User size={18} className="text-teal-650 dark:text-teal-400" />
            Basic Personal Details
          </h3>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullNameInput" className="text-xs text-slate-500 font-bold">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="fullNameInput"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="phoneNumberInput" className="text-xs text-slate-500 font-bold">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    id="phoneNumberInput"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="addressInput" className="text-xs text-slate-500 font-bold">Residential/Office Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    id="addressInput"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    placeholder="123 Health District, NY"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Doctor professional credentials (Doctors only) */}
          {user.role === 'doctor' && (
            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-5 space-y-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                <Award size={18} className="text-teal-650 dark:text-teal-400 animate-pulse" />
                Clinical Profile & Availability
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Specialization */}
                <div className="space-y-1">
                  <label htmlFor="specializationInput" className="text-xs text-slate-500 font-bold">Specialization</label>
                  <input
                    type="text"
                    id="specializationInput"
                    value={doctorProfile.specialization}
                    onChange={(e) => setDoctorProfile({ ...doctorProfile, specialization: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
                    placeholder="e.g. Cardiologist"
                    required
                  />
                </div>

                {/* Qualification */}
                <div className="space-y-1">
                  <label htmlFor="qualificationInput" className="text-xs text-slate-500 font-bold">Qualifications</label>
                  <input
                    type="text"
                    id="qualificationInput"
                    value={doctorProfile.qualification}
                    onChange={(e) => setDoctorProfile({ ...doctorProfile, qualification: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
                    placeholder="e.g. MD, MBBS"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experience */}
                <div className="space-y-1">
                  <label htmlFor="experienceInput" className="text-xs text-slate-500 font-bold">Years of Experience</label>
                  <input
                    type="number"
                    id="experienceInput"
                    value={doctorProfile.experience}
                    onChange={(e) => setDoctorProfile({ ...doctorProfile, experience: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
                    min="0"
                    required
                  />
                </div>

                {/* Consultation Fee */}
                <div className="space-y-1">
                  <label htmlFor="consultationFeeInput" className="text-xs text-slate-500 font-bold">Consultation Fee ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      id="consultationFeeInput"
                      value={doctorProfile.consultationFee}
                      onChange={(e) => setDoctorProfile({ ...doctorProfile, consultationFee: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="border-t border-slate-100 dark:border-slate-700/50 pt-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-500/10 flex items-center justify-center gap-1.5"
            >
              {loading ? <Spinner size="sm" color="white" /> : (
                <>
                  <ShieldCheck size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
