import { useState } from "react";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { EXPENSES, PROJECTS, EXPENSE_CATEGORIES } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

/* ── Submit Expense Form ─────────────────────────────────────── */
const SubmitExpenseForm = ({ onBack }) => {
  const [form, setForm] = useState({
    project: "", category: "", amount: "", description: "",
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-white">Submit Expense</h2>
      </div>

      <Card className="p-6 max-w-xl">
        <div className="space-y-4">
          {/* Project */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Project</label>
            <select
              value={form.project}
              onChange={(e) => update("project", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select project…</option>
              {PROJECTS.filter((p) => p.status === "Active").map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select category…</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Amount (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Expense details…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Upload Receipt</label>
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors">
              <div className="text-2xl mb-1">📎</div>
              <div className="text-sm text-zinc-400">Drop file or click to upload</div>
              <div className="text-xs text-zinc-600 mt-1">PDF, JPG, PNG — up to 10 MB</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Submit for Approval
            </button>
            <button
              onClick={onBack}
              className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ── Main Expenses Page ──────────────────────────────────────── */
const ExpensesPage = ({ role }) => {
  const [showForm, setShowForm]   = useState(false);
  const [expenses, setExpenses]   = useState(EXPENSES);
  const [filterStatus, setFilter] = useState("All");

  const approve = (id) =>
    setExpenses((es) => es.map((e) => (e.id === id ? { ...e, status: "Approved" } : e)));
  const reject = (id) =>
    setExpenses((es) => es.map((e) => (e.id === id ? { ...e, status: "Rejected" } : e)));

  if (showForm) return <SubmitExpenseForm onBack={() => setShowForm(false)} />;

  const canApprove = role === "admin" || role === "finance";

  const filtered =
    filterStatus === "All"
      ? expenses
      : expenses.filter((e) => e.status === filterStatus);

  const pendingCount = expenses.filter((e) => e.status === "Pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {pendingCount} pending approval
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Submit Expense
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors border ${
              filterStatus === s
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {[
                  "ID", "Project", "Category", "Amount",
                  "Date", "Submitted By", "Receipt", "Status",
                  ...(canApprove ? ["Actions"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-5 py-3.5 text-zinc-400">#{e.id}</td>
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{e.project}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{e.category}</td>
                  <td className="px-5 py-3.5 text-white font-semibold">{formatCurrency(e.amount)}</td>
                  <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">{e.date}</td>
                  <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">{e.submittedBy}</td>
                  <td className="px-5 py-3.5 text-center">
                    {e.receipt
                      ? <span className="text-emerald-400">✓</span>
                      : <span className="text-rose-400">✗</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={e.status} />
                  </td>
                  {canApprove && (
                    <td className="px-5 py-3.5">
                      {e.status === "Pending" && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => approve(e.id)}
                            className="text-xs bg-emerald-900/60 border border-emerald-700 text-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-800 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reject(e.id)}
                            className="text-xs bg-rose-900/60 border border-rose-700 text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-800 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-zinc-500 text-sm">
                    No expenses found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ExpensesPage;