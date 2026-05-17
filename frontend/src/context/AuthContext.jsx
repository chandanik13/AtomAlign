import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('atomalign_token');
    const storedUser = localStorage.getItem('atomalign_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await loginApi({ email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('atomalign_token', data.token);
      localStorage.setItem('atomalign_user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('atomalign_token');
    localStorage.removeItem('atomalign_user');
    toast.success('Logged out successfully');
  };

  const isAuthenticated = () => !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
