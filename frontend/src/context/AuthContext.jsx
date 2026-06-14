'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';

axios.defaults.baseURL = '/api';

const AuthContext = createContext();

// Read token synchronously from localStorage at module load time
// This avoids a layout shift / blank screen while waiting for useEffect
function getInitialToken() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getInitialToken);
  // If we have a token, we're loading the profile. If not, we're done.
  const [loading, setLoading] = useState(!!getInitialToken());
  const hasFetched = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get('/auth/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Session validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up axios headers when token changes and fetch profile
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (!hasFetched.current) {
        hasFetched.current = true;
        fetchProfile();
      }
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
      hasFetched.current = false;
    }
  }, [token, fetchProfile]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      hasFetched.current = false;
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      // Support both old positional args and new object style
      const data = typeof payload === 'string'
        ? { name: arguments[0], email: arguments[1], password: arguments[2], role: arguments[3], phone: arguments[4], address: arguments[5] }
        : payload;
      const res = await axios.post('/auth/register', data);
      hasFetched.current = false;
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    hasFetched.current = false;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const res = await axios.put('/auth/profile', profileData);
      setUser(res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    }
  }, []);

  // Memoize context value to prevent cascade re-renders of ALL consumers
  const value = useMemo(() => ({
    user, token, loading, login, register, logout, updateProfile,
    isAuthenticated: !!user, refreshProfile: fetchProfile
  }), [user, token, loading, login, register, logout, updateProfile, fetchProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
