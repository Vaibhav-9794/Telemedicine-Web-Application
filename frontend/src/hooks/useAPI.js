'use client';

import axios from 'axios';
import useSWR from 'swr';

// Global fetcher: uses the axios instance (which has the auth header set by AuthContext)
const fetcher = (url) => axios.get(url).then(res => res.data);

// SWR default config for blazing fast UX
const defaultConfig = {
  revalidateOnFocus: false,        // Don't refetch when user switches tabs back
  revalidateOnReconnect: true,     // Refetch when internet reconnects
  dedupingInterval: 30000,         // Dedupe identical requests for 30 seconds
  focusThrottleInterval: 30000,    // At most revalidate every 30s on focus
  errorRetryCount: 2,              // Retry failed requests up to 2 times
  errorRetryInterval: 3000,        // Wait 3s between retries
  keepPreviousData: true,          // Show stale data while revalidating (instant feel)
};

/**
 * Hook for cached data fetching — data persists across navigations.
 * @param {string} url - API endpoint (e.g., '/appointments/patient')
 * @param {object} config - Optional SWR overrides
 */
export function useAPI(url, config = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,        // True only on first load (no cached data)
    isValidating,     // True during background revalidation
    mutate,           // Manually trigger revalidation
    isEmpty: !isLoading && !data,
  };
}

/**
 * Hook for multiple parallel requests - fires all at once, caches individually.
 */
export function useMultiAPI(urls, config = {}) {
  const results = urls.map(url =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSWR(url, fetcher, { ...defaultConfig, ...config })
  );

  return {
    data: results.map(r => r.data),
    errors: results.map(r => r.error),
    isLoading: results.some(r => r.isLoading),
    isValidating: results.some(r => r.isValidating),
    mutateAll: () => results.forEach(r => r.mutate()),
  };
}

export { fetcher, defaultConfig };
