import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FileText, Download, Calendar, ShieldCheck } from 'lucide-react';
import Spinner from '../components/Spinner';

const Prescriptions = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/prescriptions');
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      addToast('Failed to load prescriptions history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [addToast]);

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
      link.setAttribute('download', `prescription-${presId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Prescription PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF download error:', error);
      addToast('Failed to download prescription PDF', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Prescriptions Log</h2>
        <p className="text-xs text-slate-400 font-medium">Review signed medical prescription histories and download printable PDF documents</p>
      </div>

      {/* Prescriptions List Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Prescription Records</h3>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                  <th className="pb-3">{user.role === 'patient' ? 'Doctor' : 'Patient'}</th>
                  <th className="pb-3">Clinical Specialization</th>
                  <th className="pb-3">Prescribed Date</th>
                  <th className="pb-3">Medicine Details</th>
                  <th className="pb-3 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {prescriptions.map((pres) => (
                  <tr key={pres._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-4">
                      {user.role === 'patient' ? (
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Dr. {pres.doctorId?.userId?.name || 'Physician'}
                        </div>
                      ) : (
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {pres.patientId?.name || 'Patient'}
                        </div>
                      )}
                      <span className="text-[9px] text-slate-400 font-medium block">
                        ID: {user.role === 'patient' ? pres.doctorId?._id : pres.patientId?._id}
                      </span>
                    </td>
                    <td className="py-4 text-slate-550 capitalize">
                      {user.role === 'patient'
                        ? pres.doctorId?.specialization || 'General Practitioner'
                        : 'Patient Record'}
                    </td>
                    <td className="py-4 text-slate-500">
                      {new Date(pres.createdAt || pres.date).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <div className="max-w-xs sm:max-w-md truncate text-slate-655 dark:text-slate-400 font-medium">
                        {pres.medicineDetails?.map(m => `${m.name} (${m.dosage})`).join(', ') || 'N/A'}
                      </div>
                      {pres.instructions && (
                        <span className="text-[10px] text-slate-400 font-medium italic block mt-0.5">
                          Advice: {pres.instructions}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDownload(pres._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 font-bold transition-all border border-teal-100/30 dark:border-teal-900/20"
                        title="Download PDF"
                      >
                        <Download size={13} />
                        Get PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-450 dark:text-slate-500">
            <FileText className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={32} />
            No prescriptions issued or received found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
