'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { X, Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import StarRating from '@/components/StarRating';

/**
 * ReviewModal — Modal for submitting doctor reviews after appointments.
 *
 * Props:
 * - isOpen (boolean): Controls modal visibility
 * - onClose (function): Callback to close modal
 * - doctorId (string): Doctor's ID
 * - appointmentId (string): Appointment ID
 * - doctorName (string): Doctor's name to display
 */
export default function ReviewModal({ isOpen, onClose, doctorId, appointmentId, doctorName }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('Please select a rating', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('/reviews', {
        doctor: doctorId,
        appointment: appointmentId,
        rating,
        comment: comment.trim(),
      });
      showToast('Review submitted successfully!', 'success');
      setRating(0);
      setComment('');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Rate Your Experience
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              with Dr. {doctorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              How would you rate your appointment?
            </p>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                onRate={setRating}
                size="lg"
                interactive
              />
            </div>
            {rating > 0 && (
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-2 animate-fadeIn">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Comments (optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
