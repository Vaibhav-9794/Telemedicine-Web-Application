'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import {
  Calendar, Clock, Save, ChevronLeft, ChevronRight,
  Ban, Check, X,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function generateTimeSlots(startHour = 9, endHour = 17, intervalMin = 30) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMin) {
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const label = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push({ label, value });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/* ─── Helper: Generate empty schedule ────────────────────── */
function createEmptySchedule() {
  const schedule = {};
  DAYS.forEach((day) => {
    schedule[day] = [];
  });
  return schedule;
}

export default function AvailabilityPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [schedule, setSchedule] = useState(createEmptySchedule);
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockDateInput, setBlockDateInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');

  // Fetch existing availability
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchAvailability = async () => {
      try {
        const res = await axios.get('/availability');
        if (res.data) {
          if (res.data.weeklySchedule) {
            setSchedule((prev) => ({ ...prev, ...res.data.weeklySchedule }));
          }
          if (res.data.blockedDates) {
            setBlockedDates(res.data.blockedDates.map((d) => d.slice(0, 10)));
          }
        }
      } catch {
        // No existing availability — start fresh
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [isAuthenticated, user]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  /* ─── Toggle a single time slot ─────────────────────── */
  const toggleSlot = useCallback((day, slotValue) => {
    setSchedule((prev) => {
      const daySlots = prev[day] || [];
      const exists = daySlots.includes(slotValue);
      return {
        ...prev,
        [day]: exists ? daySlots.filter((s) => s !== slotValue) : [...daySlots, slotValue],
      };
    });
  }, []);

  /* ─── Select / Deselect all slots for a day ────────── */
  const toggleAllForDay = useCallback((day) => {
    setSchedule((prev) => {
      const allValues = TIME_SLOTS.map((s) => s.value);
      const daySlots = prev[day] || [];
      const allSelected = allValues.every((v) => daySlots.includes(v));
      return {
        ...prev,
        [day]: allSelected ? [] : [...allValues],
      };
    });
  }, []);

  /* ─── Block date ────────────────────────────────────── */
  const addBlockedDate = () => {
    if (!blockDateInput) return;
    if (blockedDates.includes(blockDateInput)) {
      showToast('Date already blocked', 'warning');
      return;
    }
    setBlockedDates((prev) => [...prev, blockDateInput].sort());
    setBlockDateInput('');
  };

  const removeBlockedDate = (date) => {
    setBlockedDates((prev) => prev.filter((d) => d !== date));
  };

  /* ─── Save ──────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/availability', {
        weeklySchedule: schedule,
        blockedDates,
      });
      showToast('Availability saved successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save availability', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Stats ─────────────────────────────────────────── */
  const stats = useMemo(() => {
    let totalSlots = 0;
    let activeDays = 0;
    DAYS.forEach((day) => {
      const count = (schedule[day] || []).length;
      totalSlots += count;
      if (count > 0) activeDays++;
    });
    return { totalSlots, activeDays, blockedCount: blockedDates.length };
  }, [schedule, blockedDates]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const activeDaySlots = schedule[activeDay] || [];
  const allSelectedForDay = TIME_SLOTS.every((s) => activeDaySlots.includes(s.value));

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Availability
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set your weekly schedule and block specific dates
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Active Days', value: stats.activeDays, icon: Calendar, color: 'primary' },
            { label: 'Time Slots', value: stats.totalSlots, icon: Clock, color: 'emerald' },
            { label: 'Blocked Dates', value: stats.blockedCount, icon: Ban, color: 'red' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 text-center"
              >
                <Icon className={`w-5 h-5 mx-auto mb-2 text-${stat.color}-500`} />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Weekly Schedule */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6">
              {/* Day Tabs */}
              <div className="flex overflow-x-auto border-b border-slate-200/50 dark:border-slate-700/50">
                {DAYS.map((day, i) => {
                  const isActive = activeDay === day;
                  const slotCount = (schedule[day] || []).length;
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`flex-1 min-w-[80px] py-3 px-2 text-center text-sm font-medium transition-all duration-200 relative ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{SHORT_DAYS[i]}</span>
                      {slotCount > 0 && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold">
                          {slotCount}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {activeDay} — Select Time Slots
                  </h3>
                  <button
                    onClick={() => toggleAllForDay(activeDay)}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {allSelectedForDay ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = activeDaySlots.includes(slot.value);
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => toggleSlot(activeDay, slot.value)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                          isSelected
                            ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm shadow-primary-500/10'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                      >
                        <Clock className={`w-3 h-3 mx-auto mb-0.5 ${isSelected ? 'text-primary-500' : 'text-slate-400'}`} />
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Blocked Dates */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                    <Ban className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Blocked Dates
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Block specific dates when you&apos;re unavailable (e.g. holidays, leave).
                </p>

                {/* Add blocked date */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={blockDateInput}
                      onChange={(e) => setBlockDateInput(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-colors duration-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addBlockedDate}
                    className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm font-medium transition-colors"
                  >
                    Block
                  </button>
                </div>

                {/* Blocked dates list */}
                {blockedDates.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {blockedDates.map((date) => (
                      <span
                        key={date}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800"
                      >
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <button
                          type="button"
                          onClick={() => removeBlockedDate(date)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                    No dates blocked yet
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
}
