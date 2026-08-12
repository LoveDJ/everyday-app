import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import HabitsPage from './pages/HabitsPage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import OvertimePage from './pages/OvertimePage';
import PomodoroPage from './pages/PomodoroPage';
import SettingsPage from './pages/SettingsPage';

const PAGES: Record<string, React.ComponentType> = {
  today: TodayPage,
  habits: HabitsPage,
  calendar: CalendarPage,
  stats: StatsPage,
  overtime: OvertimePage,
  pomodoro: PomodoroPage,
  settings: SettingsPage,
};

export default function App() {
  const { loaded, currentPage, loadData, settings } = useAppStore();

  useEffect(() => {
    loadData();
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-size-base text-gray-400">加载中...</div>
      </div>
    );
  }

  const Page = PAGES[currentPage] || TodayPage;

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        settings.theme === 'dark' ? 'dark' : ''
      }`}
      style={
        {
          '--color-primary-500': settings.accentColor,
        } as React.CSSProperties
      }
    >
      <Layout>
        <Page />
      </Layout>
    </div>
  );
}