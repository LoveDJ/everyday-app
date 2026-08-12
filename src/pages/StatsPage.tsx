import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../store/useAppStore';
import { toLocalDateStr } from '../utils/date';
import { HiBadgeCheck, HiFire, HiCalendar, HiStar } from 'react-icons/hi';

const ACHIEVEMENT_DEFS = [
  { type: 'streak_3', label: '3天连续', icon: '🌱', threshold: 3 },
  { type: 'streak_7', label: '7天连续', icon: '⭐', threshold: 7 },
  { type: 'streak_14', label: '14天连续', icon: '🌟', threshold: 14 },
  { type: 'streak_30', label: '30天坚持', icon: '🏆', threshold: 30 },
  { type: 'streak_100', label: '100天传奇', icon: '👑', threshold: 100 },
  { type: 'total_10', label: '累计10天', icon: '📌', threshold: 10 },
  { type: 'total_50', label: '累计50天', icon: '🎖️', threshold: 50 },
  { type: 'total_100', label: '累计100天', icon: '🏅', threshold: 100 },
];

export default function StatsPage() {
  const { habits, records, getHabitStreak, getLongestStreak, getTotalDays } = useAppStore();

  const totalRecords = records.length;
  const activeHabits = habits.filter((h) => h.enabled);
  const allDates = [...new Set(records.map((r) => r.date))].sort();
  const totalDays = allDates.length;

  // 最近30天每天完成数量
  const last30Days = useMemo(() => {
    const result: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateStr(d);
      const count = new Set(records.filter((r) => r.date === dateStr).map((r) => r.habitId)).size;
      result.push({ date: dateStr.slice(5), count });
    }
    return result;
  }, [records]);

  const chartOption = {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: last30Days.map((d) => d.date),
      axisLabel: { interval: 4, rotate: 30, fontSize: 11 },
    },
    yAxis: { type: 'value' as const, minInterval: 1 },
    series: [
      {
        data: last30Days.map((d) => d.count),
        type: 'bar',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#3B82F6',
        },
        barWidth: '60%',
      },
    ],
    grid: { top: 10, right: 10, bottom: 40, left: 30 },
  };

  // 各习惯完成率
  const habitStats = activeHabits.map((h) => {
    const total = getTotalDays(h.id);
    const streak = getHabitStreak(h.id);
    const longest = getLongestStreak(h.id);
    return { ...h, total, streak, longest };
  });

  // 所有习惯中的最长连续
  const globalLongestStreak = Math.max(0, ...habitStats.map((h) => h.longest));
  const globalCurrentStreak = Math.max(0, ...habitStats.map((h) => h.streak));

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">成就统计</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: HiCalendar, label: '打卡天数', value: totalDays, color: 'text-blue-500' },
          { icon: HiFire, label: '当前连续', value: `${globalCurrentStreak}天`, color: 'text-orange-500' },
          { icon: HiBadgeCheck, label: '最长连续', value: `${globalLongestStreak}天`, color: 'text-yellow-500' },
          { icon: HiStar, label: '总打卡次数', value: totalRecords, color: 'text-purple-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={color} size={18} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* 趋势图 */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">最近30天打卡趋势</h3>
        <ReactECharts option={chartOption} style={{ height: 220 }} />
      </div>

      {/* 各习惯详情 */}
      {habitStats.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">各习惯数据</h3>
          <div className="flex flex-col gap-3">
            {habitStats.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/50">
                <span className="text-xl">{h.icon}</span>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200 flex-1">{h.name}</span>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>累计 <b className="text-gray-700 dark:text-gray-200">{h.total}天</b></span>
                  <span>连续 <b className="text-orange-500">{h.streak}天</b></span>
                  <span>最长 <b className="text-yellow-500">{h.longest}天</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 成就徽章 */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">成就徽章</h3>
        <div className="grid grid-cols-4 gap-3">
          {ACHIEVEMENT_DEFS.map(({ type, label, icon, threshold }) => {
            const unlocked =
              type.startsWith('streak_')
                ? habitStats.some((h) => h.longest >= threshold)
                : habitStats.some((h) => h.total >= threshold);
            return (
              <div
                key={type}
                className={`flex flex-col items-center rounded-xl p-3 transition ${
                  unlocked
                    ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-gray-50 border border-gray-100 opacity-40 dark:bg-gray-700/30 dark:border-gray-700'
                }`}
              >
                <span className="text-2xl mb-1">{icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                {unlocked && <span className="text-xs text-yellow-500 mt-0.5">已解锁 ✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
