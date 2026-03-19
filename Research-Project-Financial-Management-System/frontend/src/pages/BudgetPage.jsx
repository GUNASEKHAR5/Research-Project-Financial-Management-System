import { useState, useEffect } from "react";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getProjects } from "../services/projectService";
import { getBudgetsByProject, updateBudgetAllocations } from "../services/budgetService";
import { formatCurrency, calcPercent } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const BAR_COLOR = (pct) => pct >= 90 ? "#f43f5e" : pct >= 70 ? "#f59e0b" : "#6366f1";

/* ── Edit Allocation Modal ───────────────────────────────────── */
const EditBudgetModal = ({ project, budgets, onClose, onSaved }) => {
  const [values,  setValues]  = useState(() =>
    Object.fromEntries(budgets.map((b) => [b.category, b.allocated_amount]))
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const allocations = Object.entries(values).map(([category, allocated_amount]) => ({
        category,
        allocated_amount: parseFloat(allocated_amount) || 0,
      }));
      await updateBudgetAllocations(project.id, allocations);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-white font-semibold mb-4">Edit Budget — {project.title}</h3>
        {error && <div className="mb-3 text-rose-400 text-sm">{error}</div>}
        <div className="space-y-3">
          {budgets.map((b) => (
            <div key={b.category} className="flex items-center gap-3">
              <label className="text-zinc-400 text-xs capitalize w-28 flex-shrink-0">{b.category}</label>
              <input type="number" value={values[b.category]}
                onChange={(e) => setValues((v) => ({ ...v, [b.category]: e.target.value }))}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={onClose} className="px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Cancel
          </button>
        </div>
      </Card>
    </div>
  );
};

/* ── Project Budget Card ─────────────────────────────────────── */
const ProjectBudgetCard = ({ project }) => {
  const { user } = useAuth();
  const [budgets,   setBudgets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showEdit,  setShowEdit]  = useState(false);

  const load = async () => {
    try { setBudgets(await getBudgetsByProject(project.id)); }
    catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [project.id]);

  return (
    <>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">{project.title}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{project.agency_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} />
            {user.role === "admin" && (
              <button onClick={() => setShowEdit(true)}
                className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                Edit
              </button>
            )}
          </div>
        </div>
        {loading ? <div className="h-20 flex items-center justify-center"><div className="w-5 h-5 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" /></div> : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const pct = calcPercent(parseFloat(b.spent_amount), parseFloat(b.allocated_amount));
              return (
                <div key={b.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300 font-medium capitalize">{b.category}</span>
                    <span className="text-zinc-400">
                      {formatCurrency(b.spent_amount)} / {formatCurrency(b.allocated_amount)}
                      <span className="ml-2 font-semibold" style={{ color: BAR_COLOR(pct) }}>{pct}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: BAR_COLOR(pct) }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && budgets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
            <span>Total Allocated: <span className="text-white font-semibold">
              {formatCurrency(budgets.reduce((a, b) => a + parseFloat(b.allocated_amount), 0))}
            </span></span>
            <span>Total Spent: <span className="text-indigo-400 font-semibold">
              {formatCurrency(budgets.reduce((a, b) => a + parseFloat(b.spent_amount), 0))}
            </span></span>
          </div>
        )}
      </Card>
      {showEdit && (
        <EditBudgetModal project={project} budgets={budgets}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); load(); }} />
      )}
    </>
  );
};

/* ── Main ────────────────────────────────────────────────────── */
const BudgetPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setProjects(await getProjects()); }
    catch { setError("Failed to load projects."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Budget Management</h2>
        <p className="text-zinc-500 text-sm mt-1">Allocation & utilization per project</p>
      </div>
      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> : (
        <div className="space-y-4">
          {projects.map((p) => <ProjectBudgetCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
};

export default BudgetPage;