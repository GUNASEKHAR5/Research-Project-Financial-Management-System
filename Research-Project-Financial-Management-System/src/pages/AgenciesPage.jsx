import { useState } from "react";
import Card from "../components/Card";
import { AGENCIES } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

/* ── Add Agency Form ─────────────────────────────────────────── */
const AddAgencyForm = ({ onBack }) => {
  const [form, setForm] = useState({ name: "", fullName: "", contact: "" });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Add Funding Agency</h2>
      </div>

      <Card className="p-6 max-w-xl">
        <div className="space-y-4">
          {[
            { label: "Short Name (e.g. DST)",   key: "name",     placeholder: "DST" },
            { label: "Full Name",                key: "fullName", placeholder: "Dept. of Science & Technology" },
            { label: "Contact Email",            key: "contact",  placeholder: "contact@agency.gov.in" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={onBack}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Add Agency
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

/* ── Agencies Page ───────────────────────────────────────────── */
const AgenciesPage = () => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) return <AddAgencyForm onBack={() => setShowForm(false)} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Funding Agencies</h2>
          <p className="text-zinc-500 text-sm mt-1">{AGENCIES.length} active funding organizations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Add Agency
        </button>
      </div>

      {/* Agency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENCIES.map((a) => (
          <Card key={a.id} className="p-5 hover:border-zinc-700 transition-colors">
            {/* Badge + Name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">
                {a.name}
              </div>
              <div>
                <div className="text-white font-semibold">{a.name}</div>
                <div className="text-zinc-500 text-xs">{a.fullName}</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-t border-zinc-800">
                <span className="text-zinc-500">Projects Funded</span>
                <span className="text-white font-semibold">{a.projects}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-zinc-800">
                <span className="text-zinc-500">Total Funded</span>
                <span className="text-white font-semibold">{formatCurrency(a.totalFunded)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-zinc-800">
                <span className="text-zinc-500">Contact</span>
                <span className="text-indigo-400">{a.contact}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table view */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Agency", "Full Name", "Projects", "Total Funded", "Contact"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENCIES.map((a) => (
                <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-white font-semibold">{a.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">{a.fullName}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{a.projects}</td>
                  <td className="px-5 py-3.5 text-white font-semibold">{formatCurrency(a.totalFunded)}</td>
                  <td className="px-5 py-3.5 text-indigo-400">{a.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AgenciesPage;