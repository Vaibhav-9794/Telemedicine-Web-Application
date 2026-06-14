'use client';

import React from 'react';

// Shimmer animation built with pure Tailwind
const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

export function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl ${shimmer} ${className}`} />
  );
}

export function SkeletonText({ className = '', lines = 1 }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-slate-200/80 dark:bg-slate-700/50 rounded-full ${shimmer} ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-7 w-16" />
        </div>
        <SkeletonBox className="w-12 h-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <SkeletonBox className="h-7 w-64 mb-2" />
        <SkeletonBox className="h-3 w-48" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 space-y-4">
            <SkeletonBox className="h-4 w-40 mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-2 flex-1">
                  <SkeletonBox className="h-3 w-32" />
                  <SkeletonBox className="h-2 w-48" />
                </div>
                <SkeletonBox className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 space-y-4">
            <SkeletonBox className="h-4 w-36 mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-2 flex-1">
                  <SkeletonBox className="h-3 w-28" />
                  <SkeletonBox className="h-2 w-40" />
                </div>
                <SkeletonBox className="h-8 w-8 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
        <div className="text-sm text-slate-400 font-medium animate-pulse">Loading...</div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Table header */}
      <div className="flex gap-4 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-3 w-16" />
        <SkeletonBox className="h-3 w-20" />
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="flex items-center gap-3 flex-1">
            <SkeletonBox className="w-8 h-8 rounded-full" />
            <div className="space-y-1 flex-1">
              <SkeletonBox className="h-3 w-28" />
              <SkeletonBox className="h-2 w-36" />
            </div>
          </div>
          <SkeletonBox className="h-5 w-14 rounded-full" />
          <SkeletonBox className="h-5 w-12 rounded-md" />
          <SkeletonBox className="h-7 w-7 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 space-y-4">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-12 h-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="h-2 w-20" />
            </div>
          </div>
          <SkeletonText lines={2} />
          <SkeletonBox className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
