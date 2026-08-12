export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  timeRange: { start: string; end: string };
  category: string;
  enabled: boolean;
  createdAt: string;
  allowMakeup: boolean;
  makeupDays: number;
}

export interface CheckRecord {
  id: string;
  habitId: string;
  date: string;
  completedAt: string;
  note: string;
}

export interface Achievement {
  id: string;
  habitId: string;
  type: string;
  unlockedAt: string;
}

export interface OvertimeRecord {
  id: string;
  date: string;          // 加班日期 (YYYY-MM-DD)
  clockOutTime: string;  // 下班打卡时间 (HH:mm)
  note: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
  autoStart: boolean;
  notification: boolean;
}

export interface AppData {
  habits: Habit[];
  records: CheckRecord[];
  achievements: Achievement[];
  overtimeRecords: OvertimeRecord[];
  settings: Settings;
}

export type PageKey = 'today' | 'habits' | 'calendar' | 'stats' | 'overtime' | 'pomodoro' | 'settings';
