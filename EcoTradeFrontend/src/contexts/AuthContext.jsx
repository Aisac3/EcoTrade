import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        // Ensure user has ecoPoints property
        if (parsedUser && parsedUser.ecoPoints === undefined) {
          const updatedUser = { ...parsedUser, ecoPoints: 100 };
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        console.log('Loaded user from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      
      const user = response.data;
      
      // Ensure user has ecoPoints property
      if (user && user.ecoPoints === undefined) {
        user.ecoPoints = 100;
      }
      
      console.log('User logged in:', user);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Also update ecoPoints in localStorage
      localStorage.setItem('ecoPoints', user.ecoPoints.toString());
      
      return user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      
      const user = response.data;
      
      // Ensure user has ecoPoints property
      if (user && user.ecoPoints === undefined) {
        user.ecoPoints = 100;
      }
      
      console.log('User signed up:', user);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Also update ecoPoints in localStorage
      localStorage.setItem('ecoPoints', user.ecoPoints.toString());
      
      return user;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Failed to create account');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    // Don't clear ecoPoints from localStorage to maintain guest points
  };

  // Update user function
  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateUser,
    error,
    isAdmin: currentUser?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 