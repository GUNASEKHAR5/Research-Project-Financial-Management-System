import { useState, useEffect } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Card from "../components/Card";
import BudgetBar from "../components/BudgetBar";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getDashboardStats } from "../services/reportService";
import { formatCurrency, calcPercent } from "../utils/helpers";

const CATEGORY_COLORS = {
  equipment:     "#6366f1",
  salary:        "#22d3ee",
  travel:        "#f59e0b",
  consumables:   "#10b981",
  miscellaneous: "#f43f5e",
};

const StatCard = ({ label, value, sub, icon, borderColor, bgColor }) => (
  <Card className={`p-5 border ${borderColor} ${bgColor}`}>
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs font-semibold text-zinc-300 mt-1">{label}</div>
    <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>
  </Card>
);

const Dashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getDashboardStats();
      setData(result);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg message={error} onRetry={load} />;

  const { stats, monthly, categories, utilization } = data;

  const statCards = [
    {
      label: "Total Projects",
      value: stats.total_projects,
      sub:   `${stats.active_projects} active`,
      icon:  "🔬",
      borderColor: "border-indigo-800",
      bgColor:     "bg-indigo-950/40",
    },
    {
      label: "Total Budget",
      value: formatCurrency(stats.total_budget),
      sub:   "Across all projects",
      icon:  "💰",
      borderColor: "border-cyan-800",
      bgColor:     "bg-cyan-950/40",
    },
    {
      label: "Total Spent",
      value: formatCurrency(stats.total_spent),
      sub:   `${calcPercent(stats.total_spent, stats.total_budget)}% utilized`,
      icon:  "📊",
      borderColor: "border-amber-800",
      bgColor:     "bg-amber-950/40",
    },
    {
      label: "Pending Approvals",
      value: stats.pending_approvals,
      sub:   "Require review",
      icon:  "⏳",
      borderColor: "border-rose-800",
      bgColor:     "bg-rose-950/40",
    },
  ];

  const pieData = categories.map((c) => ({
    name:  c.category,
    value: parseFloat(c.total),
    color: CATEGORY_COLORS[c.category] || "#888",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Financial Overview</h2>
        <p className="text-zinc-500 text-sm mt-1">Research Finance Dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Monthly Spending
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v) => [formatCurrency(v), "Spent"]}
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
              />
              <Line type="monotone" dataKey="total_spent" stroke="#6366f1"
                strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Expense by Category
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80} strokeWidth={0}>
                  {pieData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {pieData.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-zinc-400 flex-1 capitalize">{c.name}</span>
                  <span className="text-xs font-semibold text-zinc-300">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Utilization */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Project Budget Utilization
        </h3>
        {utilization.length === 0 ? (
          <p className="text-zinc-500 text-sm">No active projects.</p>
        ) : (
          <div className="space-y-4">
            {utilization.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-white">{p.title}</span>
                  <span className="text-xs text-zinc-400">{formatCurrency(p.total_budget)}</span>
                </div>
                <BudgetBar spent={parseFloat(p.total_spent)} budget={parseFloat(p.total_budget)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;