import { useState } from "react";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import BudgetBar from "../components/BudgetBar";
import { PROJECTS, AGENCIES, BUDGET_CATEGORIES } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

/* ── Create Project Form ─────────────────────────────────────── */
const CreateProjectForm = ({ onBack }) => {
  const [form, setForm] = useState({
    title: "", agency: "", pi: "", budget: "", start: "", end: "",
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const fields = [
    { label: "Project Title",               key: "title",  type: "text",   placeholder: "e.g. AI in Drug Discovery" },
    { label: "Principal Investigator",       key: "pi",     type: "text",   placeholder: "Dr. Full Name" },
    { label: "Total Budget (₹)",             key: "budget", type: "number", placeholder: "e.g. 5000000" },
    { label: "Start Date",                   key: "start",  type: "date",   placeholder: "" },
    { label: "End Date",                     key: "end",    type: "date",   placeholder: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-white">Create New Project</h2>
      </div>

      <Card className="p-6 max-w-2xl">
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
              />
            </div>
          ))}

          {/* Agency select */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
              Funding Agency
            </label>
            <select
              value={form.agency}
              onChange={(e) => update("agency", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select agency…</option>
              {AGENCIES.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} – {a.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Create Project
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

/* ── Project Detail View ─────────────────────────────────────── */
const ProjectDetail = ({ project, onBack }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>
      <h2 className="text-2xl font-bold text-white">{project.title}</h2>
      <StatusBadge status={project.status} />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Budget",    value: formatCurrency(project.budget) },
        { label: "Spent",     value: formatCurrency(project.spent) },
        { label: "Remaining", value: formatCurrency(project.budget - project.spent) },
        { label: "Agency",    value: project.agency },
      ].map((s) => (
        <Card key={s.label} className="p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</div>
          <div className="text-lg font-bold text-white">{s.value}</div>
        </Card>
      ))}
    </div>

    <Card className="p-5">
      <div className="space-y-2 text-sm">
        {[
          { label: "Project ID",               value: `#${project.id}` },
          { label: "Principal Investigator",   value: project.pi },
          { label: "Funding Agency",           value: project.agency },
          { label: "Duration",                 value: `${project.start} → ${project.end}` },
          { label: "Status",                   value: <StatusBadge status={project.status} /> },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
            <span className="text-zinc-500">{row.label}</span>
            <span className="text-white font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-5">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Budget Utilization</h3>
      <BudgetBar spent={project.spent} budget={project.budget} />
    </Card>
  </div>
);

/* ── Main Projects Page ──────────────────────────────────────── */
const ProjectsPage = () => {
  const [view, setView]           = useState("list"); // "list" | "create" | "detail"
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterStatus, setFilterStatus]       = useState("All");

  if (view === "create") return <CreateProjectForm onBack={() => setView("list")} />;
  if (view === "detail" && selectedProject)
    return <ProjectDetail project={selectedProject} onBack={() => setView("list")} />;

  const filtered =
    filterStatus === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {PROJECTS.length} total · {PROJECTS.filter((p) => p.status === "Active").length} active
          </p>
        </div>
        <button
          onClick={() => setView("create")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <span>+</span> New Project
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["All", "Active", "Archived"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
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

      {/* List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="p-5 hover:border-zinc-700 transition-colors"
            onClick={() => { setSelectedProject(p); setView("detail"); }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-semibold truncate">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mb-3">
                  <span>ID: #{p.id}</span>
                  <span>Agency: {p.agency}</span>
                  <span>PI: {p.pi}</span>
                  <span>{p.start} → {p.end}</span>
                </div>
                <BudgetBar spent={p.spent} budget={p.budget} />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white font-bold">{formatCurrency(p.budget)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Total Budget</div>
                <div className="text-indigo-400 font-semibold text-sm mt-2">
                  {formatCurrency(p.budget - p.spent)}
                </div>
                <div className="text-xs text-zinc-500">Remaining</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;