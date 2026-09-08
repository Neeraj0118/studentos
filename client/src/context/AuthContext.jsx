import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await fetchApi('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error('Session verification failed:', err);
          removeAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return res;
  };

  const verifyOtp = async (email, otpCode) => {
    const res = await fetchApi('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode })
    });
    setAuthToken(res.token);
    setUser(res.user);
    return res;
  };

  const resendOtp = async (email) => {
    const res = await fetchApi('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return res;
  };

  const register = async (name, email, password) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setAuthToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, resendOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
