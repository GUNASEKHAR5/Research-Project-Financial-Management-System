import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Card from "../components/Card";
import BudgetBar from "../components/BudgetBar";
import { PROJECTS, EXPENSES, MONTHLY_SPEND, CATEGORY_DATA } from "../data/mockData";
import { formatCurrency, calcPercent } from "../utils/helpers";

const StatCard = ({ label, value, sub, icon, borderColor, bgColor }) => (
  <Card className={`p-5 border ${borderColor} ${bgColor}`}>
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs font-semibold text-zinc-300 mt-1">{label}</div>
    <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>
  </Card>
);

const Dashboard = () => {
  const totalBudget = PROJECTS.reduce((a, p) => a + p.budget, 0);
  const totalSpent  = PROJECTS.reduce((a, p) => a + p.spent, 0);
  const pendingCount = EXPENSES.filter((e) => e.status === "Pending").length;
  const activeCount  = PROJECTS.filter((p) => p.status === "Active").length;

  const stats = [
    {
      label: "Total Projects",
      value: PROJECTS.length,
      sub: `${activeCount} active`,
      icon: "🔬",
      borderColor: "border-indigo-800",
      bgColor: "bg-indigo-950/40",
    },
    {
      label: "Total Budget",
      value: formatCurrency(totalBudget),
      sub: "Across all projects",
      icon: "💰",
      borderColor: "border-cyan-800",
      bgColor: "bg-cyan-950/40",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      sub: `${calcPercent(totalSpent, totalBudget)}% utilized`,
      icon: "📊",
      borderColor: "border-amber-800",
      bgColor: "bg-amber-950/40",
    },
    {
      label: "Pending Approvals",
      value: pendingCount,
      sub: "Require review",
      icon: "⏳",
      borderColor: "border-rose-800",
      bgColor: "bg-rose-950/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Financial Overview</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Research Finance Dashboard · March 2026
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Monthly Spending
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_SPEND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis
                stroke="#52525b"
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickFormatter={(v) => `₹${v / 1000}K`}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(v), "Spent"]}
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Expense by Category
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={0}
                >
                  {CATEGORY_DATA.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 flex-1">
              {CATEGORY_DATA.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: c.color }}
                  />
                  <span className="text-xs text-zinc-400 flex-1">{c.name}</span>
                  <span className="text-xs font-semibold text-zinc-300">
                    {formatCurrency(c.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Utilization */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Project Budget Utilization
        </h3>
        <div className="space-y-4">
          {PROJECTS.filter((p) => p.status === "Active").map((p) => (
            <div key={p.id}>
              <div className="flex justify-between items-center mb-1.5">
                <div>
                  <span className="text-sm font-medium text-white">{p.title}</span>
                  <span className="ml-2 text-xs text-zinc-500">{p.agency}</span>
                </div>
                <span className="text-xs text-zinc-400">{formatCurrency(p.budget)}</span>
              </div>
              <BudgetBar spent={p.spent} budget={p.budget} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;