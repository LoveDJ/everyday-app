import { useState, useRef, useCallback, useEffect } from 'react';
import { HiPlay, HiPause, HiRefresh, HiChevronRight, HiVolumeUp, HiVolumeOff } from 'react-icons/hi';

type Phase = 'focus' | 'rest';

export default function PomodoroPage() {
  const [focusMinutes, setFocusMinutes] = useState(35);
  const [restMinutes, setRestMinutes] = useState(10);
  const [phase, setPhase] = useState<Phase>('focus');
  const [timeLeft, setTimeLeft] = useState(35 * 60);
  const [running, setRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempFocus, setTempFocus] = useState('35');
  const [tempRest, setTempRest] = useState('10');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 基于时间戳计时：记录计时结束的目标时间点
  const endTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 播放提示音（Web Audio API 生成和弦音效）
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // 播放三个递升音，模拟清脆铃声
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.2);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.2 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.5);
      });
    } catch {
      // 静默失败
    }
  }, [soundEnabled]);

  const totalSeconds = phase === 'focus' ? focusMinutes * 60 : restMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchPhase = useCallback((newPhase: Phase) => {
    clearTimer();
    setPhase(newPhase);
    setTimeLeft(newPhase === 'focus' ? focusMinutes * 60 : restMinutes * 60);
    setRunning(false);
    endTimeRef.current = 0;
  }, [clearTimer, focusMinutes, restMinutes]);

  const handleTimerEnd = useCallback(() => {
    clearTimer();
    setRunning(false);
    endTimeRef.current = 0;
    playNotificationSound();
    if (phase === 'focus') {
      setCompletedPomodoros((c) => c + 1);
      if (Notification.permission === 'granted') {
        new Notification('Everyday 番茄钟', { body: '专注时间结束，休息一下吧！' });
      }
      switchPhase('rest');
    } else {
      if (Notification.permission === 'granted') {
        new Notification('Everyday 番茄钟', { body: '休息结束，开始新的专注！' });
      }
      switchPhase('focus');
    }
  }, [clearTimer, phase, switchPhase, playNotificationSound]);

  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = Math.round((endTimeRef.current - now) / 1000);
    if (remaining <= 0) {
      setTimeLeft(0);
      handleTimerEnd();
    } else {
      setTimeLeft(remaining);
    }
  }, [handleTimerEnd]);

  const handleStart = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // 根据当前剩余时间计算目标结束时间点
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setRunning(true);
    intervalRef.current = setInterval(tick, 250); // 250ms 刷新，保证恢复后快速修正
  };

  const handlePause = () => {
    clearTimer();
    setRunning(false);
    // 重新计算剩余时间，以便恢复时基于正确的时间继续
    const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
    setTimeLeft(Math.max(0, remaining));
    endTimeRef.current = 0;
  };

  const handleReset = () => {
    clearTimer();
    setRunning(false);
    endTimeRef.current = 0;
    setTimeLeft(phase === 'focus' ? focusMinutes * 60 : restMinutes * 60);
  };

  const handleNext = () => {
    if (phase === 'focus') {
      setCompletedPomodoros((c) => c + 1);
      switchPhase('rest');
    } else {
      switchPhase('focus');
    }
  };

  const handleSaveSettings = () => {
    const f = parseInt(tempFocus) || 25;
    const r = parseInt(tempRest) || 5;
    setFocusMinutes(Math.max(1, Math.min(120, f)));
    setRestMinutes(Math.max(1, Math.min(60, r)));
    if (!running) {
      if (phase === 'focus') {
        setTimeLeft(Math.max(1, Math.min(120, f)) * 60);
      } else {
        setTimeLeft(Math.max(1, Math.min(60, r)) * 60);
      }
    }
    setEditingSettings(false);
  };

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const phaseColor = phase === 'focus' ? '#EF4444' : '#10B981';
  const phaseBg = phase === 'focus'
    ? 'bg-red-50 dark:bg-red-900/20'
    : 'bg-green-50 dark:bg-green-900/20';
  const phaseLabel = phase === 'focus' ? '专注中' : '休息中';

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 self-start">番茄钟</h1>

      {/* 阶段标签 */}
      <div className={`rounded-full px-5 py-1.5 mb-6 ${phaseBg}`}>
        <span className="text-sm font-medium" style={{ color: phaseColor }}>
          {phaseLabel}
        </span>
      </div>

      {/* 圆形计时器 */}
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* 背景圆 */}
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="4"
          />
          {/* 进度圆 */}
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={phaseColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        {/* 时间数字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold text-gray-800 dark:text-white tracking-wider">
            {display}
          </span>
          <span className="text-xs text-gray-400 mt-2">
            {phase === 'focus' ? `${focusMinutes} 分钟专注` : `${restMinutes} 分钟休息`}
          </span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleReset}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          title="重置"
        >
          <HiRefresh size={20} />
        </button>

        {running ? (
          <button
            onClick={handlePause}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90"
            style={{ backgroundColor: phaseColor }}
            title="暂停"
          >
            <HiPause size={28} />
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90"
            style={{ backgroundColor: phaseColor }}
            title="开始"
          >
            <HiPlay size={28} />
          </button>
        )}

        <button
          onClick={handleNext}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          title="下一个时间段"
        >
          <HiChevronRight size={20} />
        </button>
      </div>

      {/* 完成计数 */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">今日完成番茄数</span>
        <span className="text-lg font-bold" style={{ color: phaseColor }}>{completedPomodoros}</span>
        <span className="text-sm text-gray-400">🍅</span>
      </div>

      {/* 设置 */}
      <div className="w-full rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">时间设置</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1 text-xs transition"
              title={soundEnabled ? '关闭提示音' : '开启提示音'}
            >
              {soundEnabled
                ? <><HiVolumeUp className="text-blue-500" /> <span className="text-blue-500">提示音开</span></>
                : <><HiVolumeOff className="text-gray-400" /> <span className="text-gray-400">提示音关</span></>
              }
            </button>
            <button
              onClick={() => {
                setEditingSettings(!editingSettings);
                setTempFocus(String(focusMinutes));
                setTempRest(String(restMinutes));
              }}
              className="text-xs text-blue-500 hover:text-blue-600 transition"
            >
              {editingSettings ? '取消' : '修改'}
            </button>
          </div>
        </div>

        {editingSettings ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-20">专注时间</span>
              <input
                type="number" min={1} max={120} value={tempFocus}
                onChange={(e) => setTempFocus(e.target.value)}
                className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-red-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <span className="text-sm text-gray-400">分钟</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-20">休息时间</span>
              <input
                type="number" min={1} max={60} value={tempRest}
                onChange={(e) => setTempRest(e.target.value)}
                className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <span className="text-sm text-gray-400">分钟</span>
            </div>
            <button
              onClick={handleSaveSettings}
              className="self-end rounded-lg bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600 transition"
            >
              保存
            </button>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">专注 {focusMinutes} 分钟</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">休息 {restMinutes} 分钟</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
