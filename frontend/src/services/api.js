import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '') + '/api'
  : window.location.hostname === 'localhost'
    ? '/api'
    : window.location.hostname.includes('vercel.app')
      ? 'https://atomalign.onrender.com/api'
      : 'https://atomalign.onrender.com/api';

const API = axios.create({
  baseURL: normalizedApiUrl,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('atomalign_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('atomalign_token');
      localStorage.removeItem('atomalign_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);
export const getMeApi = () => API.get('/auth/me');

// Goals (Employee)
export const getMyGoalsApi = (params) => API.get('/goals', { params });
export const createGoalApi = (data) => API.post('/goals', data);
export const updateGoalApi = (id, data) => API.put(`/goals/${id}`, data);
export const deleteGoalApi = (id) => API.delete(`/goals/${id}`);
export const submitGoalSheetApi = (data) => API.post('/goals/submit', data);
export const updateQuarterlyApi = (id, data) => API.put(`/goals/${id}/quarterly`, data);
export const getGoalApi = (id) => API.get(`/goals/${id}`);

// Manager
export const getTeamGoalsApi = (params) => API.get('/manager/goals', { params });
export const getTeamOverviewApi = () => API.get('/manager/team');
export const approveGoalApi = (id) => API.put(`/manager/goals/${id}/approve`);
export const rejectGoalApi = (id, data) => API.put(`/manager/goals/${id}/reject`, data);
export const editGoalInlineApi = (id, data) => API.put(`/manager/goals/${id}/edit`, data);
export const addCommentApi = (id, data) => API.post(`/manager/goals/${id}/comment`, data);
export const getCommentsApi = (id) => API.get(`/manager/goals/${id}/comments`);

// Admin
export const getAdminDashboardApi = () => API.get('/admin/dashboard');
export const getAdminGoalsApi = (params) => API.get('/admin/goals', { params });
export const unlockGoalApi = (id) => API.put(`/admin/goals/${id}/unlock`);
export const getAuditLogsApi = (params) => API.get('/admin/audit-logs', { params });
export const getCompletionApi = (params) => API.get('/admin/completion', { params });

// Users
export const getUsersApi = () => API.get('/users');
export const getManagersApi = () => API.get('/users/managers');
export const createUserApi = (data) => API.post('/users', data);
export const updateUserApi = (id, data) => API.put(`/users/${id}`, data);
export const deleteUserApi = (id) => API.delete(`/users/${id}`);

// Notifications
export const getNotificationsApi = () => API.get('/notifications');
export const markReadApi = (id) => API.put(`/notifications/${id}/read`);
export const markAllReadApi = () => API.put('/notifications/read-all');

// Reports
export const getReportApi = (params) => API.get('/reports', { params });
export const getDeptSummaryApi = () => API.get('/reports/departments');

export default API;
