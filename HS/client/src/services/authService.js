// src/services/authService.js
import api from './api';

// Login user
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data) {
    localStorage.setItem('hmsUser', JSON.stringify(response.data));
  }
  return response.data;
};

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('hmsUser');
};

export default { login, register, logout };