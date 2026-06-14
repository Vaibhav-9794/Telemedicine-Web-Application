import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FileText, Upload, Plus, Download, Eye, ExternalLink, Calendar } from 'lucide-react';
import Spinner from '../components/Spinner';

const MedicalReports = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  // For Doctors looking up patient reports
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientContacts, setPatientContacts] = useState([]);

  const fetchReports = async (pId = '') => {
    try {
      setLoading(true);
      const url = pId ? `/reports/patient/${pId}` : '/reports/patient';
      const res = await axios.get(url);
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      addToast('Failed to load reports list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/chat/contacts');
      setPatientContacts(res.data.filter(c => c.role === 'patient'));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    if (user.role === 'doctor') {
      fetchContacts();
    } else {
      fetchReports();
    }
  }, [user.role]);

  const handlePatientSelectChange = (e) => {
    const val = e.target.value;
    setSelectedPatientId(val);
    if (val) {
      fetchReports(val);
    } else {
      setReports([]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      addToast('Please specify report title and select a file', 'warning');
      return;
    }

    try {
      setUploading(true);
      addToast('Uploading medical file...', 'info');

      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result;
        
        try {
          await axios.post('/reports/upload', {
            fileName: title,
            fileData: base64Data
          });
          
          addToast('Report uploaded successfully!', 'success');
          setTitle('');
          setFile(null);
          // Reset file input in HTML
          document.getElementById('reportFileInput').value = '';
          fetchReports();
        } catch (err) {
          console.error(err);
          addToast('File upload failed. Check file size/type.', 'error');
        } finally {
          setUploading(false);
        }
      };
    } catch (error) {
      console.error('File reading failed:', error);
      addToast('Failed to read file', 'error');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Medical Records & Reports</h2>
        <p className="text-xs text-slate-400 font-medium">Keep track of lab results, diagnostic files, and digital health history records</p>
      </div>

      {/* Upload panel (Patients only) */}
      {user.role === 'patient' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-teal-650 dark:text-teal-400">
            <Upload size={18} />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Upload New Report</h3>
          </div>

          <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label htmlFor="title" className="text-xs text-slate-450 font-semibold">Report Title / Description</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Blood Test Report"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="reportFileInput" className="text-xs text-slate-450 font-semibold">Pick File (PDF/Image)</label>
              <input
                type="file"
                id="reportFileInput"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 dark:file:bg-teal-950/40 file:text-teal-600 dark:file:text-teal-400 hover:file:bg-teal-100/60 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {uploading ? <Spinner size="sm" color="white" /> : (
                <>
                  <Plus size={15} />
                  Upload Document
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Doctor Patient Lookup Selector */}
      {user.role === 'doctor' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase">Select Patient Records Directory</h3>
          <select
            value={selectedPatientId}
            onChange={handlePatientSelectChange}
            className="w-full max-w-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none capitalize"
          >
            <option value="">-- Choose patient --</option>
            {patientContacts.map(p => (
              <option key={p._id} value={p._id}>{p.name} ({p.phone || 'No phone'})</option>
            ))}
          </select>
        </div>
      )}

      {/* Reports List Table */}
      {((user.role === 'doctor' && selectedPatientId) || user.role === 'patient') && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Uploaded Records History</h3>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                    <th className="pb-3">File Name</th>
                    <th className="pb-3">Upload Date</th>
                    <th className="pb-3 text-right">View / Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{report.fileName}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500">
                        {new Date(report.uploadDate || report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <a
                          href={`/uploads/${report.fileUrl.split('/uploads/')[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-650 dark:text-teal-400 font-bold transition-all border border-teal-100/30 dark:border-teal-900/20"
                        >
                          <Eye size={13} />
                          Open
                          <ExternalLink size={10} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-450 dark:text-slate-500">
              <FileText className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={32} />
              No uploaded records found.
            </div>
          )}
        </div>
      )}

      {/* Select Patient Prompt (Doctors only) */}
      {user.role === 'doctor' && !selectedPatientId && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-12 text-center text-slate-400">
          <Calendar className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={32} />
          Please select a patient from the list above to retrieve their clinical file records.
        </div>
      )}
    </div>
  );
};

export default MedicalReports;
