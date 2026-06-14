'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import { useAPI } from '@/hooks/useAPI';
import { Search, Calendar, Star, DollarSign, Clock, ShieldAlert, Award, X, AlertCircle } from 'lucide-react';

const SPECIALIZATIONS = [
  'All',
  'General Physician',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
  'Psychiatry'
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

export default function DoctorSearchPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    }>
      <DoctorSearchContent />
    </React.Suspense>
  );
}

function DoctorSearchContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [specialization, setSpecialization] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search — wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    // Read optional specialization from URL search parameters (e.g. from symptom checker)
    const spec = searchParams.get('specialization');
    if (spec) {
      const matched = SPECIALIZATIONS.find(s => s.toLowerCase() === spec.toLowerCase());
      if (matched) {
        setSpecialization(matched);
      } else {
        setSpecialization('All');
      }
    }
  }, [searchParams]);

  // SWR with dynamic key based on filters — each filter combo is cached separately
  const swrKey = user ? `/users/doctors?specialization=${specialization === 'All' ? '' : specialization}&search=${debouncedSearch}` : null;
  const { data: doctors, isLoading: listLoading, mutate: mutateDoctors } = useAPI(swrKey);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      addToast('Please select both a date and time slot.', 'warning');
      return;
    }

    try {
      setBookingLoading(true);
      addToast('Scheduling consultation slot...', 'info');

      await axios.post('/appointments', {
        doctorId: selectedDoctor._id,
        date: bookingDate,
        time: bookingTime
      });

      addToast('Appointment booked successfully! Awaiting doctor approval.', 'success');
      setSelectedDoctor(null);
      setBookingDate('');
      setBookingTime('');
      router.push('/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      addToast(error.response?.data?.message || 'Failed to book appointment slot', 'error');
    } finally {
      setBookingLoading(false);
    }
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
      <div className="space-y-6 text-left relative">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Find Healthcare Specialists</h2>
          <p className="text-xs text-slate-400 font-medium">Search for certified clinical practitioners, view fees and reviews, and book sessions</p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, clinic or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-755 rounded-xl text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-755 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-200"
            >
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {listLoading && !doctors ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (doctors || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(doctors || []).map((doc) => {
              const docUser = doc.userId || {};
              const rating = doc.rating || 4.8;
              const exp = doc.experience || 5;

              return (
                <div key={doc._id} className="glass-card border border-slate-200/50 dark:border-slate-700/50 p-6 flex flex-col justify-between hover-lift shadow-sm">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-700 dark:text-primary-300 font-extrabold text-base uppercase shrink-0">
                        {docUser.name ? docUser.name.charAt(0) : '?'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-805 dark:text-slate-100 truncate">Dr. {docUser.name}</h3>
                        <p className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold">{doc.specialization || 'General Health'}</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-bold">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          <span>{rating.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({Math.floor(rating * 15)} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-750/30 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Award size={14} className="text-primary-500" />
                        <span>{exp} Years Exp</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <DollarSign size={14} className="text-emerald-500" />
                        <span>${doc.consultationFee || 45} / slot</span>
                      </div>
                    </div>

                    {/* Qualifications & availability */}
                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
                      <p><strong>Qualification:</strong> {doc.qualification || 'M.D., MBBS'}</p>
                      <p className="truncate"><strong>Working Days:</strong> {doc.availability ? Object.keys(doc.availability).filter(k => doc.availability[k]?.length > 0).join(', ') : 'Mon - Fri'}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-5">
                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Calendar size={13} />
                      Book Consultation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-12 text-center text-slate-405">
            <AlertCircle className="mx-auto mb-2 text-slate-300 dark:text-slate-750 animate-bounce" size={36} />
            No doctors found matching your search. Please adjust your criteria.
          </div>
        )}

        {/* Booking Dialog Modal Overlay */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-xl space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/40 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">Schedule Consultation</h4>
                  <p className="text-[10px] text-primary-500 font-semibold">Dr. {selectedDoctor.userId?.name} ({selectedDoctor.specialization})</p>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* Date Selection */}
                <div className="space-y-1">
                  <label htmlFor="bookingDateInput" className="text-xs font-bold text-slate-500">Consultation Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      id="bookingDateInput"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-750 rounded-xl text-xs sm:text-sm focus:outline-none text-slate-700 dark:text-slate-200"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Available Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingTime(time)}
                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                          bookingTime === time
                            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-755 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info disclaimer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex gap-2 text-[9px] text-slate-400 leading-normal">
                  <Clock size={14} className="shrink-0 text-primary-500" />
                  <span>The slot will require direct manual approval from the practitioner prior to consultation activation.</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700/40 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="px-4 py-2 border border-slate-205 dark:border-slate-750 text-slate-655 dark:text-slate-350 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {bookingLoading ? <Spinner size="sm" color="white" /> : 'Confirm Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
