import type { ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';
import { HiOutlineCheckCircle, HiOutlineCollection, HiOutlineCalendar, HiOutlineChartBar, HiOutlineClock, HiOutlineCog, HiOutlineOfficeBuilding } from 'react-icons/hi';
import type { PageKey } from '../types';

const NAV_ITEMS: { key: PageKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'today', label: '今日打卡', icon: HiOutlineCheckCircle },
  { key: 'habits', label: '习惯管理', icon: HiOutlineCollection },
  { key: 'calendar', label: '打卡日历', icon: HiOutlineCalendar },
  { key: 'stats', label: '成就统计', icon: HiOutlineChartBar },
  { key: 'overtime', label: '加班统计', icon: HiOutlineOfficeBuilding },
  { key: 'pomodoro', label: '番茄钟', icon: HiOutlineClock },
  { key: 'settings', label: '设置', icon: HiOutlineCog },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { currentPage, setPage } = useAppStore();

  return (
    <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* 左侧导航栏 */}
      <aside className="flex w-52 flex-col border-r border-gray-200 bg-white px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white text-lg font-bold">
            E
          </div>
          <span className="text-xl font-semibold text-gray-800 dark:text-white">Everyday</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-size-base transition-colors ${
                currentPage === key
                  ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <p className="text-xs text-gray-400 px-2">数据已本地存储 🔒</p>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
