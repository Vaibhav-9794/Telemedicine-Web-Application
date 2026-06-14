import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Search, Calendar, Star, DollarSign, Clock, ShieldAlert, Award, X } from 'lucide-react';
import Spinner from '../components/Spinner';

const DoctorSearch = () => {
  const { addToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users/doctors', {
        params: {
          specialization: specialization === 'All' ? '' : specialization,
          search
        }
      });
      setDoctors(res.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      addToast('Failed to load doctors list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, addToast]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleOpenBookingModal = (doc) => {
    setSelectedDoctor(doc);
    setBookingDate('');
    setBookingTime('');
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      addToast('Please select both a date and time slot', 'warning');
      return;
    }

    try {
      setBookingLoading(true);
      addToast('Booking appointment slot...', 'info');
      await axios.post('/appointments', {
        doctorId: selectedDoctor._id,
        date: bookingDate,
        time: bookingTime
      });
      addToast('Appointment booked successfully! Awaiting doctor approval.', 'success');
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error booking appointment:', error);
      addToast(error.response?.data?.message || 'Failed to book appointment', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const specializations = [
    'All',
    'General Physician',
    'Cardiology',
    'Neurology',
    'Dermatology',
    'Gastroenterology',
    'Psychiatry',
    'Pediatrician'
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Search & Book Doctors</h2>
        <p className="text-xs text-slate-400 font-medium">Browse verified clinical specialists, view slot availabilities, and book virtual consults</p>
      </div>

      {/* Filter Options Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Specialization pills list */}
        <div className="flex flex-wrap gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialization(spec)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                specialization === spec
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/30 dark:border-slate-755 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-805'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Search Name Input form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor name..."
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-sm"
          >
            <Search size={15} />
          </button>
        </form>
      </div>

      {/* Doctors Cards Container */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Doctor Avatar Header */}
                <div className="flex gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center font-black text-teal-700 dark:text-teal-400 text-base uppercase shrink-0">
                    {doc.userId?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                      Dr. {doc.userId?.name || 'Physician'}
                    </h3>
                    <span className="text-[10px] text-teal-650 dark:text-teal-400 font-bold block capitalize mt-0.5">
                      {doc.specialization}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {doc.qualification}
                    </span>
                  </div>
                </div>

                {/* Info Badges */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-750/30 text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-400">Experience:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{doc.experience} Years</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400">Consultation Fee:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">${doc.consultationFee}</p>
                  </div>
                </div>

                {/* Rating & Availability */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star size={14} className="fill-current" />
                    <span>{doc.rating || '4.8'}</span>
                  </div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={12} />
                    Mon-Fri Available
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenBookingModal(doc)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Calendar size={14} />
                Book Consultation Slot
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-12 text-center text-slate-400">
          <Award className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={32} />
          No doctors match the selected search criteria.
        </div>
      )}

      {/* Booking Slot Selection Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-xl space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/40 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150">Select Appointment Slot</h4>
                <p className="text-[10px] text-slate-400">Dr. {selectedDoctor.userId?.name}</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {/* Date Input */}
              <div className="space-y-1">
                <label htmlFor="date" className="text-xs font-bold text-slate-500">Choose Consultation Date</label>
                <input
                  type="date"
                  id="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]} // prevent booking in the past
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
                  required
                />
              </div>

              {/* Time Slots Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Available Time Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setBookingTime(time)}
                      className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                        bookingTime === time
                          ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-755 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700/40 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-355 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {bookingLoading ? <Spinner size="sm" color="white" /> : 'Confirm Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
