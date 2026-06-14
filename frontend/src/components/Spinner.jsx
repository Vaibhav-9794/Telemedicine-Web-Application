'use client';

import React from 'react';

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export default function Spinner({ size = 'md' }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} rounded-full border-primary-200 border-t-primary-500 animate-spin`} />
    </div>
  );
}
