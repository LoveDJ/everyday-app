import { useState, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi';
import { useAppStore } from '../store/useAppStore';
import { toLocalDateStr } from '../utils/date';
import type { OvertimeRecord } from '../types';

const OVERTIME_START_MINS = 17 * 60 + 30; // 下午5点30分开始计算加班（工作日）

/** 判断是否为周末 */
function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** 根据下班时间计算加班小时数 */
function calcOvertimeHours(clockOutTime: string, clockInTime?: string, date?: string): number {
  // 周末：从上班打卡到下班打卡全部算加班
  if (date && isWeekend(date) && clockInTime) {
    const [inH, inM] = clockInTime.split(':').map(Number);
    const [outH, outM] = clockOutTime.split(':').map(Number);
    const inMins = inH * 60 + inM;
    const outMins = outH * 60 + outM;
    if (outMins <= inMins) return 0;
    return Math.round(((outMins - inMins) / 60) * 10) / 10;
  }
  // 工作日：17:30 之后算加班
  const [h, m] = clockOutTime.split(':').map(Number);
  const totalMins = h * 60 + m;
  if (totalMins <= OVERTIME_START_MINS) return 0;
  return Math.round(((totalMins - OVERTIME_START_MINS) / 60) * 10) / 10;
}

/** 格式化小时数显示 */
function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function OvertimePage() {
  const { overtimeRecords, addOvertimeRecord, deleteOvertimeRecord } = useAppStore();

  // 默认日期为昨天
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalDateStr(d);
  }, []);

  const [formDate, setFormDate] = useState(yesterday);
  const [formTime, setFormTime] = useState('19:00');
  const [formClockIn, setFormClockIn] = useState('09:00');
  const [formNote, setFormNote] = useState('');

  // 判断表单日期是否为周末
  const formDateIsWeekend = useMemo(() => isWeekend(formDate), [formDate]);

  // 当前选中的月份 (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const handleAdd = () => {
    if (!formDate || !formTime) return;
    const hours = calcOvertimeHours(formTime, formDateIsWeekend ? formClockIn : undefined, formDate);
    if (hours <= 0) return;

    const record: OvertimeRecord = {
      id: uuid(),
      date: formDate,
      clockOutTime: formTime,
      note: formNote,
    };
    // 周末记录上班时间
    if (formDateIsWeekend) {
      record.clockInTime = formClockIn;
    }
    addOvertimeRecord(record);
    setFormNote('');
    // 添加后日期保持昨天
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setFormDate(toLocalDateStr(d));
  };

  // 筛选当月记录
  const monthRecords = useMemo(() => {
    return overtimeRecords
      .filter((r) => r.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date) || b.clockOutTime.localeCompare(a.clockOutTime));
  }, [overtimeRecords, selectedMonth]);

  // 月统计
  const monthStats = useMemo(() => {
    const totalHours = monthRecords.reduce((sum, r) => sum + calcOvertimeHours(r.clockOutTime, r.clockInTime, r.date), 0);
    const days = monthRecords.length;
    const avgHours = days > 0 ? totalHours / days : 0;
    const maxHours = monthRecords.length > 0
      ? Math.max(...monthRecords.map((r) => calcOvertimeHours(r.clockOutTime, r.clockInTime, r.date)))
      : 0;
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      days,
      avgHours: Math.round(avgHours * 10) / 10,
      maxHours,
    };
  }, [monthRecords]);

  // 月份切换
  const changeMonth = (delta: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthLabel = `${year}年${month}月`;

  // 检查今天是否已经记录了昨天的加班
  const yesterdayRecorded = overtimeRecords.some((r) => r.date === yesterday);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">加班统计</h1>

      {/* 录入表单 */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
          记录下班打卡
          {yesterdayRecorded && (
            <span className="ml-2 text-xs text-green-500 font-normal">（昨天已记录）</span>
          )}
          {formDateIsWeekend && (
            <span className="ml-2 text-xs text-orange-500 font-normal">（周末加班）</span>
          )}
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">日期</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
            />
          </div>
          {formDateIsWeekend && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">上班时间</label>
              <input
                type="time"
                value={formClockIn}
                onChange={(e) => setFormClockIn(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">下班时间</label>
            <input
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
            <label className="text-xs text-gray-500 dark:text-gray-400">备注（可选）</label>
            <input
              type="text"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="如：项目上线"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!formDate || !formTime || calcOvertimeHours(formTime, formDateIsWeekend ? formClockIn : undefined, formDate) <= 0}
            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <HiOutlinePlus size={16} />
            记录
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {formDateIsWeekend
            ? '周末加班：从上班到下班全部时长计入加班'
            : '工作日：加班从 17:30 开始计算，下班时间早于 17:30 不计加班'
          }
          {formTime && calcOvertimeHours(formTime, formDateIsWeekend ? formClockIn : undefined, formDate) > 0 && (
            <span className="ml-2 text-blue-500">
              当前加班时长：{formatHours(calcOvertimeHours(formTime, formDateIsWeekend ? formClockIn : undefined, formDate))}
            </span>
          )}
        </p>
      </div>

      {/* 月度统计卡片 */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              ‹
            </button>
            <span className="text-base font-semibold text-gray-800 dark:text-white min-w-[100px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="加班总时长"
            value={formatHours(monthStats.totalHours)}
            icon={<HiOutlineClock size={18} />}
            color="blue"
          />
          <StatCard
            label="加班天数"
            value={`${monthStats.days}天`}
            icon={<HiOutlineCalendar size={18} />}
            color="green"
          />
          <StatCard
            label="日均加班"
            value={formatHours(monthStats.avgHours)}
            icon={<HiOutlineClock size={18} />}
            color="orange"
          />
          <StatCard
            label="单日最长"
            value={formatHours(monthStats.maxHours)}
            icon={<HiOutlineClock size={18} />}
            color="red"
          />
        </div>
      </div>

      {/* 记录列表 */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
          {monthLabel} 记录明细
        </h2>
        {monthRecords.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            本月暂无加班记录
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {monthRecords.map((r) => {
              const hours = calcOvertimeHours(r.clockOutTime, r.clockInTime, r.date);
              const isWeekendRecord = isWeekend(r.date);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/50 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {r.date}
                      </span>
                      {isWeekendRecord && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full dark:bg-purple-900/40 dark:text-purple-400">
                          周末
                        </span>
                      )}
                      {r.clockInTime && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full dark:bg-green-900/40 dark:text-green-400">
                          {r.clockInTime} 上班
                        </span>
                      )}
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full dark:bg-blue-900/40 dark:text-blue-400">
                        {r.clockOutTime} 下班
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full dark:bg-orange-900/40 dark:text-orange-400">
                        +{formatHours(hours)}
                      </span>
                    </div>
                    {r.note && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                        {r.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteOvertimeRecord(r.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
  };
  const textColorMap = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex flex-col items-center rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
      <div className={`rounded-lg p-2 mb-2 ${colorMap[color]}`}>{icon}</div>
      <span className={`text-lg font-bold ${textColorMap[color]}`}>{value}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}
