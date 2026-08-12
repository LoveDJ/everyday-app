import { useAppStore } from '../store/useAppStore';
import { HiDownload, HiUpload } from 'react-icons/hi';

const ACCENT_COLORS = [
  { name: '蓝色', value: '#3B82F6' },
  { name: '绿色', value: '#10B981' },
  { name: '紫色', value: '#8B5CF6' },
  { name: '粉色', value: '#EC4899' },
  { name: '橙色', value: '#F97316' },
  { name: '红色', value: '#EF4444' },
];

export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData } = useAppStore();

  const handleExport = async () => {
    const ok = await exportData();
    if (ok) alert('数据导出成功！');
  };

  const handleImport = async () => {
    const ok = await importData();
    if (ok) alert('数据导入成功！');
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">设置</h1>

      {/* 外观 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">外观</h3>

        {/* 主题 */}
        <div className="mb-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">主题模式</p>
          <div className="flex gap-3">
            {([
              { value: 'light', label: '浅色', icon: '☀️' },
              { value: 'dark', label: '深色', icon: '🌙' },
            ] as const).map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => updateSettings({ theme: value })}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition ${
                  settings.theme === value
                    ? 'border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 字体大小 */}
        <div className="mb-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">字体大小</p>
          <div className="flex gap-3">
            {([
              { value: 'small', label: '小' },
              { value: 'medium', label: '中' },
              { value: 'large', label: '大' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateSettings({ fontSize: value })}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  settings.fontSize === value
                    ? 'border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 主题色 */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">主题色</p>
          <div className="flex gap-3">
            {ACCENT_COLORS.map(({ name, value }) => (
              <button
                key={value}
                title={name}
                onClick={() => updateSettings({ accentColor: value })}
                className={`h-8 w-8 rounded-full transition ring-offset-2 ${
                  settings.accentColor === value ? 'ring-2 ring-gray-400 dark:ring-gray-500' : ''
                }`}
                style={{ backgroundColor: value }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 通知 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">通知</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notification}
            onChange={(e) => updateSettings({ notification: e.target.checked })}
            className="rounded h-4 w-4"
          />
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">打卡提醒</p>
            <p className="text-xs text-gray-400">在打卡时间段开始时发送系统通知</p>
          </div>
        </label>
      </div>

      {/* 数据管理 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">数据管理</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <HiDownload size={16} /> 导出数据
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <HiUpload size={16} /> 导入数据
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">数据以 JSON 文件格式保存在本地，可随时备份或恢复。</p>
      </div>

      {/* 关于 */}
      <div className="border-t border-gray-100 pt-6 dark:border-gray-700">
        <p className="text-xs text-gray-400">Everyday v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">所有数据存储在本地，不会上传到任何服务器。</p>
      </div>
    </div>
  );
}
