import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { PROJECTS } from "../data/mockData";
import { formatCurrency, getCategoryBreakdown, calcPercent } from "../utils/helpers";

/* ── Category Row ────────────────────────────────────────────── */
const CategoryRow = ({ name, allocated, spent }) => {
  const pct = calcPercent(spent, allocated);
  const barColor = pct >= 90 ? "#f43f5e" : pct >= 70 ? "#f59e0b" : "#6366f1";

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-300 font-medium">{name}</span>
        <span className="text-zinc-400">
          {formatCurrency(spent)} / {formatCurrency(allocated)}
          <span className="ml-2 font-semibold" style={{ color: barColor }}>{pct}%</span>
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

/* ── Budget Page ─────────────────────────────────────────────── */
const BudgetPage = () => {
  const activeProjects = PROJECTS.filter((p) => p.status === "Active");

  const totalBudget = PROJECTS.reduce((a, p) => a + p.budget, 0);
  const totalSpent  = PROJECTS.reduce((a, p) => a + p.spent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Budget Management</h2>
        <p className="text-zinc-500 text-sm mt-1">Allocation & utilization per project</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-5 border-indigo-800 bg-indigo-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Allocated</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</div>
        </Card>
        <Card className="p-5 border-cyan-800 bg-cyan-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</div>
        </Card>
        <Card className="p-5 border-emerald-800 bg-emerald-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Remaining</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalBudget - totalSpent)}</div>
        </Card>
      </div>

      {/* Per-Project Breakdown */}
      <div className="space-y-4">
        {activeProjects.map((p) => {
          const categories = getCategoryBreakdown(p.budget, p.spent);

          return (
            <Card key={p.id} className="p-5">
              {/* Project Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-white font-semibold">{p.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {p.agency} · Total Budget: {formatCurrency(p.budget)}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>

              {/* Category Bars */}
              <div className="space-y-3">
                {categories.map((c) => (
                  <CategoryRow key={c.name} {...c} />
                ))}
              </div>

              {/* Footer totals */}
              <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
                <span>Total Spent: <span className="text-white font-semibold">{formatCurrency(p.spent)}</span></span>
                <span>Remaining: <span className="text-indigo-400 font-semibold">{formatCurrency(p.budget - p.spent)}</span></span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetPage;