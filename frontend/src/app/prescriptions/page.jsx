'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import { FileText, Download, Calendar, ShieldCheck, Plus, Trash2, X, ClipboardList } from 'lucide-react';

export default function PrescriptionsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Form state for doctor writing prescription
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // New medicine entry state
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    duration: '',
    instructions: ''
  });

  const fetchPrescriptions = async () => {
    try {
      setListLoading(true);
      const res = await axios.get('/prescriptions');
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      addToast('Failed to load prescriptions history', 'error');
    } finally {
      setListLoading(false);
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      const res = await axios.get('/appointments/doctor');
      // Only allow prescribing to accepted or completed appointments
      setAppointments(res.data.filter(a => a.status === 'accepted' || a.status === 'completed'));
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchPrescriptions();
      if (user.role === 'doctor') {
        fetchDoctorAppointments();
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const handleDownload = async (presId) => {
    try {
      addToast('Generating PDF prescription download...', 'info');
      const res = await axios.get(`/prescriptions/${presId}/download`, {
        responseType: 'blob'
      });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `prescription_${presId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF download error:', error);
      addToast('Failed to download PDF prescription', 'error');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptId) {
      addToast('Please select a patient appointment session', 'warning');
      return;
    }
    if (medicines.length === 0) {
      addToast('Please prescribe at least one medicine', 'warning');
      return;
    }

    const appt = appointments.find(a => a._id === selectedApptId);
    if (!appt) return;

    try {
      setSubmitLoading(true);
      addToast('Authorizing and generating Rx PDF...', 'info');

      await axios.post('/prescriptions', {
        patientId: appt.patientId._id,
        appointmentId: appt._id,
        medicineDetails: medicines,
        instructions
      });

      addToast('Prescription generated successfully!', 'success');
      setShowForm(false);
      setMedicines([]);
      setInstructions('');
      setSelectedApptId('');
      fetchPrescriptions();
    } catch (error) {
      console.error('Prescription creation error:', error);
      addToast(error.response?.data?.message || 'Failed to submit prescription', 'error');
    } finally {
      setSubmitLoading(false);
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
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Prescriptions Rx Archive</h2>
            <p className="text-xs text-slate-400 font-medium">Review clinical prescriptions history and download signed PDF records</p>
          </div>
          {user.role === 'doctor' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-sm text-xs transition-all"
            >
              {showForm ? 'Cancel Creation' : 'Issue New Prescription'}
            </button>
          )}
        </div>

        {/* Doctor issue prescription form overlay/panel */}
        {user.role === 'doctor' && showForm && (
          <div className="glass-card p-6 border border-slate-205 dark:border-slate-755 shadow-md space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
              <h3 className="text-sm font-bold text-slate-805 dark:text-slate-100">Write Medical Prescription</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-655"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Select Patient */}
              <div className="md:col-span-12 space-y-1">
                <label className="text-xs font-bold text-slate-500">Select Patient Appointment Session</label>
                <select
                  value={selectedApptId}
                  onChange={(e) => setSelectedApptId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-750 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-200"
                  required
                >
                  <option value="">-- Choose patient --</option>
                  {appointments.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.patientId?.name} - {new Date(a.date).toLocaleDateString()} at {a.time} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicine inputs (left) */}
              <div className="md:col-span-6 space-y-4 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-750/30 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Add Prescription Item</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Medicine Name</label>
                    <input
                      type="text"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      placeholder="Paracetamol 650mg"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Dosage</label>
                    <input
                      type="text"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      placeholder="1-0-1 (After Food)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-200"
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
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450">Item Advice (Optional)</label>
                    <input
                      type="text"
                      value={newMed.instructions}
                      onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                      placeholder="Take with warm water"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="w-full py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 font-bold rounded-xl text-xs transition-colors border border-teal-100/30 dark:border-teal-900/20 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Add Medicine
                </button>
              </div>

              {/* Medicine summary list & instructions (right) */}
              <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-705 dark:text-slate-350">Prescribed Rx Items List</h4>
                  {medicines.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50 border border-slate-200/50 dark:border-slate-750/30 rounded-2xl p-4 bg-white dark:bg-slate-950 max-h-48 overflow-y-auto">
                      {medicines.map((med, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
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
                    <div className="border border-slate-200/50 dark:border-slate-750/30 rounded-2xl p-6 bg-white dark:bg-slate-950 text-center text-slate-400 text-xs italic">
                      No medicines added yet.
                    </div>
                  )}
                </div>

                {/* General instructions */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">General Consultation Advice / Recommendations</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows="2"
                    placeholder="e.g. Bed rest for 2 days, avoid oily foods."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-750 rounded-xl text-xs focus:outline-none resize-none text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Submit buttons */}
              <div className="md:col-span-12 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700/40 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-205 dark:border-slate-750 text-slate-655 dark:text-slate-350 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || medicines.length === 0}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {submitLoading ? <Spinner size="sm" color="white" /> : 'Authorize & Issue Rx'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Prescriptions List Table */}
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {listLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                    <th className="pb-3">{user.role === 'doctor' ? 'Patient' : 'Doctor'}</th>
                    <th className="pb-3">Issued On</th>
                    <th className="pb-3">Prescribed Medicines</th>
                    <th className="pb-3 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {prescriptions.map((pres) => {
                    const targetUser = user.role === 'doctor' ? pres.patientId : pres.doctorId?.userId;
                    const specialty = user.role !== 'doctor' ? pres.doctorId?.specialization : null;

                    return (
                      <tr key={pres._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-105 dark:bg-primary-950 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-xs uppercase shrink-0">
                              {targetUser?.name ? targetUser.name.charAt(0) : '?'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {user.role === 'doctor' ? '' : 'Dr. '}{targetUser?.name || 'N/A'}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {specialty ? `${specialty} | ` : ''}{targetUser?.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-slate-655 dark:text-slate-350">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(pres.createdAt || pres.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="max-w-xs sm:max-w-md truncate text-slate-655 dark:text-slate-350 font-medium">
                            {pres.medicineDetails?.map(m => `${m.name} (${m.dosage})`).join(', ') || 'Rx Details'}
                          </div>
                          {pres.instructions && (
                            <span className="text-[10px] text-primary-500 font-bold block mt-0.5">
                              Advice: {pres.instructions}
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDownload(pres._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold transition-all border border-primary-100/30 dark:border-primary-900/20"
                            title="Download PDF Rx File"
                          >
                            <Download size={13} />
                            Get PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-450 dark:text-slate-500">
              <ClipboardList className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={36} />
              No clinical prescriptions found in historical logs.
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
