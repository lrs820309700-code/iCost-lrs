# iCost — 极简个人记账 PWA 实施计划

## 技术选型

| 领域 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 路由 | react-router-dom v6 |
| 图标 | lucide-react |
| 日期 | date-fns |
| 图表 | 纯 SVG 手写（无重量级图表库） |
| PWA | vite-plugin-pwa |
| 数据 | 第一阶段 localStorage → 第二阶段 Supabase |
| 部署 | Vercel |

## 项目结构

```
icost/
├── public/icons/          # PWA 图标（SVG 生成多尺寸 PNG）
├── src/
│   ├── components/
│   │   ├── layout/        # AppLayout, BottomNav, AddButton
│   │   ├── transaction/   # TransactionForm (底部弹窗), TransactionItem
│   │   ├── stats/         # PieChart, BarChart (纯 SVG)
│   │   └── common/        # Card, Modal, EmptyState, SummaryCard
│   ├── pages/             # HomePage, TransactionsPage, StatsPage, SettingsPage
│   ├── lib/
│   │   ├── db.ts          # 数据抽象层（现在用 localStorage）
│   │   └── supabase.ts    # Supabase 客户端初始化（预置，暂不使用）
│   ├── store/             # Zustand 全局状态
│   ├── hooks/             # useTransactions, useCategories, useTheme
│   ├── types/             # Transaction, Category 等类型定义
│   └── utils/             # format, exportCSV, date helpers
```

## 路由设计

| 路径 | 页面 | 底部导航 |
|------|------|----------|
| `/` | 首页（本月概览+近10条） | ✅ |
| `/transactions` | 全部记录（筛选/编辑/删除） | ✅ |
| `/stats` | 统计图表 | ✅ |
| `/settings` | 设置/分类管理/导出 | ✅ |

## 数据模型

```typescript
interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  note: string;
  transactionDate: string; // YYYY-MM-DD
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  sortOrder: number;
}
```

## 实施步骤

1. **项目脚手架** — Vite 初始化 + 安装所有依赖
2. **基础配置** — Tailwind, tsconfig, vite.config (含 PWA)
3. **类型 + 数据层** — types + localStorage 数据抽象
4. **布局组件** — AppLayout + BottomNav + 浮动记一笔按钮
5. **首页** — 本月统计卡片 + 最近 10 条记录
6. **记账弹窗** — 底部弹出表单（金额/类型/分类/日期/备注）
7. **记录页** — 按日期分组列表 + 月份/分类筛选 + 编辑/删除
8. **统计页** — 分类饼图 + 每日趋势 + 收支对比（纯SVG）
9. **设置页** — 分类管理 + CSV导出 + 深色模式 + PWA说明
10. **PWA 完善** — manifest + 图标 + 离线缓存策略
11. **部署配置** — vercel.json + 构建验证

## 第一阶段策略

**纯本地模式**，数据存 localStorage，不依赖任何后端。
- `src/lib/db.ts` 提供 `getTransactions()` `addTransaction()` 等方法
- 代码中所有数据访问都通过 `db.ts` 抽象层
- 接入 Supabase 时只需替换 `db.ts` 实现，页面代码不动

## 设计细节

- 暖白色背景 (`#faf9f7`) + 卡片圆角 `12px` + 阴影
- 底部导航 4 个 tab，带图标和文字
- "记一笔" 按钮固定在底部导航中间上方，圆形蓝底
- 记账弹窗从底部滑入（半屏弹窗）
- 深色模式使用 Tailwind `dark:` 类 + CSS 变量
