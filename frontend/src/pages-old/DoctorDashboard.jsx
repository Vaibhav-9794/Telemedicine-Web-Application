import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Users, FileText, Check, X, MessageSquare, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import Spinner from '../components/Spinner';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Prescription Modal State
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [activeAppt, setActiveAppt] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [instructions, setInstructions] = useState('');
  
  // New Medicine input fields
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    duration: '',
    instructions: ''
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/appointments/doctor');
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      addToast('Failed to load appointments queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [addToast]);

  const handleStatusChange = async (apptId, status) => {
    try {
      addToast(`Updating status to ${status}...`, 'info');
      await axios.patch(`/appointments/${apptId}/status`, { status });
      addToast(`Appointment successfully ${status}!`, 'success');
      fetchAppointments();
    } catch (error) {
      console.error('Error changing appointment status:', error);
      addToast('Failed to update status', 'error');
    }
  };

  const handleOpenPrescribeModal = (appt) => {
    setActiveAppt(appt);
    setMedicines([]);
    setInstructions('');
    setNewMed({ name: '', dosage: '', duration: '', instructions: '' });
    setIsPrescribing(true);
  };

  const handleAddMedicine = () => {
    if (!newMed.name || !newMed.dosage || !newMed.duration) {
      addToast('Please specify medicine name, dosage, and duration', 'warning');
      return;
    }
    setMedicines([...medicines, newMed]);
    setNewMed({ name: '', dosage: '', duration: '', instructions: '' });
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (medicines.length === 0) {
      addToast('Please prescribe at least one medicine', 'warning');
      return;
    }

    try {
      addToast('Submitting prescription...', 'info');
      await axios.post('/prescriptions', {
        patientId: activeAppt.patientId._id,
        appointmentId: activeAppt._id,
        medicineDetails: medicines,
        instructions
      });
      addToast('Prescription generated & appointment completed!', 'success');
      setIsPrescribing(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error submitting prescription:', error);
      addToast('Failed to submit prescription', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const activeCount = appointments.filter(a => a.status === 'accepted').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6 text-left relative">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Doctor Console</h2>
        <p className="text-xs text-slate-400 font-medium">Manage patients, schedule approvals, and write prescriptions</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Pending Approvals</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-550/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Accepted Patients</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-550/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Consultations Completed</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{completedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Appointment Queue Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Appointments Queue</h3>

        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-4">
                      <div className="font-bold text-slate-850 dark:text-slate-200">{appt.patientId?.name || 'N/A'}</div>
                      <span className="text-[10px] text-slate-400 font-medium block">ID: {appt.patientId?._id}</span>
                    </td>
                    <td className="py-4">
                      <div>{appt.patientId?.email || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{appt.patientId?.phone || 'N/A'}</div>
                    </td>
                    <td className="py-4">{new Date(appt.date).toLocaleDateString()}</td>
                    <td className="py-4">{appt.time}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        appt.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : appt.status === 'accepted'
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                          : appt.status === 'rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'accepted')}
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 transition-colors"
                              title="Accept Booking"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'rejected')}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors"
                              title="Reject Booking"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}

                        {appt.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => handleOpenPrescribeModal(appt)}
                              className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-sm shadow-teal-500/10 hover:shadow-teal-500/20"
                            >
                              Prescribe Rx
                            </button>
                            <Link
                              to="/chat"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
                              title="Send Message"
                            >
                              <MessageSquare size={14} />
                            </Link>
                          </>
                        )}

                        {appt.status === 'completed' && (
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 italic">Consulted</span>
                        )}
                        
                        {appt.status === 'rejected' && (
                          <span className="text-[10px] text-rose-500 font-semibold italic">Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Calendar className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={32} />
            No booked slots found in schedule database.
          </div>
        )}
      </div>

      {/* Prescription Writing Overlay Modal */}
      {isPrescribing && activeAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/40 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150">Write Medical Prescription</h4>
                <p className="text-[10px] text-slate-400">Patient: {activeAppt.patientId?.name}</p>
              </div>
              <button
                onClick={() => setIsPrescribing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPrescription} className="space-y-4">
              {/* Medicine Add Area */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/30 dark:border-slate-750/30">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Medicine</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Medicine Name</label>
                    <input
                      type="text"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      placeholder="Amoxicillin 500mg"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Dosage</label>
                    <input
                      type="text"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      placeholder="1-0-1 (After Food)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Duration</label>
                    <input
                      type="text"
                      value={newMed.duration}
                      onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                      placeholder="5 Days"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Specific Instructions</label>
                    <input
                      type="text"
                      value={newMed.instructions}
                      onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                      placeholder="Avoid dairy products"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="w-full py-2 bg-teal-50 hover:bg-teal-105 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 border border-teal-100/30 dark:border-teal-900/20 text-teal-650 dark:text-teal-400 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  Add to Rx List
                </button>
              </div>

              {/* Medicines Summary List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350">Prescribed Items</h5>
                {medicines.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{idx + 1}. {med.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Dosage: {med.dosage} | Duration: {med.duration}
                            {med.instructions && ` | Info: ${med.instructions}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No medicines added yet.</p>
                )}
              </div>

              {/* General Advice text area */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">General Advice / Additional Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows="3"
                  placeholder="Drink plenty of water and rest for 2 days."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs sm:text-sm focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700/40 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPrescribing(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-350 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Authorize & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
