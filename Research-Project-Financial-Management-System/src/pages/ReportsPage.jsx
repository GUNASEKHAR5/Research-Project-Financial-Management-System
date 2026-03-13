import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Card from "../components/Card";
import { PROJECTS, MONTHLY_SPEND } from "../data/mockData";
import { formatCurrency, shortTitle } from "../utils/helpers";

const REPORT_TYPES = [
  { title: "Project Financial Summary",  desc: "Full income & expense breakdown per project", icon: "📑" },
  { title: "Monthly Expense Report",     desc: "Month-wise expenditure trends",                icon: "📅" },
  { title: "Budget Utilization Report",  desc: "Category-wise budget usage analysis",          icon: "📊" },
  { title: "Funding Agency Report",      desc: "Agency-wise project & fund performance",       icon: "🏛️" },
];

const ReportsPage = () => {
  const barData = PROJECTS.map((p) => ({
    name:    shortTitle(p.title, 2),
    Budget:  +(p.budget / 100000).toFixed(1),
    Spent:   +(p.spent  / 100000).toFixed(1),
  }));

  const monthlyBarData = MONTHLY_SPEND.map((m) => ({
    month:  m.month,
    Amount: +(m.amount / 1000).toFixed(0),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-zinc-500 text-sm mt-1">Financial summaries & exports</p>
        </div>
        <div className="flex gap-2">
          {["PDF", "Excel", "CSV"].map((fmt) => (
            <button
              key={fmt}
              className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 px-3 py-2 rounded-lg transition-colors"
            >
              ↓ {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Budget vs Spent Bar */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Budget vs Spending per Project (₹ Lakhs)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#52525b" tick={{ fontSize: 10, fill: "#71717a" }} />
            <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={(v) => `₹${v}L`} />
            <Tooltip
              formatter={(v) => `₹${v}L`}
              contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
            />
            <Legend formatter={(v) => <span style={{ color: "#a1a1aa", fontSize: 12 }}>{v}</span>} />
            <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Spent"  fill="#22d3ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Spend Bar */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Monthly Expenditure (₹ Thousands)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
            <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={(v) => `₹${v}K`} />
            <Tooltip
              formatter={(v) => [`₹${v}K`, "Spent"]}
              contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
            />
            <Bar dataKey="Amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Report Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((r) => (
          <Card
            key={r.title}
            className="p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors cursor-pointer group"
          >
            <div className="text-3xl">{r.icon}</div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">
                {r.title}
              </div>
              <div className="text-zinc-500 text-xs mt-0.5">{r.desc}</div>
            </div>
            <div className="text-zinc-500 group-hover:text-indigo-400 transition-colors text-lg">→</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;