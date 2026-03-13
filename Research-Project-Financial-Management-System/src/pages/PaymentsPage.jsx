import { useState } from "react";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { PAYMENTS, PROJECTS, AGENCIES } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

/* ── Record Payment Form ─────────────────────────────────────── */
const RecordPaymentForm = ({ onBack }) => {
  const [form, setForm] = useState({ project: "", agency: "", amount: "", type: "", date: "" });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Record Payment</h2>
      </div>

      <Card className="p-6 max-w-xl">
        <div className="space-y-4">
          {/* Project */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Project</label>
            <select value={form.project} onChange={(e) => update("project", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select project…</option>
              {PROJECTS.filter((p) => p.status === "Active").map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Agency */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Funding Agency</label>
            <select value={form.agency} onChange={(e) => update("agency", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select agency…</option>
              {AGENCIES.map((a) => (<option key={a.id} value={a.name}>{a.name}</option>))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Amount (₹)</label>
            <input type="number" placeholder="0" value={form.amount} onChange={(e) => update("amount", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Payment Type</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select type…</option>
              {["Research Grant", "Installment 1", "Installment 2", "Consultancy", "Final Settlement"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Date Received</label>
            <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onBack}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Record Payment
            </button>
            <button onClick={onBack}
              className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ── Main Payments Page ──────────────────────────────────────── */
const PaymentsPage = () => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) return <RecordPaymentForm onBack={() => setShowForm(false)} />;

  const received = PAYMENTS.filter((p) => p.status === "Received").reduce((a, p) => a + p.amount, 0);
  const pending  = PAYMENTS.filter((p) => p.status === "Pending").reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payments</h2>
          <p className="text-zinc-500 text-sm mt-1">Grants & installments tracker</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Record Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-emerald-800 bg-emerald-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Received</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(received)}</div>
          <div className="text-xs text-zinc-500 mt-1">{PAYMENTS.filter((p) => p.status === "Received").length} transactions</div>
        </Card>
        <Card className="p-5 border-amber-800 bg-amber-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(pending)}</div>
          <div className="text-xs text-zinc-500 mt-1">{PAYMENTS.filter((p) => p.status === "Pending").length} transactions</div>
        </Card>
        <Card className="p-5 border-indigo-800 bg-indigo-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-white">{PAYMENTS.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Across all projects</div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["#", "Project", "Agency", "Type", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5 text-zinc-500">{p.id}</td>
                  <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{p.project}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{p.agency}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{p.type}</td>
                  <td className="px-5 py-3.5 text-white font-semibold">{formatCurrency(p.amount)}</td>
                  <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">{p.date}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PaymentsPage;