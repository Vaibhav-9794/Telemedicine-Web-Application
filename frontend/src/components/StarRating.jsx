'use client';

import React from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating — Reusable star rating component.
 *
 * Props:
 * - rating (number): Current rating value (1-5)
 * - onRate (function): Callback when a star is clicked (interactive mode)
 * - size (string): 'sm' | 'md' | 'lg' — controls icon size (default 'md')
 * - interactive (boolean): If true, stars are clickable (default false)
 * - showLabel (boolean): If true, shows "x/5" label next to stars (default false)
 */
export default function StarRating({
  rating = 0,
  onRate,
  size = 'md',
  interactive = false,
  showLabel = false,
}) {
  const [hovered, setHovered] = React.useState(0);

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (interactive ? hovered || rating : rating);

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={`transition-all duration-200 ${
              interactive
                ? 'cursor-pointer hover:scale-110 active:scale-95'
                : 'cursor-default'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${iconSize} transition-colors duration-200 ${
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        );
      })}
      {showLabel && (
        <span className="ml-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
          {rating}/5
        </span>
      )}
    </div>
  );
}
