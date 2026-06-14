'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications</h4>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] font-semibold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                  title="Clear All"
                >
                  <Trash2 size={11} /> Clear
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors flex items-start gap-3 ${
                    !n.read ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{n.message || n.title}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="p-1 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                <Bell className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={24} />
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
