import { create } from 'zustand';
import type { Habit, CheckRecord, Achievement, OvertimeRecord, Settings, AppData, PageKey } from '../types';
import { toLocalDateStr } from '../utils/date';

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  fontSize: 'medium',
  accentColor: '#3B82F6',
  autoStart: false,
  notification: true,
};

interface AppState {
  // 数据
  habits: Habit[];
  records: CheckRecord[];
  achievements: Achievement[];
  overtimeRecords: OvertimeRecord[];
  settings: Settings;
  // UI
  currentPage: PageKey;
  loaded: boolean;
  // 操作
  setPage: (page: PageKey) => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  // 习惯操作
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  // 打卡操作
  addRecord: (record: CheckRecord) => void;
  deleteRecord: (id: string) => void;
  // 加班操作
  addOvertimeRecord: (record: OvertimeRecord) => void;
  deleteOvertimeRecord: (id: string) => void;
  updateOvertimeRecord: (id: string, updates: Partial<OvertimeRecord>) => void;
  // 设置操作
  updateSettings: (updates: Partial<Settings>) => void;
  // 成就操作
  addAchievement: (achievement: Achievement) => void;
  // 辅助
  getTodayRecords: () => CheckRecord[];
  getHabitStreak: (habitId: string) => number;
  getLongestStreak: (habitId: string) => number;
  getTotalDays: (habitId: string) => number;
  isCompletedToday: (habitId: string) => boolean;
  exportData: () => Promise<boolean>;
  importData: () => Promise<boolean>;
}

const electronAPI = (window as any).electronAPI;

export const useAppStore = create<AppState>((set, get) => ({
  habits: [],
  records: [],
  achievements: [],
  overtimeRecords: [],
  settings: DEFAULT_SETTINGS,
  currentPage: 'today',
  loaded: false,

  setPage: (page) => set({ currentPage: page }),

  loadData: async () => {
    if (electronAPI) {
      const data: AppData = await electronAPI.readData();
      set({
        habits: data.habits || [],
        records: data.records || [],
        achievements: data.achievements || [],
        overtimeRecords: data.overtimeRecords || [],
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
        loaded: true,
      });
    } else {
      // 浏览器开发模式，从 localStorage 读取
      const raw = localStorage.getItem('everyday-data');
      if (raw) {
        const data = JSON.parse(raw);
        set({
          habits: data.habits || [],
          records: data.records || [],
          achievements: data.achievements || [],
          overtimeRecords: data.overtimeRecords || [],
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    }
    // 应用主题
    const s = get().settings;
    if (s.theme === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.classList.add(`font-size-${s.fontSize}`);
  },

  saveData: async () => {
    const { habits, records, achievements, overtimeRecords, settings } = get();
    const data: AppData = { habits, records, achievements, overtimeRecords, settings };
    if (electronAPI) {
      await electronAPI.writeData(data);
    } else {
      localStorage.setItem('everyday-data', JSON.stringify(data));
    }
  },

  addHabit: (habit) => {
    set((s) => ({ habits: [...s.habits, habit] }));
    get().saveData();
  },

  updateHabit: (id, updates) => {
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
    get().saveData();
  },

  deleteHabit: (id) => {
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      records: s.records.filter((r) => r.habitId !== id),
    }));
    get().saveData();
  },

  toggleHabit: (id) => {
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h)),
    }));
    get().saveData();
  },

  addRecord: (record) => {
    set((s) => ({ records: [...s.records, record] }));
    get().saveData();
  },

  deleteRecord: (id) => {
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
    get().saveData();
  },

  addOvertimeRecord: (record) => {
    set((s) => ({ overtimeRecords: [...s.overtimeRecords, record] }));
    get().saveData();
  },

  deleteOvertimeRecord: (id) => {
    set((s) => ({ overtimeRecords: s.overtimeRecords.filter((r) => r.id !== id) }));
    get().saveData();
  },

  updateOvertimeRecord: (id, updates) => {
    set((s) => ({
      overtimeRecords: s.overtimeRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    get().saveData();
  },

  updateSettings: (updates) => {
    set((s) => {
      const newSettings = { ...s.settings, ...updates };
      // 应用主题
      if (updates.theme) {
        document.documentElement.classList.toggle('dark', updates.theme === 'dark');
      }
      // 应用字体大小
      if (updates.fontSize) {
        document.documentElement.classList.remove(
          'font-size-small', 'font-size-medium', 'font-size-large'
        );
        document.documentElement.classList.add(`font-size-${updates.fontSize}`);
      }
      return { settings: newSettings };
    });
    get().saveData();
  },

  addAchievement: (achievement) => {
    set((s) => ({ achievements: [...s.achievements, achievement] }));
    get().saveData();
  },

  getTodayRecords: () => {
    const today = toLocalDateStr(new Date());
    return get().records.filter((r) => r.date === today);
  },

  isCompletedToday: (habitId: string) => {
    const today = toLocalDateStr(new Date());
    return get().records.some((r) => r.habitId === habitId && r.date === today);
  },

  getHabitStreak: (habitId: string) => {
    const records = get()
      .records.filter((r) => r.habitId === habitId)
      .map((r) => r.date)
      .sort((a, b) => b.localeCompare(a));
    if (records.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // 如果今天有记录从今天开始，否则从昨天开始
    const todayStr = toLocalDateStr(today);
    if (!records.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = toLocalDateStr(checkDate);
      if (records.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  getLongestStreak: (habitId: string) => {
    const records = get()
      .records.filter((r) => r.habitId === habitId)
      .map((r) => r.date)
      .sort();
    if (records.length === 0) return 0;

    let max = 1;
    let current = 1;
    for (let i = 1; i < records.length; i++) {
      const prev = new Date(records[i - 1]);
      const curr = new Date(records[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 1;
      }
    }
    return max;
  },

  getTotalDays: (habitId: string) => {
    return get().records.filter((r) => r.habitId === habitId).length;
  },

  exportData: async () => {
    if (electronAPI) {
      return await electronAPI.exportData();
    } else {
      const { habits, records, achievements, overtimeRecords, settings } = get();
      const data = JSON.stringify({ habits, records, achievements, overtimeRecords, settings }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'everyday-backup.json';
      a.click();
      return true;
    }
  },

  importData: async () => {
    if (electronAPI) {
      const data = await electronAPI.importData();
      if (data) {
        set({
          habits: data.habits || [],
          records: data.records || [],
          achievements: data.achievements || [],
          overtimeRecords: data.overtimeRecords || [],
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
        });
        return true;
      }
      return false;
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      return new Promise((resolve) => {
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) { resolve(false); return; }
          const raw = await file.text();
          const data = JSON.parse(raw);
          set({
            habits: data.habits || [],
            records: data.records || [],
            achievements: data.achievements || [],
            overtimeRecords: data.overtimeRecords || [],
            settings: { ...DEFAULT_SETTINGS, ...data.settings },
          });
          get().saveData();
          resolve(true);
        };
        input.click();
      });
    }
  },
}));
