import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { v4 as uuid } from 'uuid';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiSwitchHorizontal } from 'react-icons/hi';
import type { Habit } from '../types';

const ICONS = ['🏃', '📚', '💧', '🧘', '🎯', '💪', '🎨', '✍️', '🛌', '🍎', '🎵', '🧹', '💊', '🌅', '🧠'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const CATEGORIES = ['健康', '学习', '工作', '生活', '其他'];

const EMPTY_HABIT: Omit<Habit, 'id' | 'createdAt'> = {
  name: '', icon: '🏃', color: '#3B82F6', description: '',
  timeRange: { start: '08:00', end: '22:00' },
  category: '生活', enabled: true, allowMakeup: false, makeupDays: 1,
};

export default function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabit } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_HABIT);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateHabit(editingId, form);
      setEditingId(null);
    } else {
      addHabit({ ...form, id: uuid(), createdAt: new Date().toISOString() });
    }
    setForm(EMPTY_HABIT);
    setShowForm(false);
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setForm({
      name: habit.name, icon: habit.icon, color: habit.color, description: habit.description,
      timeRange: habit.timeRange, category: habit.category, enabled: habit.enabled,
      allowMakeup: habit.allowMakeup, makeupDays: habit.makeupDays,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除该习惯？相关打卡记录也会被删除。')) {
      deleteHabit(id);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">习惯管理</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_HABIT); }}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 transition"
        >
          <HiOutlinePlus size={16} /> 新建习惯
        </button>
      </div>

      {/* 表单 */}
      {showForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4 text-gray-800 dark:text-white">
            {editingId ? '编辑习惯' : '新建习惯'}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">名称 *</label>
              <input
                type="text" value={form.name} placeholder="如：早起跑步"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">分类</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* 图标选择 */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">图标</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`h-9 w-9 rounded-lg text-lg transition ${
                    form.icon === icon ? 'bg-blue-100 ring-2 ring-blue-400 dark:bg-blue-900/40' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700'
                  }`}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* 颜色选择 */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">颜色</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-7 w-7 rounded-full transition ring-offset-2 ${
                    form.color === c ? 'ring-2 ring-blue-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* 时间段 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">打卡开始时间</label>
              <input
                type="time" value={form.timeRange.start}
                onChange={(e) => setForm({ ...form, timeRange: { ...form.timeRange, start: e.target.value } })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">打卡结束时间</label>
              <input
                type="time" value={form.timeRange.end}
                onChange={(e) => setForm({ ...form, timeRange: { ...form.timeRange, end: e.target.value } })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* 描述 */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">描述（可选）</label>
            <textarea
              value={form.description} rows={2} placeholder="简单描述这个习惯..."
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
          </div>

          {/* 补卡 */}
          <div className="flex items-center gap-4 mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={form.allowMakeup}
                onChange={(e) => setForm({ ...form, allowMakeup: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">允许补卡</span>
            </label>
            {form.allowMakeup && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">最多补</span>
                <input
                  type="number" min={1} max={7} value={form.makeupDays}
                  onChange={(e) => setForm({ ...form, makeupDays: parseInt(e.target.value) || 1 })}
                  className="w-16 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">天</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={handleSubmit} className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 transition">
              {editingId ? '保存修改' : '创建习惯'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_HABIT); }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >取消</button>
          </div>
        </div>
      )}

      {/* 习惯列表 */}
      {habits.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <p className="text-size-base mb-1">还没有任何习惯</p>
          <p className="text-sm">点击右上角「新建习惯」开始吧！</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 ${
                !habit.enabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 dark:text-white">{habit.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-700">
                      {habit.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    ⏰ {habit.timeRange.start} - {habit.timeRange.end}
                    {habit.description && ` · ${habit.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`rounded-lg px-2 py-1 text-xs transition ${
                      habit.enabled
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                    }`}
                  >{habit.enabled ? '已启用' : '已禁用'}</button>
                  <button
                    onClick={() => startEdit(habit)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  ><HiOutlinePencil size={14} /></button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition"
                  ><HiOutlineTrash size={14} /></button>
                </div>
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
