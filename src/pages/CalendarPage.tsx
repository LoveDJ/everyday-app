import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { v4 as uuid } from 'uuid';
import { HiOutlineRefresh } from 'react-icons/hi';
import { useAppStore } from '../store/useAppStore';
import { toLocalDateStr } from '../utils/date';
import type { Habit } from '../types';

export default function CalendarPage() {
  const { records, habits, addRecord } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = toLocalDateStr(selectedDate);

  const recordsByDate = useMemo(() => {
    const map: globalThis.Record<string, string[]> = {};
    records.forEach((r) => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r.habitId);
    });
    return map;
  }, [records]);

  const enabledHabits = habits.filter((h) => h.enabled);
  const totalEnabled = enabledHabits.length;

  const tileClassName = ({ date }: { date: Date }) => {
    const d = toLocalDateStr(date);
    const habitIds = recordsByDate[d] || [];
    const uniqueCount = new Set(habitIds).size;
    if (totalEnabled === 0) return '';
    if (uniqueCount >= totalEnabled) return 'bg-green-100 dark:bg-green-900/30 rounded-lg';
    if (uniqueCount > 0) return 'bg-yellow-100 dark:bg-yellow-900/30 rounded-lg';
    return '';
  };

  const selectedRecords = records.filter((r) => r.date === dateStr);
  const completedHabits = selectedRecords
    .map((r) => habits.find((h) => h.id === r.habitId))
    .filter(Boolean);

  const today = toLocalDateStr(new Date());

  // 判断习惯是否可以补卡
  const canMakeup = (habit: Habit, dateStr: string): boolean => {
    // 不允许补卡的习惯
    if (!habit.allowMakeup) return false;
    // 今天不需要补卡
    if (dateStr === today) return false;
    // 已经打卡过的不需要补卡
    if (records.some((r) => r.habitId === habit.id && r.date === dateStr)) return false;
    // 检查是否在允许补卡的天数范围内
    const targetDate = new Date(dateStr);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 1 && diffDays <= habit.makeupDays;
  };

  // 补卡操作
  const handleMakeup = (habit: Habit, dateStr: string) => {
    if (!canMakeup(habit, dateStr)) return;
    addRecord({
      id: uuid(),
      habitId: habit.id,
      date: dateStr,
      completedAt: new Date().toISOString(),
      note: '补卡',
    });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">打卡日历</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* 日历 */}
        <div className="col-span-2 rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <Calendar
            value={selectedDate}
            onChange={(val) => val && setSelectedDate(val as Date)}
            tileClassName={tileClassName}
            locale="zh-CN"
            calendarType="iso8601"
          />
          {/* 图例 */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-green-200 dark:bg-green-800" />
              <span className="text-xs text-gray-500 dark:text-gray-400">全部完成</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-yellow-200 dark:bg-yellow-800" />
              <span className="text-xs text-gray-500 dark:text-gray-400">部分完成</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-500 dark:text-gray-400">未完成</span>
            </div>
          </div>
        </div>

        {/* 右侧详情 */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
          </h3>

          {selectedRecords.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              {dateStr === today ? '今天还没有打卡记录' : '这天没有打卡记录'}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {completedHabits.map((habit) => habit && (
                <div key={habit.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
                  <span className="text-base">{habit.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{habit.name}</span>
                  <span className="text-xs text-green-500">✓</span>
                </div>
              ))}
              {(() => {
                const completedIds = new Set(completedHabits.map((h) => h?.id));
                const missing = enabledHabits.filter((h) => !completedIds.has(h.id));
                return missing.map((habit) => {
                  const canDoMakeup = canMakeup(habit, dateStr);
                  return (
                    <div key={habit.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50 opacity-50">
                      <span className="text-base">{habit.icon}</span>
                      <span className="text-sm text-gray-400 flex-1">{habit.name}</span>
                      {canDoMakeup ? (
                        <button
                          onClick={() => handleMakeup(habit, dateStr)}
                          className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-200 transition dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
                          title="补卡"
                        >
                          <HiOutlineRefresh size={12} />
                          补卡
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
