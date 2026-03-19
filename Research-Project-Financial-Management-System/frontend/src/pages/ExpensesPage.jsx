import { useState, useEffect } from "react";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getExpenses, createExpense, approveExpense, rejectExpense } from "../services/expenseService";
import { getProjects } from "../services/projectService";
import { formatCurrency } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["equipment", "salary", "travel", "consumables", "miscellaneous"];

/* ── Submit Form ─────────────────────────────────────────────── */
const SubmitExpenseForm = ({ onBack, onSubmitted }) => {
  const [form,     setForm]     = useState({ project_id: "", category: "", amount: "", description: "", expense_date: "" });
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    getProjects("active").then(setProjects).catch(() => {});
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.project_id || !form.category || !form.amount || !form.expense_date) {
      setError("All fields are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      await createExpense({ ...form, amount: parseFloat(form.amount) });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit expense.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Submit Expense</h2>
      </div>
      <Card className="p-6 max-w-xl">
        {error && <div className="mb-4 text-rose-400 text-sm bg-rose-900/30 border border-rose-800 rounded-xl px-4 py-3">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Project</label>
            <select value={form.project_id} onChange={(e) => update("project_id", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Amount (₹)</label>
            <input type="number" placeholder="0" value={form.amount} onChange={(e) => update("amount", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Expense Date</label>
            <input type="date" value={form.expense_date} onChange={(e) => update("expense_date", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Description</label>
            <textarea rows={3} placeholder="Expense details…" value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              {loading ? "Submitting…" : "Submit for Approval"}
            </button>
            <button onClick={onBack} className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ── Main ────────────────────────────────────────────────────── */
const ExpensesPage = ({ role }) => {
  const { user } = useAuth();
  const [expenses, setExpenses]  = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [error,    setError]     = useState("");
  const [showForm, setShowForm]  = useState(false);
  const [filter,   setFilter]    = useState("All");

  const canApprove = user.role === "admin" || user.role === "finance";

  const load = async () => {
    setLoading(true); setError("");
    try {
      const status = filter === "All" ? undefined : filter.toLowerCase();
      setExpenses(await getExpenses(status ? { status } : {}));
    } catch { setError("Failed to load expenses."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id) => {
    try { await approveExpense(id); load(); }
    catch (err) { alert(err.response?.data?.message || "Failed to approve."); }
  };

  const handleReject = async (id) => {
    const remarks = window.prompt("Reason for rejection (optional):");
    if (remarks === null) return;
    try { await rejectExpense(id, remarks); load(); }
    catch (err) { alert(err.response?.data?.message || "Failed to reject."); }
  };

  if (showForm) return <SubmitExpenseForm onBack={() => setShowForm(false)} onSubmitted={() => { setShowForm(false); load(); }} />;

  const pending = expenses.filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses</h2>
          <p className="text-zinc-500 text-sm mt-1">{pending} pending approval</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + Submit Expense
        </button>
      </div>
      <div className="flex gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${filter === s ? "bg-indigo-600 border-indigo-600 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}>
            {s}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Project", "Category", "Amount", "Date", "Submitted By", "Receipt", "Status",
                    ...(canApprove ? ["Actions"] : [])].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-500 text-sm">No expenses found.</td></tr>
                ) : expenses.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{e.project_title}</td>
                    <td className="px-5 py-3.5 text-zinc-300 capitalize">{e.category}</td>
                    <td className="px-5 py-3.5 text-white font-semibold">{formatCurrency(e.amount)}</td>
                    <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">{e.expense_date?.slice(0,10)}</td>
                    <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">{e.submitted_by_name}</td>
                    <td className="px-5 py-3.5 text-center">
                      {e.has_receipt ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400">✗</span>}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                    {canApprove && (
                      <td className="px-5 py-3.5">
                        {e.status === "pending" && (
                          <div className="flex gap-1.5">
                            <button onClick={() => handleApprove(e.id)}
                              className="text-xs bg-emerald-900/60 border border-emerald-700 text-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-800 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => handleReject(e.id)}
                              className="text-xs bg-rose-900/60 border border-rose-700 text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-800 transition-colors">
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExpensesPage;