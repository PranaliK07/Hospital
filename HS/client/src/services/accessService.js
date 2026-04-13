// src/services/accessService.js
import api from './api';

const getMyAccess = async () => (await api.get('/access/my')).data;
const getAllAccess = async () => (await api.get('/access')).data;
const updateAccess = async (role, allowedRoutes) =>
  (await api.put(`/access/${role}`, { allowedRoutes })).data;

export default {
  getMyAccess,
  getAllAccess,
  updateAccess,
};
