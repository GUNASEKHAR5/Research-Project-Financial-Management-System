import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Card from "../components/Card";
import { Spinner, ErrorMsg } from "../components/PageState";
import {
  getProjectSummary,
  getMonthlyExpenseReport,
  getBudgetUtilization,
  getAgencyFundingReport,
} from "../services/reportService";
import { formatCurrency } from "../utils/helpers";
import api from "../services/api";

/* ── Export helper ───────────────────────────────────────────── */
const exportCSV = (rows, filename) => {
  if (!rows?.length) return;
  const keys = Object.keys(rows[0]);
  const csv  = [keys.join(","), ...rows.map((r) => keys.map((k) => `"${r[k] ?? ""}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

/* ── Report tile ─────────────────────────────────────────────── */
const ReportTile = ({ title, desc, icon, onClick }) => (
  <Card className="p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors cursor-pointer group"
    onClick={onClick}>
    <div className="text-3xl">{icon}</div>
    <div className="flex-1">
      <div className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">{title}</div>
      <div className="text-zinc-500 text-xs mt-0.5">{desc}</div>
    </div>
    <div className="text-zinc-500 group-hover:text-indigo-400 transition-colors text-lg">↓</div>
  </Card>
);

/* ── Main ────────────────────────────────────────────────────── */
const ReportsPage = () => {
  const [projectData,  setProjectData]  = useState([]);
  const [monthlyData,  setMonthlyData]  = useState([]);
  const [utilizationData, setUtil]      = useState([]);
  const [agencyData,   setAgencyData]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [proj, monthly, util, agency] = await Promise.all([
        getProjectSummary(),
        getMonthlyExpenseReport(6),
        getBudgetUtilization(),
        getAgencyFundingReport(),
      ]);
      setProjectData(proj);
      setMonthlyData(monthly);
      setUtil(util);
      setAgencyData(agency);
    } catch { setError("Failed to load report data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Aggregate project bar chart data
  const barData = projectData.map((p) => ({
    name:    p.title?.split(" ").slice(0, 2).join(" "),
    Budget:  +(parseFloat(p.total_budget)  / 100000).toFixed(1),
    Spent:   +(parseFloat(p.total_spent)   / 100000).toFixed(1),
  }));

  // Monthly bar chart – group by month
  const monthMap = {};
  monthlyData.forEach((row) => {
    if (!monthMap[row.month]) monthMap[row.month] = { month: row.month, amount: 0 };
    monthMap[row.month].amount += parseFloat(row.total_amount || 0);
  });
  const monthlyBar = Object.values(monthMap);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-zinc-500 text-sm mt-1">Financial summaries & exports</p>
        </div>
        <button onClick={() => exportCSV(projectData, "project_summary.csv")}
          className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 px-4 py-2 rounded-lg transition-colors">
          ↓ Export CSV
        </button>
      </div>

      {/* Budget vs Spent bar */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Budget vs Spending per Project (₹ Lakhs)
        </h3>
        {barData.length === 0 ? (
          <p className="text-zinc-500 text-sm py-8 text-center">No project data.</p>
        ) : (
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
        )}
      </Card>

      {/* Monthly spending bar */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Monthly Expenditure (₹)
        </h3>
        {monthlyBar.length === 0 ? (
          <p className="text-zinc-500 text-sm py-8 text-center">No monthly data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v) => [formatCurrency(v), "Spent"]}
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
              />
              <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Budget utilization table */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Budget Utilization by Category
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Project", "Category", "Allocated", "Spent", "Remaining", "Utilization"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {utilizationData.slice(0, 15).map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-white text-xs">{row.project_title}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs capitalize">{row.category}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{formatCurrency(row.allocated_amount)}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{formatCurrency(row.spent_amount)}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{formatCurrency(row.remaining)}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`font-semibold ${parseFloat(row.utilization_pct) >= 90 ? "text-rose-400" : parseFloat(row.utilization_pct) >= 70 ? "text-amber-400" : "text-emerald-400"}`}>
                      {row.utilization_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Downloadable report tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportTile title="Project Financial Summary"  desc="Full income & expense breakdown"   icon="📑" onClick={() => exportCSV(projectData,    "project_summary.csv")} />
        <ReportTile title="Monthly Expense Report"     desc="Month-wise expenditure totals"     icon="📅" onClick={() => exportCSV(monthlyData,    "monthly_expense.csv")} />
        <ReportTile title="Budget Utilization Report"  desc="Category-wise usage analysis"      icon="📊" onClick={() => exportCSV(utilizationData, "budget_utilization.csv")} />
        <ReportTile title="Funding Agency Report"      desc="Agency-wise project performance"   icon="🏛️" onClick={() => exportCSV(agencyData,     "agency_funding.csv")} />
      </div>
    </div>
  );
};

export default ReportsPage;