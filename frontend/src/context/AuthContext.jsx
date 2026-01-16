import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create an Axios instance for cleaner code
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/auth',
  });

  // 1. Check for existing session on mount (Persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('student_user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
      // Optional: Set default auth header for future requests if you have protected routes
      // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    }
    setLoading(false);
  }, []);

  // 2. Register Function
  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      
      // Store email temporarily so Verify Page knows who to verify
      localStorage.setItem('pending_email', userData.email);
      return response.data;

    } catch (error) {
      // Axios stores the backend error response in error.response.data
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  // 3. Verify OTP Function
  const verifyOtp = async (otp) => {
    try {
      const email = localStorage.getItem('pending_email');
      
      if (!email) {
        throw new Error("No pending registration found. Please register again.");
      }

      const response = await api.post('/verify', { email, otp });

      // Success: Log user in automatically
      const { user, token } = response.data;
      
      localStorage.setItem('student_user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.removeItem('pending_email'); 
      
      setCurrentUser(user);
      return user;

    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      throw new Error(message);
    }
  };

  // 4. Login Function
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });

      // Login Successful
      const { user, token } = response.data;

      localStorage.setItem('student_user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setCurrentUser(user);
      
      return user;

    } catch (error) {
      // Handle "Not Verified" Case
      // Since backend sends 403 for unverified, Axios throws an error.
      // We check the response data inside the catch block.
      if (error.response && error.response.data.needsVerification) {
          localStorage.setItem('pending_email', email);
          throw new Error("NOT_VERIFIED");
      }

      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  // 5. Logout Function
  const logout = () => {
    localStorage.removeItem('student_user');
    localStorage.removeItem('token');
    localStorage.removeItem('pending_email');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    verifyOtp,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};