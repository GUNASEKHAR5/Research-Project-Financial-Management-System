import { useState, useEffect } from "react";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import BudgetBar from "../components/BudgetBar";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getProjects, createProject, archiveProject } from "../services/projectService";
import { getAgencies } from "../services/agencyService";
import { getUsers } from "../services/userService";
import { formatCurrency } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

/* ── Create Project Form ─────────────────────────────────────── */
const CreateProjectForm = ({ onBack, onCreated }) => {
  const [form, setForm]       = useState({ title: "", agency_id: "", pi_user_id: "", budget: "", start_date: "", end_date: "" });
  const [agencies, setAgencies] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    Promise.all([getAgencies(), getUsers()])
      .then(([a, u]) => {
        setAgencies(a);
        setUsers(u.filter((u) => u.role === "faculty"));
      })
      .catch(() => {});
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.agency_id || !form.pi_user_id || !form.start_date || !form.end_date) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createProject({
        title:      form.title,
        agency_id:  form.agency_id,
        pi_user_id: form.pi_user_id,
        start_date: form.start_date,
        end_date:   form.end_date,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Create New Project</h2>
      </div>
      <Card className="p-6 max-w-2xl">
        {error && <div className="mb-4 text-rose-400 text-sm bg-rose-900/30 border border-rose-800 rounded-xl px-4 py-3">{error}</div>}
        <div className="space-y-4">
          {[
            { label: "Project Title", key: "title", type: "text", placeholder: "e.g. AI in Drug Discovery" },
            { label: "Start Date",    key: "start_date", type: "date" },
            { label: "End Date",      key: "end_date",   type: "date" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Funding Agency</label>
            <select value={form.agency_id} onChange={(e) => update("agency_id", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select agency…</option>
              {agencies.map((a) => <option key={a.id} value={a.id}>{a.name} – {a.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Principal Investigator</label>
            <select value={form.pi_user_id} onChange={(e) => update("pi_user_id", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Select faculty…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              {loading ? "Creating…" : "Create Project"}
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

/* ── Project Detail ──────────────────────────────────────────── */
const ProjectDetail = ({ project, onBack, onArchive }) => {
  const { user } = useAuth();
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    if (!window.confirm("Archive this project?")) return;
    setArchiving(true);
    try { await onArchive(project.id); onBack(); }
    catch { setArchiving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
          <h2 className="text-2xl font-bold text-white">{project.title}</h2>
          <StatusBadge status={project.status} />
        </div>
        {user.role === "admin" && project.status === "active" && (
          <button onClick={handleArchive} disabled={archiving}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-colors">
            {archiving ? "Archiving…" : "Archive"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Budget",    value: formatCurrency(project.total_budget) },
          { label: "Spent",     value: formatCurrency(project.total_spent) },
          { label: "Remaining", value: formatCurrency(project.total_budget - project.total_spent) },
          { label: "Agency",    value: project.agency_name },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
          </Card>
        ))}
      </div>
      <Card className="p-5 space-y-2 text-sm">
        {[
          { label: "PI",       value: project.pi_name },
          { label: "Agency",   value: `${project.agency_name} — ${project.agency_full_name}` },
          { label: "Duration", value: `${project.start_date?.slice(0,10)} → ${project.end_date?.slice(0,10)}` },
          { label: "Status",   value: <StatusBadge status={project.status} /> },
        ].map((r) => (
          <div key={r.label} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
            <span className="text-zinc-500">{r.label}</span>
            <span className="text-white font-medium">{r.value}</span>
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Budget Utilization</h3>
        <BudgetBar spent={parseFloat(project.total_spent)} budget={parseFloat(project.total_budget)} />
      </Card>
    </div>
  );
};

/* ── Main ────────────────────────────────────────────────────── */
const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [view,      setView]      = useState("list");
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState("All");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const status = filter === "All" ? undefined : filter.toLowerCase();
      setProjects(await getProjects(status));
    } catch { setError("Failed to load projects."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  if (view === "create") return <CreateProjectForm onBack={() => setView("list")} onCreated={() => { setView("list"); load(); }} />;
  if (view === "detail" && selected) return (
    <ProjectDetail project={selected} onBack={() => setView("list")}
      onArchive={async (id) => { await archiveProject(id); load(); }} />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-zinc-500 text-sm mt-1">{projects.length} loaded</p>
        </div>
        {user.role === "admin" && (
          <button onClick={() => setView("create")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            + New Project
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {["All", "Active", "Archived"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${filter === s ? "bg-indigo-600 border-indigo-600 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}>
            {s}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id} className="p-5 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => { setSelected(p); setView("detail"); }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold truncate">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mb-3">
                    <span>Agency: {p.agency_name}</span>
                    <span>PI: {p.pi_name}</span>
                    <span>{p.start_date?.slice(0,10)} → {p.end_date?.slice(0,10)}</span>
                  </div>
                  <BudgetBar spent={parseFloat(p.total_spent)} budget={parseFloat(p.total_budget)} />
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold">{formatCurrency(p.total_budget)}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Total Budget</div>
                  <div className="text-indigo-400 font-semibold text-sm mt-2">
                    {formatCurrency(p.total_budget - p.total_spent)}
                  </div>
                  <div className="text-xs text-zinc-500">Remaining</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;