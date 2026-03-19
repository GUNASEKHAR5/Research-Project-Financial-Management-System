import { useState, useEffect } from "react";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getPayments, getPaymentSummary, createPayment } from "../services/paymentService";
import { getProjects } from "../services/projectService";
import { getAgencies } from "../services/agencyService";
import { formatCurrency } from "../utils/helpers";

const PAYMENT_TYPES = ["research_grant", "installment", "consultancy", "final_settlement"];

/* ── Record Payment Form ─────────────────────────────────────── */
const RecordPaymentForm = ({ onBack, onCreated }) => {
  const [form,     setForm]     = useState({ project_id: "", agency_id: "", amount: "", payment_type: "", payment_date: "", status: "received", remarks: "" });
  const [projects, setProjects] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    Promise.all([getProjects(), getAgencies()])
      .then(([p, a]) => { setProjects(p); setAgencies(a); })
      .catch(() => {});
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.project_id || !form.agency_id || !form.amount || !form.payment_type || !form.payment_date) {
      setError("All required fields must be filled.");
      return;
    }
    setLoading(true); setError("");
    try {
      await createPayment({ ...form, amount: parseFloat(form.amount) });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Record Payment</h2>
      </div>
      <Card className="p-6 max-w-xl">
        {error && (
          <div className="mb-4 text-rose-400 text-sm bg-rose-900/30 border border-rose-800 rounded-xl px-4 py-3">{error}</div>
        )}
        <div className="space-y-4">
          {/* Project */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Project</label>
            <select value={form.project_id} onChange={(e) => update("project_id", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {/* Agency */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Funding Agency</label>
            <select value={form.agency_id} onChange={(e) => update("agency_id", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select agency…</option>
              {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Amount (₹)</label>
            <input type="number" placeholder="0" value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
          </div>
          {/* Payment Type */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Payment Type</label>
            <select value={form.payment_type} onChange={(e) => update("payment_type", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select type…</option>
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Payment Date</label>
            <input type="date" value={form.payment_date} onChange={(e) => update("payment_date", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="received">Received</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {/* Remarks */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Remarks</label>
            <textarea rows={2} placeholder="Optional notes…" value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              {loading ? "Recording…" : "Record Payment"}
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

/* ── Main ────────────────────────────────────────────────────── */
const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [p, s] = await Promise.all([getPayments(), getPaymentSummary()]);
      setPayments(p);
      setSummary(s);
    } catch { setError("Failed to load payments."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (showForm) {
    return <RecordPaymentForm onBack={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payments</h2>
          <p className="text-zinc-500 text-sm mt-1">Grants & installments tracker</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + Record Payment
        </button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> : (
        <>
          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-emerald-800 bg-emerald-950/30">
                <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Received</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(summary.total_received || 0)}</div>
                <div className="text-xs text-zinc-500 mt-1">{summary.received_count} transactions</div>
              </Card>
              <Card className="p-5 border-amber-800 bg-amber-950/30">
                <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Pending</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(summary.total_pending || 0)}</div>
                <div className="text-xs text-zinc-500 mt-1">{summary.pending_count} transactions</div>
              </Card>
              <Card className="p-5 border-indigo-800 bg-indigo-950/30">
                <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Transactions</div>
                <div className="text-2xl font-bold text-white">{payments.length}</div>
                <div className="text-xs text-zinc-500 mt-1">Across all projects</div>
              </Card>
            </div>
          )}

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["Project", "Agency", "Type", "Amount", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-500 text-sm">No payments found.</td></tr>
                  ) : payments.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{p.project_title}</td>
                      <td className="px-5 py-3.5 text-zinc-300">{p.agency_name}</td>
                      <td className="px-5 py-3.5 text-zinc-400 capitalize">{p.payment_type?.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3.5 text-white font-semibold">{formatCurrency(p.amount)}</td>
                      <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">{p.payment_date?.slice(0, 10)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default PaymentsPage;