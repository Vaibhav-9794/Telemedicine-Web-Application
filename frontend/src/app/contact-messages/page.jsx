'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import {
  MessageSquare, Mail, Clock, Eye, Trash2, Search, User,
  CheckCircle, Circle, X, ChevronDown, ChevronUp, Filter
} from 'lucide-react';

export default function AdminContactMessages() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, unread, read
  const [expandedId, setExpandedId] = useState(null);
  const [actionId, setActionId] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setListLoading(true);
      const res = await axios.get('/contact');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
      addToast('Failed to load contact messages', 'error');
    } finally {
      setListLoading(false);
    }
  }, [addToast]);

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
      fetchMessages();
    }
  }, [loading, isAuthenticated, user, router]);

  const markAsRead = async (id) => {
    try {
      setActionId(id);
      await axios.patch(`/contact/${id}/read`);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'read' } : m));
      addToast('Message marked as read', 'success');
    } catch (err) {
      addToast('Failed to update message status', 'error');
    } finally {
      setActionId(null);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      setActionId(id);
      await axios.delete(`/contact/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (expandedId === id) setExpandedId(null);
      addToast('Message deleted', 'success');
    } catch (err) {
      addToast('Failed to delete message', 'error');
    } finally {
      setActionId(null);
    }
  };

  const toggleExpand = (id, status) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Auto-mark as read when expanded
      if (status === 'unread') markAsRead(id);
    }
  };

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredMessages = messages.filter(m => {
    const matchesSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <Sidebar>
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            Contact Messages
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-500 text-white text-[11px] font-bold">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 font-medium">View and manage messages submitted via the Contact Us form</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or subject..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-colors ${
                  statusFilter === f
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'all' ? `All (${messages.length})` : f === 'unread' ? `Unread (${unreadCount})` : `Read (${messages.length - unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {listLoading ? (
            <div className="flex h-48 items-center justify-center"><Spinner size="lg" /></div>
          ) : filteredMessages.length === 0 ? (
            <div className="glass-card p-16 border border-slate-200/50 dark:border-slate-700/50 text-center">
              <MessageSquare size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm text-slate-400">
                {messages.length === 0 ? 'No contact messages received yet.' : 'No messages match your filters.'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isExpanded = expandedId === msg._id;
              const isUnread = msg.status === 'unread';
              return (
                <div
                  key={msg._id}
                  className={`glass-card border shadow-sm transition-all duration-200 ${
                    isUnread
                      ? 'border-primary-200 dark:border-primary-800/50 bg-primary-50/30 dark:bg-primary-950/10'
                      : 'border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  {/* Header Row — always visible */}
                  <button
                    onClick={() => toggleExpand(msg._id, msg.status)}
                    className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors rounded-2xl"
                  >
                    {/* Status indicator */}
                    <div className="shrink-0">
                      {isUnread ? (
                        <div className="w-3 h-3 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}
                    </div>

                    {/* Sender */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm truncate ${isUnread ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                          {msg.name}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">{msg.email}</span>
                      </div>
                      <p className={`text-xs truncate ${isUnread ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                        {msg.subject}
                      </p>
                    </div>

                    {/* Date + expand */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-slate-400 hidden sm:block">
                        {new Date(msg.submittedAt || msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' '}
                        {new Date(msg.submittedAt || msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-slate-200/50 dark:border-slate-700/30">
                      <div className="mt-4 space-y-4">
                        {/* Metadata */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium block mb-0.5">From</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{msg.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Email</span>
                            <a href={`mailto:${msg.email}`} className="font-semibold text-primary-500 hover:underline">{msg.email}</a>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Date</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {new Date(msg.submittedAt || msg.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Time</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {new Date(msg.submittedAt || msg.createdAt).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide block mb-1">Subject</span>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{msg.subject}</p>
                        </div>

                        {/* Message body */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30">
                          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide block mb-2">Message</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors shadow-sm"
                          >
                            <Mail size={13} /> Reply via Email
                          </a>
                          {msg.status === 'unread' && (
                            <button
                              onClick={() => markAsRead(msg._id)}
                              disabled={actionId === msg._id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
                            >
                              <CheckCircle size={13} /> Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(msg._id)}
                            disabled={actionId === msg._id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors ml-auto"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Sidebar>
  );
}
