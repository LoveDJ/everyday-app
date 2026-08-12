import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { v4 as uuid } from 'uuid';
import { HiCheckCircle, HiOutlineClock, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import type { Habit, CheckRecord } from '../types';
import { toLocalDateStr } from '../utils/date';

export default function TodayPage() {
  const { habits, addRecord, isCompletedToday, getHabitStreak, settings } = useAppStore();
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const enabledHabits = habits.filter((h) => h.enabled);

  const isWithinTime = (habit: Habit): boolean => {
    const now = new Date();
    const [startH, startM] = habit.timeRange.start.split(':').map(Number);
    const [endH, endM] = habit.timeRange.end.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    return nowMins >= startMins && nowMins <= endMins;
  };

  const handleCheck = (habit: Habit) => {
    const now = new Date();
    const today = toLocalDateStr(now);
    const record: CheckRecord = {
      id: uuid(),
      habitId: habit.id,
      date: today,
      completedAt: now.toISOString(),
      note: noteMap[habit.id] || '',
    };
    addRecord(record);
    setNoteMap((m) => ({ ...m, [habit.id]: '' }));
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const completedCount = enabledHabits.filter((h) => isCompletedToday(h.id)).length;
  const totalCount = enabledHabits.length;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">今日打卡</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{dateStr}</p>
      </div>

      {/* 进度条 */}
      {totalCount > 0 && (
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">今日进度</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 打卡列表 */}
      {enabledHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <HiOutlinePlus size={48} className="mb-3 opacity-40" />
          <p className="text-size-base">还没有打卡习惯</p>
          <p className="text-sm mt-1">前往「习惯管理」添加你的第一个习惯吧！</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enabledHabits.map((habit) => {
            const completed = isCompletedToday(habit.id);
            const withinTime = isWithinTime(habit);
            const streak = getHabitStreak(habit.id);

            return (
              <div
                key={habit.id}
                className={`rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 ${
                  completed ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 打卡按钮 */}
                  <button
                    onClick={() => handleCheck(habit)}
                    disabled={completed || !withinTime}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all mt-0.5 ${
                      completed
                        ? 'border-green-400 bg-green-400 text-white'
                        : withinTime
                        ? 'border-blue-400 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        : 'border-gray-300 text-gray-300 cursor-not-allowed dark:border-gray-600'
                    }`}
                  >
                    <HiCheckCircle size={20} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-lg">{habit.icon}</span>
                      <span
                        className={`font-medium text-size-base ${
                          completed
                            ? 'text-gray-400 line-through dark:text-gray-500'
                            : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        {habit.name}
                      </span>
                      {streak > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full dark:bg-orange-900/40 dark:text-orange-400">
                          🔥 {streak}天
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <HiOutlineClock size={12} />
                      <span>
                        {habit.timeRange.start} - {habit.timeRange.end}
                        {!withinTime && !completed && (
                          <span className="ml-1 text-red-400">（未到打卡时间）</span>
                        )}
                      </span>
                    </div>

                    {/* 备注输入 */}
                    {!completed && withinTime && (
                      <input
                        type="text"
                        placeholder="添加备注（可选）"
                        value={noteMap[habit.id] || ''}
                        onChange={(e) => setNoteMap((m) => ({ ...m, [habit.id]: e.target.value }))}
                        className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    )}
                  </div>

                  {/* 颜色指示 */}
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0 mt-2"
                    style={{ backgroundColor: habit.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
