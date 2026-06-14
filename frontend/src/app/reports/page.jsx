'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import { FileText, Upload, Plus, Eye, ExternalLink, Calendar, Users, File } from 'lucide-react';

export default function ReportsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // For Doctors looking up patient reports
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientContacts, setPatientContacts] = useState([]);

  const fetchReports = async (pId = '') => {
    try {
      setListLoading(true);
      const url = pId ? `/reports/patient/${pId}` : '/reports/patient';
      const res = await axios.get(url);
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      addToast('Failed to load reports list', 'error');
    } finally {
      setListLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/chat/contacts');
      // For doctors, we filter contacts that are patients
      setPatientContacts(res.data.filter(c => c.role === 'patient'));
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      if (user.role === 'doctor') {
        fetchContacts();
        setListLoading(false); // don't show spinner yet until patient selected
      } else {
        fetchReports();
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const handlePatientChange = (e) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    if (pId) {
      fetchReports(pId);
    } else {
      setReports([]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileObj = e.target.files[0];
      if (fileObj.size > 5 * 1024 * 1024) {
        addToast('File size exceeds the 5MB limit', 'warning');
        return;
      }
      setSelectedFile(fileObj);
      if (!title) {
        setTitle(fileObj.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) {
      addToast('Please select a file and specify a title.', 'warning');
      return;
    }

    try {
      setUploading(true);
      addToast('Encoding file to Base64 format...', 'info');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result; // Data URL containing prefix

        try {
          await axios.post('/reports/upload', {
            fileName: title.trim(),
            fileData: base64Data
          });

          addToast('Medical report uploaded successfully!', 'success');
          setTitle('');
          setSelectedFile(null);
          // Reset file input
          const fileInput = document.getElementById('reportFileInput');
          if (fileInput) fileInput.value = '';

          fetchReports();
        } catch (err) {
          console.error('Upload request failed:', err);
          addToast(err.response?.data?.message || 'Upload failed', 'error');
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error('FileReader instantiation failed:', err);
      addToast('Failed to read and process selected file', 'error');
      setUploading(false);
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
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Clinical Files & Reports</h2>
          <p className="text-xs text-slate-400 font-medium">Store, review, and manage secure medical files, reports, and lab results</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Patients: Upload Form | Doctors: Contact Selector */}
          <div className="lg:col-span-5 space-y-6">
            {user.role === 'patient' ? (
              <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-2 mb-2">
                  <Upload size={16} className="text-primary-500" />
                  Upload New Report
                </h3>

                <form onSubmit={handleUpload} className="space-y-4">
                  {/* File selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Select Document (PDF/Image, max 5MB)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-205 dark:border-slate-750 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-500 font-semibold">
                            {selectedFile ? selectedFile.name : 'Click to upload files'}
                          </p>
                          <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 5MB</p>
                        </div>
                        <input
                          id="reportFileInput"
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label htmlFor="titleInput" className="text-xs font-bold text-slate-500">Document Title</label>
                    <input
                      type="text"
                      id="titleInput"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Blood Test Report June"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-750 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {uploading ? <Spinner size="sm" color="white" /> : (
                      <>
                        <Plus size={14} />
                        Upload Document
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // Doctor contact list select
              <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-2 mb-2">
                  <Users size={16} className="text-primary-500" />
                  Select Patient Contact
                </h3>

                <div className="space-y-1">
                  <label htmlFor="patientSelect" className="text-xs font-bold text-slate-500">Patient File Records</label>
                  <select
                    id="patientSelect"
                    value={selectedPatientId}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-750 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-200"
                  >
                    <option value="">-- Choose a patient --</option>
                    {patientContacts.map((contact) => (
                      <option key={contact._id} value={contact._id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Files List Table (Right column) */}
          <div className="lg:col-span-7">
            {(user.role === 'patient' || selectedPatientId) ? (
              <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
                  {user.role === 'doctor' ? 'Clinical Document History' : 'My Uploaded Reports'}
                </h3>

                {listLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : reports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                          <th className="pb-3">Document Title</th>
                          <th className="pb-3">Uploaded On</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {reports.map((report) => (
                          <tr key={report._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-teal-500/10 text-primary-500 shrink-0">
                                  <File size={16} />
                                </div>
                                <div className="font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                                  {report.fileName}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-slate-500 font-semibold">
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" />
                                {new Date(report.createdAt || report.date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <a
                                href={report.fileUrl.startsWith('http') ? report.fileUrl : `http://localhost:5000${report.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold transition-all border border-primary-100/30 dark:border-primary-900/20"
                              >
                                <Eye size={13} />
                                View File
                                <ExternalLink size={10} />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-450 dark:text-slate-500">
                    <FileText className="mx-auto mb-2 text-slate-350 dark:text-slate-700" size={36} />
                    No files found in archives.
                  </div>
                )}
              </div>
            ) : (
              // Prompt doctors to select a patient
              user.role === 'doctor' && (
                <div className="glass-card border border-slate-200/50 dark:border-slate-700/50 p-12 text-center text-slate-400 h-full flex flex-col justify-center items-center">
                  <FileText className="mx-auto mb-3 text-slate-300 dark:text-slate-700" size={40} />
                  <h4 className="text-xs font-bold text-slate-650 dark:text-slate-355">Retrieve Patient Files</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                    Select a patient contact from the control list panel to fetch and audit their medical history logs.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
