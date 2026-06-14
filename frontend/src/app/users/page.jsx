'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import {
  Users, Lock, Unlock, Search, ShieldAlert, Eye, BadgeCheck,
  Clock, X, Droplets, AlertTriangle, Pill, Phone, Calendar,
  FileText, User, MapPin, Mail, ShieldCheck, Ban
} from 'lucide-react';

const roleColors = {
  admin:   'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30',
  doctor:  'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100/50 dark:border-teal-900/30',
  patient: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/30',
};

const verificationBadge = (u) => {
  if (u.isVerified) return { label: 'Verified', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', icon: BadgeCheck };
  if (u.governmentIdFile || u.governmentIdType) return { label: 'Pending', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock };
  return { label: 'Unverified', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', icon: ShieldAlert };
};

export default function AdminUsersPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [detailModal, setDetailModal] = useState(null); // user details object
  const [detailLoading, setDetailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setListLoading(true);
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
      addToast('Failed to load registered platform users', 'error');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      if (user.role !== 'admin') {
        addToast('Permission denied. Admin console only.', 'error');
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [loading, isAuthenticated, user, router]);

  const toggleStatus = async (target) => {
    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    try {
      setActionId(target._id);
      await axios.patch(`/admin/users/${target._id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === target._id ? { ...u, status: newStatus } : u));
      addToast(`User account status updated to ${newStatus} successfully!`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to toggle user status', 'error');
    } finally {
      setActionId(null);
    }
  };

  const viewDetails = useCallback(async (userId) => {
    try {
      setDetailLoading(true);
      const res = await axios.get(`/admin/users/${userId}/details`);
      setDetailModal(res.data);
    } catch (err) {
      addToast('Failed to load user details', 'error');
    } finally {
      setDetailLoading(false);
    }
  }, [addToast]);

  const verifyDocument = useCallback(async (userId, verified) => {
    try {
      setVerifyLoading(true);
      await axios.patch(`/admin/users/${userId}/verify`, { verified });
      setDetailModal(prev => prev ? { ...prev, isVerified: verified } : null);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: verified } : u));
      addToast(`Patient ${verified ? 'verified' : 'unverified'} successfully!`, 'success');
    } catch (err) {
      addToast('Failed to update verification status', 'error');
    } finally {
      setVerifyLoading(false);
    }
  }, [addToast]);

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Platform User Directory</h2>
          <p className="text-xs text-slate-400 font-medium">Audit account profiles, verify documents, and manage system access</p>
        </div>

        {/* Filter bar */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email address..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-755 rounded-xl text-xs focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Users Table */}
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {listLoading ? (
            <div className="flex h-48 items-center justify-center"><Spinner size="lg" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-405">
              <Users size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-750" />
              No user accounts found matching this criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                    <th className="pb-3">User Profile</th>
                    <th className="pb-3">Access Role</th>
                    <th className="pb-3">Verification</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Specialization</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredUsers.map(u => {
                    const badge = verificationBadge(u);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-xs uppercase shrink-0">
                              {u.profilePhoto ? (
                                <img src={u.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
                              ) : (u.name ? u.name.charAt(0) : '?')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                              {u.patientId && <p className="text-[9px] text-primary-500 font-bold">{u.patientId}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.color}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-550 dark:text-slate-400 font-semibold">{u.phone || '—'}</td>
                        <td className="py-3.5 text-slate-550 dark:text-slate-400 font-semibold">
                          {u.doctorProfile?.specialization || '—'}
                        </td>
                        <td className="py-3.5 font-bold text-xs">
                          <span className={u.status === 'active' ? 'text-primary-500' : 'text-rose-500'}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Details */}
                            <button
                              onClick={() => viewDetails(u._id)}
                              title="View Full Profile"
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-100/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Eye size={13} />
                            </button>

                            {/* Toggle Status */}
                            {u._id === user._id ? (
                              <span className="text-[10px] text-slate-400 italic px-1">Self</span>
                            ) : (
                              <button
                                onClick={() => toggleStatus(u)}
                                disabled={actionId === u._id}
                                title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-rose-50 hover:bg-rose-105 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border-rose-100/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-455'
                                    : 'bg-teal-50 hover:bg-teal-105 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 border-teal-100/50 dark:border-teal-900/30 text-teal-650 dark:text-teal-400'
                                }`}
                              >
                                {actionId === u._id ? (
                                  <Spinner size="sm" color="gray" />
                                ) : u.status === 'active' ? (
                                  <Lock size={13} />
                                ) : (
                                  <Unlock size={13} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {(detailModal || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !detailLoading && setDetailModal(null)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 animate-slideInUp">
            {/* Close button */}
            <button
              onClick={() => setDetailModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors z-10"
            >
              <X size={16} />
            </button>

            {detailLoading && !detailModal ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : detailModal && (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-xl font-black text-primary-700 dark:text-primary-300 shrink-0">
                    {detailModal.profilePhoto ? (
                      <img src={detailModal.profilePhoto} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                    ) : (detailModal.name ? detailModal.name.charAt(0) : '?')}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{detailModal.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${roleColors[detailModal.role] || ''}`}>
                        {detailModal.role}
                      </span>
                      {detailModal.patientId && (
                        <span className="text-[10px] font-bold text-primary-500">{detailModal.patientId}</span>
                      )}
                      {detailModal.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" /> Unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {detailModal.stats && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-center">
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">{detailModal.stats.totalAppointments}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Appointments</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{detailModal.stats.totalPrescriptions}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Prescriptions</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-center">
                      <p className="text-lg font-black text-purple-600 dark:text-purple-400">{detailModal.stats.totalReports}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Reports</p>
                    </div>
                  </div>
                )}

                {/* Personal Info */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-400 font-medium">Email</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.email}</p></div>
                    <div><span className="text-slate-400 font-medium">Phone</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.phone || '—'}</p></div>
                    <div><span className="text-slate-400 font-medium">Gender</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.gender || '—'}</p></div>
                    <div><span className="text-slate-400 font-medium">Date of Birth</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.dateOfBirth ? new Date(detailModal.dateOfBirth).toLocaleDateString() : '—'}</p></div>
                    <div className="col-span-2"><span className="text-slate-400 font-medium">Address</span><p className="font-semibold text-slate-700 dark:text-slate-300">{[detailModal.address, detailModal.city, detailModal.state, detailModal.country, detailModal.postalCode].filter(Boolean).join(', ') || '—'}</p></div>
                  </div>
                </div>

                {/* Medical Info */}
                {detailModal.role === 'patient' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-red-500" /> Medical Information
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                      <div><span className="text-slate-400 font-medium">Blood Group</span><p className="font-bold text-red-600 dark:text-red-400 text-sm">{detailModal.bloodGroup || '—'}</p></div>
                      <div><span className="text-slate-400 font-medium">Height</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.height ? `${detailModal.height} cm` : '—'}</p></div>
                      <div><span className="text-slate-400 font-medium">Weight</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.weight ? `${detailModal.weight} kg` : '—'}</p></div>
                    </div>
                    {detailModal.allergies?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Allergies</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {detailModal.allergies.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-[10px] font-medium text-amber-700 dark:text-amber-300">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailModal.chronicDiseases?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-slate-400 font-medium text-[11px]">Chronic Diseases</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {detailModal.chronicDiseases.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-[10px] font-medium text-red-700 dark:text-red-300">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailModal.currentMedications?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1"><Pill className="w-3 h-3" /> Current Medications</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {detailModal.currentMedications.map((m, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-[10px] font-medium text-primary-700 dark:text-primary-300">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Emergency Contact */}
                {detailModal.emergencyContact && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" /> Emergency Contact
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div><span className="text-slate-400 font-medium">Name</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.emergencyContact.name || '—'}</p></div>
                      <div><span className="text-slate-400 font-medium">Relationship</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.emergencyContact.relationship || '—'}</p></div>
                      <div><span className="text-slate-400 font-medium">Phone</span><p className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.emergencyContact.phone || '—'}</p></div>
                    </div>
                  </div>
                )}

                {/* Document Verification */}
                {detailModal.role === 'patient' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary-500" /> Document Verification
                    </h4>
                    {detailModal.governmentIdType ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">ID Type</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.governmentIdType}</span>
                        </div>
                        {detailModal.governmentIdNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">ID Number</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{detailModal.governmentIdNumber}</span>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          {!detailModal.isVerified ? (
                            <>
                              <button
                                onClick={() => verifyDocument(detailModal._id, true)}
                                disabled={verifyLoading}
                                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                {verifyLoading ? <Spinner size="sm" /> : <><BadgeCheck size={14} /> Approve & Verify</>}
                              </button>
                              <button
                                onClick={() => verifyDocument(detailModal._id, false)}
                                disabled={verifyLoading}
                                className="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <Ban size={14} /> Reject
                              </button>
                            </>
                          ) : (
                            <div className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                              <BadgeCheck size={14} /> Document Verified
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No government ID uploaded yet.</p>
                    )}
                  </div>
                )}

                {/* Account Info */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 flex flex-wrap gap-4">
                  <span>Created: {new Date(detailModal.createdAt).toLocaleDateString()}</span>
                  <span>Last Updated: {new Date(detailModal.updatedAt).toLocaleDateString()}</span>
                  <span>Status: <b className={detailModal.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}>{detailModal.status}</b></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Sidebar>
  );
}
