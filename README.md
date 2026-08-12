# Everyday - 习惯养成 & 效率工具

一款 Windows 桌面端习惯养成应用，帮助你建立好习惯、追踪加班时长、提升专注力。所有数据本地存储，隐私无忧。

## 功能特性

### 今日打卡
- 自定义打卡项目（名称、图标、颜色、描述）
- 设置每日打卡时间段，仅在限定时间内可打卡
- 实时显示打卡进度和连续打卡天数 🔥
- 支持添加打卡备注

### 习惯管理
- 添加、编辑、删除打卡习惯
- 启用/禁用习惯，灵活管理
- 支持习惯分类
- 可设置补卡天数

### 打卡日历
- 可视化日历查看打卡历史
- 绿色 = 全部完成 / 黄色 = 部分完成 / 灰色 = 未完成
- 点击日期查看当日详细打卡记录

### 成就统计
- 连续打卡天数成就（3天、7天、14天、30天、100天）
- 累计打卡天数成就（10天、50天、100天）
- 最近 30 天打卡趋势图表

### 加班统计
- 记录每日下班打卡时间（默认记录前一天）
- 加班从 **17:30** 开始自动计算时长
- 按月统计：总时长、加班天数、日均加班、单日最长
- 支持月份切换查看历史数据

### 番茄钟
- 默认专注 35 分钟、休息 10 分钟
- 自定义专注时间（1-120 分钟）和休息时间（1-60 分钟）
- 自动阶段切换（专注 → 休息 → 专注）
- 完成计数（每完成一次专注计 1 个 🍅）
- 阶段结束桌面通知提醒

### 个性化设置
- 浅色/深色主题切换
- 字体大小调节（小/中/大）
- 自定义强调色
- 数据导入/导出备份

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron |
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式方案 | Tailwind CSS 3 |
| 状态管理 | Zustand |
| 图表库 | ECharts |
| 数据存储 | JSON 文件本地存储 |

## 开发

### 环境要求

- Node.js >= 18
- Windows 10+

### 安装与运行

```bash
# 进入项目目录
cd everyday-app

# 安装依赖
npm install

# 启动开发模式（前端热更新 + Electron）
npm run electron:dev

# 仅启动前端开发服务器（浏览器预览）
npm run dev
```

### 构建打包

```bash
# Windows 环境打包（需配置国内镜像加速）
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

# 执行打包
npm run electron:build
```

打包产物位于 `release/` 目录，生成 `Everyday Setup 1.0.0.exe` 安装包。

## 数据存储

用户数据保存在本地目录：

```
C:\Users\<用户名>\AppData\Roaming\everyday\everyday-data\data.json
```

数据结构：

```json
{
  "habits": [],
  "records": [],
  "achievements": [],
  "overtimeRecords": [],
  "settings": {
    "theme": "light",
    "fontSize": "medium",
    "accentColor": "#3B82F6",
    "autoStart": false,
    "notification": true
  }
}
```

支持通过设置页面导出/导入 JSON 备份文件。

## 项目结构

```
everyday-app/
├── electron/           # Electron 主进程
│   ├── main.cjs        # 主进程入口
│   └── preload.cjs     # 预加载脚本
├── src/
│   ├── components/     # 公共组件
│   ├── pages/          # 页面组件
│   │   ├── TodayPage.tsx       # 今日打卡
│   │   ├── HabitsPage.tsx      # 习惯管理
│   │   ├── CalendarPage.tsx    # 打卡日历
│   │   ├── StatsPage.tsx       # 成就统计
│   │   ├── OvertimePage.tsx    # 加班统计
│   │   ├── PomodoroPage.tsx    # 番茄钟
│   │   └── SettingsPage.tsx    # 设置
│   ├── store/          # Zustand 状态管理
│   ├── utils/          # 工具函数
│   ├── types.ts        # TypeScript 类型定义
│   ├── App.tsx         # 应用入口
│   └── main.tsx        # 渲染进程入口
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## License

MIT
