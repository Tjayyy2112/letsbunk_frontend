import { create } from 'zustand';
import * as api from '../api/client';
import { format } from 'date-fns';

export const useStore = create((set, get) => ({
  // ── Auth State ─────────────────────────────────────
  token:          localStorage.getItem('token') || null,
  user:           JSON.parse(localStorage.getItem('user')) || null,

  // ── State ──────────────────────────────────────────
  activeTab:      'today',
  setActiveTab:   (tab) => set({ activeTab: tab }),
  subjects:       [],
  timetable:      { Mon:[], Tue:[], Wed:[], Thu:[], Fri:[], Sat:[], Sun:[] },
  attendanceLogs: {},   // key: `${subjectId}-${date}`
  settings:       { target_attendance: 75, notifications: true },
  theme:          localStorage.getItem('theme') || 'dark',
  setTheme:       (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  loading:        true,
  error:          null,
  streak:         0,

  // ── Auth Methods ───────────────────────────────────
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.loginUser({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, error: null });
      await get().bootstrap();
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const data = await api.registerUser({ email, password, name });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, error: null });
      await get().bootstrap();
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      subjects: [],
      timetable: { Mon:[], Tue:[], Wed:[], Thu:[], Fri:[], Sat:[], Sun:[] },
      attendanceLogs: {},
      settings: { target_attendance: 75, notifications: true },
    });
  },

  // ── Bootstrap: load everything on app start ────────
  bootstrap: async () => {
    if (!get().token) {
      set({ loading: false });
      return;
    }
    try {
      const [subjects, timetable, logs, settings] = await Promise.all([
        api.getSubjects(),
        api.getTimetable(),
        api.getLogs(),
        api.getSettings(),
      ]);
      // Build log map
      const logMap = {};
      logs.forEach(l => { logMap[`${l.date}-${l.period_index}`] = l; });
      set({ subjects, timetable, attendanceLogs: logMap, settings, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Subjects ───────────────────────────────────────
  addSubject: async (data) => {
    const subject = await api.createSubject(data);
    set(s => ({ subjects: [...s.subjects, subject] }));
    return subject;
  },

  updateSubject: async (id, data) => {
    const updated = await api.updateSubject(id, data);
    set(s => ({ subjects: s.subjects.map(sub => sub.id === id ? updated : sub) }));
  },

  deleteSubject: async (id, safe = false) => {
    await api.deleteSubject(id, safe);
    if (!safe) {
      // Hard delete: remove from UI entirely
      set(s => ({
        subjects: s.subjects.filter(sub => sub.id !== id),
        timetable: Object.fromEntries(
          Object.entries(s.timetable).map(([day, entries]) => [
            day, entries.filter(e => e.subjectId !== id)
          ])
        ),
      }));
    } else {
      // Safe delete: remove only from timetable, keep subject stats visible
      set(s => ({
        timetable: Object.fromEntries(
          Object.entries(s.timetable).map(([day, entries]) => [
            day, entries.filter(e => e.subjectId !== id)
          ])
        ),
      }));
    }
  },

  // ── Attendance ────────────────────────────────────
  markAttendance: async (subjectId, date, status, reason = '', periodIndex, isNewClass = false) => {
    try {
      const { log, subject, oldSubject } = await api.markAttendance({ subjectId, date, status, reason, periodIndex, isNewClass });

      set(s => {
        let newSubjects = s.subjects.map(sub => sub.id === subjectId ? subject : sub);
        if (oldSubject) {
          newSubjects = newSubjects.map(sub => sub.id === oldSubject.id ? oldSubject : sub);
        }

        const updatedLogs = { ...s.attendanceLogs };
        if (isNewClass) {
          const logsOnDate = Object.values(updatedLogs).filter(l => l.date === date);
          logsOnDate.sort((a, b) => b.period_index - a.period_index);
          logsOnDate.forEach(l => {
            if (l.period_index >= periodIndex) {
              delete updatedLogs[`${date}-${l.period_index}`];
              l.period_index += 1;
              updatedLogs[`${date}-${l.period_index}`] = l;
            }
          });
        }
        updatedLogs[`${date}-${periodIndex}`] = log;

        return { subjects: newSubjects, attendanceLogs: updatedLogs };
      });
    } catch (err) {
      console.error('Mark attendance failed:', err);
    }
  },

  clearAttendance: async (date, periodIndex) => {
    try {
      const { subject } = await api.clearAttendance(date, periodIndex);
      
      set(s => {
        const updatedLogs = { ...s.attendanceLogs };
        delete updatedLogs[`${date}-${periodIndex}`];

        const logsOnDate = Object.values(updatedLogs).filter(l => l.date === date);
        logsOnDate.sort((a, b) => a.period_index - b.period_index);
        logsOnDate.forEach(l => {
          if (l.period_index > periodIndex) {
            delete updatedLogs[`${date}-${l.period_index}`];
            l.period_index -= 1;
            updatedLogs[`${date}-${l.period_index}`] = l;
          }
        });

        const newSubjects = s.subjects.map(sub => sub.id === subject.id ? subject : sub);
        return { subjects: newSubjects, attendanceLogs: updatedLogs };
      });
    } catch (err) {
      console.error('Clear attendance failed:', err);
    }
  },

  markDayAttendance: async (date, status, reason = '') => {
    try {
      await api.markDayAttendance({ date, status, reason });
      // Refetch everything as many subjects/logs change
      const [subjects, logs] = await Promise.all([api.getSubjects(), api.getLogs()]);
      const logMap = {};
      logs.forEach(l => { logMap[`${l.date}-${l.period_index}`] = l; });
      set({ subjects, attendanceLogs: logMap });
    } catch (err) {
      console.error('Mark day attendance failed:', err);
      if (err.response?.status === 404) {
        alert(err.response.data.error || 'No classes found for this date.');
      }
    }
  },

  clearDayAttendance: async (date) => {
    try {
      await api.clearDayAttendance(date);
      // Refetch everything
      const [subjects, logs] = await Promise.all([api.getSubjects(), api.getLogs()]);
      const logMap = {};
      logs.forEach(l => { logMap[`${l.date}-${l.period_index}`] = l; });
      set({ subjects, attendanceLogs: logMap });
    } catch (err) {
      console.error('Clear day attendance failed:', err);
    }
  },

  // ── Timetable ─────────────────────────────────────
  addTimetableEntry: async (day, data) => {
    const entry = await api.createEntry({ ...data, day });
    set(s => ({
      timetable: { ...s.timetable, [day]: [...(s.timetable[day] || []), entry] }
    }));
  },

  updateTimetableEntry: async (day, id, data) => {
    const updated = await api.updateEntry(id, { ...data, day });
    set(s => ({
      timetable: {
        ...s.timetable,
        [day]: s.timetable[day].map(e => e.id === id ? updated : e),
      }
    }));
  },

  deleteTimetableEntry: async (day, id) => {
    await api.deleteEntry(id);
    set(s => ({
      timetable: { ...s.timetable, [day]: s.timetable[day].filter(e => e.id !== id) }
    }));
  },

  // ── Settings ──────────────────────────────────────
  updateSettings: async (data) => {
    const updated = await api.updateSettings(data);
    set({ settings: updated });
  },

  // ── Helpers ───────────────────────────────────────
  getLogForDate: (date, periodIndex) => {
    return get().attendanceLogs[`${date}-${periodIndex}`] || null;
  },

  getTodayLectures: () => {
    const { timetable, subjects } = get();
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const day = dayNames[new Date().getDay()];
    return (timetable[day] || []).map(slot => ({
      ...slot,
      subject: subjects.find(s => s.id === slot.subjectId),
    })).filter(l => l.subject);
  },

  resetSemester: async () => {
    await api.resetSemester();
    const subjects = await api.getSubjects();
    set({ subjects, attendanceLogs: {} });
  },

  clearAllData: async () => {
    await api.clearAllData();
    set({
      subjects: [],
      timetable: { Mon:[], Tue:[], Wed:[], Thu:[], Fri:[], Sat:[], Sun:[] },
      attendanceLogs: {}
    });
  },
}));
