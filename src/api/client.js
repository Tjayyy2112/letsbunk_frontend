import axios from 'axios';
import { useStore } from '../store/useStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
});

// Add a request interceptor to inject the token
api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const loginUser      = (data) => api.post('/auth/login', data).then(r => r.data);
export const registerUser   = (data) => api.post('/auth/register', data).then(r => r.data);
export const sendOTP        = (data) => api.post('/auth/send-otp', data).then(r => r.data);
export const resetPassword  = (data) => api.post('/auth/reset-password', data).then(r => r.data);
export const changePassword  = (data) => api.put('/auth/change-password', data).then(r => r.data);

// ── Subjects ──────────────────────────────────────────
export const getSubjects    = ()        => api.get('/subjects').then(r => r.data);
export const createSubject  = (data)    => api.post('/subjects', data).then(r => r.data);
export const updateSubject  = (id,data) => api.put(`/subjects/${id}`, data).then(r => r.data);
export const deleteSubject  = (id, safe=false) =>
  api.delete(`/subjects/${id}?safe=${safe}`).then(r => r.data);

// ── Attendance ────────────────────────────────────────
export const getLogs        = (params={}) => api.get('/attendance', { params }).then(r => r.data);
export const markAttendance = (data)      => api.post('/attendance', data).then(r => r.data);
export const clearAttendance= (date, periodIndex) =>
  api.delete('/attendance', { params: { date, periodIndex } }).then(r => r.data);
export const markDayAttendance = (data)      => api.post('/attendance/day', data).then(r => r.data);
export const clearDayAttendance = (date)      => api.delete('/attendance/day', { params: { date } }).then(r => r.data);
export const resetSemester  = ()          => api.delete('/attendance/reset').then(r => r.data);
export const clearAllData   = ()          => api.delete('/attendance/clear-all').then(r => r.data);

// ── Timetable ─────────────────────────────────────────
export const getTimetable   = ()        => api.get('/timetable').then(r => r.data);
export const createEntry    = (data)    => api.post('/timetable', data).then(r => r.data);
export const updateEntry    = (id,data) => api.put(`/timetable/${id}`, data).then(r => r.data);
export const deleteEntry    = (id)      => api.delete(`/timetable/${id}`).then(r => r.data);

// ── Settings ──────────────────────────────────────────
export const getSettings    = ()     => api.get('/settings').then(r => r.data);
export const updateSettings = (data) => api.put('/settings', data).then(r => r.data);
