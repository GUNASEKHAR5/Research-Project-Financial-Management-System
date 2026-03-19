import { useState, useEffect } from "react";
import Card from "../components/Card";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getAgencies, createAgency } from "../services/agencyService";
import { formatCurrency } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

/* ── Add Agency Form ─────────────────────────────────────────── */
const AddAgencyForm = ({ onBack, onCreated }) => {
  const [form,    setForm]    = useState({ name: "", full_name: "", contact_email: "", contact_phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.full_name) {
      setError("Short name and full name are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      await createAgency(form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add agency.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Add Funding Agency</h2>
      </div>
      <Card className="p-6 max-w-xl">
        {error && (
          <div className="mb-4 text-rose-400 text-sm bg-rose-900/30 border border-rose-800 rounded-xl px-4 py-3">{error}</div>
        )}
        <div className="space-y-4">
          {[
            { label: "Short Name (e.g. DST)",   key: "name",          placeholder: "DST" },
            { label: "Full Name",                key: "full_name",     placeholder: "Dept. of Science & Technology" },
            { label: "Contact Email",            key: "contact_email", placeholder: "contact@agency.gov.in" },
            { label: "Contact Phone",            key: "contact_phone", placeholder: "+91-11-00000000" },
            { label: "Address",                  key: "address",       placeholder: "New Delhi, India" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
              <input value={form[f.key]} onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              {loading ? "Adding…" : "Add Agency"}
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
const AgenciesPage = () => {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try { setAgencies(await getAgencies()); }
    catch { setError("Failed to load agencies."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (showForm) {
    return <AddAgencyForm onBack={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Funding Agencies</h2>
          <p className="text-zinc-500 text-sm mt-1">{agencies.length} funding organizations</p>
        </div>
        {user.role === "admin" && (
          <button onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            + Add Agency
          </button>
        )}
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agencies.map((a) => (
              <Card key={a.id} className="p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">
                    {a.name}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{a.name}</div>
                    <div className="text-zinc-500 text-xs">{a.full_name}</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-t border-zinc-800">
                    <span className="text-zinc-500">Projects Funded</span>
                    <span className="text-white font-semibold">{a.project_count}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-t border-zinc-800">
                    <span className="text-zinc-500">Total Received</span>
                    <span className="text-white font-semibold">{formatCurrency(a.total_received || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-t border-zinc-800">
                    <span className="text-zinc-500">Contact</span>
                    <span className="text-indigo-400">{a.contact_email || "—"}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["Agency", "Full Name", "Projects", "Total Received", "Contact"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-white font-semibold">{a.name}</td>
                      <td className="px-5 py-3.5 text-zinc-400">{a.full_name}</td>
                      <td className="px-5 py-3.5 text-zinc-300">{a.project_count}</td>
                      <td className="px-5 py-3.5 text-white font-semibold">{formatCurrency(a.total_received || 0)}</td>
                      <td className="px-5 py-3.5 text-indigo-400">{a.contact_email || "—"}</td>
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

export default AgenciesPage;