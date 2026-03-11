import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────

const USERS = [
  { id: 1, name: "Dr. Arjun Mehta", role: "admin", email: "arjun@university.edu" },
  { id: 2, name: "Prof. Priya Nair", role: "faculty", email: "priya@university.edu" },
  { id: 3, name: "Ravi Kumar", role: "finance", email: "ravi@university.edu" },
];

const AGENCIES = [
  { id: 1, name: "DST", fullName: "Dept. of Science & Technology", contact: "dst@gov.in", projects: 3 },
  { id: 2, name: "DRDO", fullName: "Defence R&D Organisation", contact: "drdo@gov.in", projects: 2 },
  { id: 3, name: "ISRO", fullName: "Indian Space Research Org.", contact: "isro@gov.in", projects: 1 },
];

const PROJECTS = [
  { id: 101, title: "AI in Healthcare Diagnostics", agency: "DST", pi: "Dr. Arjun Mehta", budget: 5000000, spent: 3200000, status: "Active", start: "2024-01-01", end: "2026-12-31" },
  { id: 102, title: "Quantum Computing Materials", agency: "DRDO", pi: "Prof. Priya Nair", budget: 8000000, spent: 2100000, status: "Active", start: "2024-06-01", end: "2027-05-31" },
  { id: 103, title: "Satellite Signal Processing", agency: "ISRO", pi: "Dr. Arjun Mehta", budget: 3500000, spent: 3400000, status: "Active", start: "2023-04-01", end: "2025-03-31" },
  { id: 104, title: "Green Hydrogen Research", agency: "DST", pi: "Prof. Priya Nair", budget: 6200000, spent: 800000, status: "Active", start: "2025-01-01", end: "2027-12-31" },
  { id: 105, title: "Nano Drug Delivery Systems", agency: "DRDO", pi: "Dr. Arjun Mehta", budget: 4100000, spent: 4050000, status: "Archived", start: "2022-07-01", end: "2024-06-30" },
];

const EXPENSES = [
  { id: 501, project: "AI in Healthcare", category: "Equipment", amount: 450000, date: "2026-03-01", status: "Approved", submittedBy: "Prof. Priya Nair", receipt: true },
  { id: 502, project: "Quantum Computing", category: "Salary", amount: 85000, date: "2026-03-05", status: "Pending", submittedBy: "Prof. Priya Nair", receipt: true },
  { id: 503, project: "Satellite Signal", category: "Travel", amount: 32000, date: "2026-03-08", status: "Pending", submittedBy: "Dr. Arjun Mehta", receipt: false },
  { id: 504, project: "Green Hydrogen", category: "Consumables", amount: 120000, date: "2026-03-09", status: "Approved", submittedBy: "Prof. Priya Nair", receipt: true },
  { id: 505, project: "AI in Healthcare", category: "Miscellaneous", amount: 15000, date: "2026-03-10", status: "Rejected", submittedBy: "Dr. Arjun Mehta", receipt: false },
];

const PAYMENTS = [
  { id: 1, project: "AI in Healthcare", agency: "DST", amount: 2500000, type: "Research Grant", date: "2024-01-15", status: "Received" },
  { id: 2, project: "Quantum Computing", agency: "DRDO", amount: 4000000, type: "Installment 1", date: "2024-07-01", status: "Received" },
  { id: 3, project: "Green Hydrogen", agency: "DST", amount: 3000000, type: "Research Grant", date: "2025-01-20", status: "Received" },
  { id: 4, project: "Satellite Signal", agency: "ISRO", amount: 1750000, type: "Installment 2", date: "2025-09-01", status: "Pending" },
];

const AUDIT_LOGS = [
  { id: 1, user: "Admin", action: "Approved Expense #501", project: "AI Healthcare", time: "10 Mar 2026, 09:14" },
  { id: 2, user: "Prof. Priya Nair", action: "Submitted Expense #502", project: "Quantum Computing", time: "09 Mar 2026, 17:42" },
  { id: 3, user: "Admin", action: "Created Project #104", project: "Green Hydrogen", time: "08 Mar 2026, 11:30" },
  { id: 4, user: "Ravi Kumar", action: "Verified Payment #3", project: "Green Hydrogen", time: "07 Mar 2026, 14:05" },
  { id: 5, user: "Admin", action: "Rejected Expense #505", project: "AI Healthcare", time: "06 Mar 2026, 10:20" },
];

const monthlySpend = [
  { month: "Oct", amount: 420000 },
  { month: "Nov", amount: 680000 },
  { month: "Dec", amount: 510000 },
  { month: "Jan", amount: 890000 },
  { month: "Feb", amount: 720000 },
  { month: "Mar", amount: 540000 },
];

const categoryData = [
  { name: "Equipment", value: 3800000, color: "#6366f1" },
  { name: "Salary", value: 2100000, color: "#22d3ee" },
  { name: "Travel", value: 850000, color: "#f59e0b" },
  { name: "Consumables", value: 1200000, color: "#10b981" },
  { name: "Misc", value: 600000, color: "#f43f5e" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) => "₹" + (n >= 1000000 ? (n / 1000000).toFixed(2) + "M" : (n / 1000).toFixed(0) + "K");
const pct = (spent, budget) => Math.min(100, Math.round((spent / budget) * 100));

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    Approved: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
    Pending: "bg-amber-900/60 text-amber-300 border-amber-700",
    Rejected: "bg-rose-900/60 text-rose-300 border-rose-700",
    Active: "bg-indigo-900/60 text-indigo-300 border-indigo-700",
    Archived: "bg-zinc-800 text-zinc-400 border-zinc-600",
    Received: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || "bg-zinc-800 text-zinc-300"}`}>
      {status}
    </span>
  );
}

function BudgetBar({ spent, budget }) {
  const p = pct(spent, budget);
  const color = p >= 90 ? "#f43f5e" : p >= 70 ? "#f59e0b" : "#6366f1";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{fmt(spent)} spent</span>
        <span>{p}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div style={{ width: `${p}%`, backgroundColor: color }} className="h-full rounded-full transition-all" />
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("admin");

  return (
    <div style={{ background: "radial-gradient(ellipse at 60% 30%, #1e1b4b 0%, #09090b 60%)" }}
      className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-8 py-10 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ResearchFinance</h1>
          <p className="text-zinc-400 text-sm mt-1">University Research Management Portal</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="admin">Admin</option>
              <option value="faculty">Faculty / PI</option>
              <option value="finance">Finance Officer</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
          </div>
          <button onClick={() => onLogin(role)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            Sign In
          </button>
        </div>
        <p className="text-xs text-zinc-600 text-center mt-6">Demo: click Sign In with any role to explore</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const totalBudget = PROJECTS.reduce((a, p) => a + p.budget, 0);
  const totalSpent = PROJECTS.reduce((a, p) => a + p.spent, 0);
  const pending = EXPENSES.filter(e => e.status === "Pending").length;

  const stats = [
    { label: "Total Projects", value: PROJECTS.length, sub: "3 active agencies", icon: "🔬", color: "indigo" },
    { label: "Total Budget", value: fmt(totalBudget), sub: "Across all projects", icon: "💰", color: "cyan" },
    { label: "Total Spent", value: fmt(totalSpent), sub: `${pct(totalSpent, totalBudget)}% utilized`, icon: "📊", color: "amber" },
    { label: "Pending Approvals", value: pending, sub: "Require review", icon: "⏳", color: "rose" },
  ];

  const colorMap = {
    indigo: "border-indigo-800 bg-indigo-950/40",
    cyan: "border-cyan-800 bg-cyan-950/40",
    amber: "border-amber-800 bg-amber-950/40",
    rose: "border-rose-800 bg-rose-950/40",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Financial Overview</h2>
        <p className="text-zinc-500 text-sm mt-1">Research Finance Dashboard · March 2026</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className={`p-5 border ${colorMap[s.color]}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs font-semibold text-zinc-300 mt-1">{s.label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-widest">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlySpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-widest">Expense by Category</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                  {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {categoryData.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-zinc-400 flex-1">{c.name}</span>
                  <span className="text-xs font-semibold text-zinc-300">{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-widest">Project Budget Utilization</h3>
        <div className="space-y-4">
          {PROJECTS.filter(p => p.status === "Active").map(p => (
            <div key={p.id}>
              <div className="flex justify-between items-center mb-1.5">
                <div>
                  <span className="text-sm font-medium text-white">{p.title}</span>
                  <span className="ml-2 text-xs text-zinc-500">{p.agency}</span>
                </div>
                <span className="text-xs text-zinc-400">{fmt(p.budget)}</span>
              </div>
              <BudgetBar spent={p.spent} budget={p.budget} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProjectsPage() {
  const [view, setView] = useState("list");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", agency: "", pi: "", budget: "", start: "", end: "" });

  if (showCreate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreate(false)} className="text-zinc-400 hover:text-white text-sm flex items-center gap-1">
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
        </div>
        <Card className="p-6 max-w-2xl">
          <div className="space-y-4">
            {[
              { label: "Project Title", key: "title", placeholder: "e.g. AI in Drug Discovery" },
              { label: "Principal Investigator", key: "pi", placeholder: "Dr. Name" },
              { label: "Total Budget (₹)", key: "budget", placeholder: "e.g. 5000000" },
              { label: "Start Date", key: "start", type: "date" },
              { label: "End Date", key: "end", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
                <input type={f.type || "text"} placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Funding Agency</label>
              <select value={form.agency} onChange={e => setForm({ ...form, agency: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                <option value="">Select agency...</option>
                {AGENCIES.map(a => <option key={a.id} value={a.name}>{a.name} – {a.fullName}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Create Project
              </button>
              <button onClick={() => setShowCreate(false)}
                className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-zinc-500 text-sm mt-1">{PROJECTS.length} total · {PROJECTS.filter(p => p.status === "Active").length} active</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
          <span>+</span> New Project
        </button>
      </div>

      <div className="space-y-3">
        {PROJECTS.map(p => (
          <Card key={p.id} className="p-5 hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-semibold">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex gap-4 text-xs text-zinc-500 mb-3">
                  <span>ID: #{p.id}</span>
                  <span>Agency: {p.agency}</span>
                  <span>PI: {p.pi}</span>
                  <span>{p.start} → {p.end}</span>
                </div>
                <BudgetBar spent={p.spent} budget={p.budget} />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white font-bold">{fmt(p.budget)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Total Budget</div>
                <div className="text-indigo-400 font-semibold text-sm mt-1">{fmt(p.budget - p.spent)}</div>
                <div className="text-xs text-zinc-500">Remaining</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ExpensesPage({ role }) {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState(EXPENSES);

  const approve = (id) => setExpenses(es => es.map(e => e.id === id ? { ...e, status: "Approved" } : e));
  const reject = (id) => setExpenses(es => es.map(e => e.id === id ? { ...e, status: "Rejected" } : e));

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white text-sm">← Back</button>
          <h2 className="text-2xl font-bold text-white">Submit Expense</h2>
        </div>
        <Card className="p-6 max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Project</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                {PROJECTS.filter(p => p.status === "Active").map(p => <option key={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Category</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                {["Equipment", "Salary", "Travel", "Consumables", "Miscellaneous"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Amount (₹)</label>
              <input type="number" placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Description</label>
              <textarea rows={3} placeholder="Expense details..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Upload Receipt</label>
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors">
                <div className="text-2xl mb-1">📎</div>
                <div className="text-sm text-zinc-400">Drop file or click to upload</div>
                <div className="text-xs text-zinc-600 mt-1">PDF, JPG, PNG up to 10MB</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Submit for Approval
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses</h2>
          <p className="text-zinc-500 text-sm mt-1">{expenses.filter(e => e.status === "Pending").length} pending approval</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + Submit Expense
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["ID", "Project", "Category", "Amount", "Date", "Submitted By", "Receipt", "Status", ...(role !== "faculty" ? ["Actions"] : [])].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={e.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${i % 2 === 0 ? "" : "bg-zinc-900/30"}`}>
                  <td className="px-5 py-3.5 text-zinc-400">#{e.id}</td>
                  <td className="px-5 py-3.5 text-white font-medium">{e.project}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{e.category}</td>
                  <td className="px-5 py-3.5 text-white font-semibold">{fmt(e.amount)}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{e.date}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{e.submittedBy}</td>
                  <td className="px-5 py-3.5">{e.receipt ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400">✗</span>}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                  {role !== "faculty" && (
                    <td className="px-5 py-3.5">
                      {e.status === "Pending" && (
                        <div className="flex gap-1.5">
                          <button onClick={() => approve(e.id)} className="text-xs bg-emerald-900/60 border border-emerald-700 text-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-800 transition-colors">Approve</button>
                          <button onClick={() => reject(e.id)} className="text-xs bg-rose-900/60 border border-rose-700 text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-800 transition-colors">Reject</button>
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
    </div>
  );
}

function BudgetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Budget Management</h2>
        <p className="text-zinc-500 text-sm mt-1">Allocation & utilization per project</p>
      </div>

      <div className="space-y-4">
        {PROJECTS.filter(p => p.status === "Active").map(p => {
          const categories = [
            { name: "Equipment", allocated: p.budget * 0.35, spent: p.spent * 0.42 },
            { name: "Salary", allocated: p.budget * 0.30, spent: p.spent * 0.28 },
            { name: "Travel", allocated: p.budget * 0.10, spent: p.spent * 0.08 },
            { name: "Consumables", allocated: p.budget * 0.15, spent: p.spent * 0.16 },
            { name: "Miscellaneous", allocated: p.budget * 0.10, spent: p.spent * 0.06 },
          ];
          return (
            <Card key={p.id} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{p.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.agency} · Total: {fmt(p.budget)}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="space-y-3">
                {categories.map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-medium">{c.name}</span>
                      <span className="text-zinc-400">{fmt(c.spent)} / {fmt(c.allocated)}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (c.spent / c.allocated) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payments</h2>
          <p className="text-zinc-500 text-sm mt-1">Grants & installments received</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="p-5 border-cyan-800 bg-cyan-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Received</div>
          <div className="text-2xl font-bold text-white">{fmt(PAYMENTS.filter(p => p.status === "Received").reduce((a, p) => a + p.amount, 0))}</div>
        </Card>
        <Card className="p-5 border-amber-800 bg-amber-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">{fmt(PAYMENTS.filter(p => p.status === "Pending").reduce((a, p) => a + p.amount, 0))}</div>
        </Card>
        <Card className="p-5 border-indigo-800 bg-indigo-950/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Transactions</div>
          <div className="text-2xl font-bold text-white">{PAYMENTS.length}</div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Project", "Agency", "Type", "Amount", "Date", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-5 py-3.5 text-white font-medium">{p.project}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{p.agency}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{p.type}</td>
                  <td className="px-5 py-3.5 text-white font-semibold">{fmt(p.amount)}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{p.date}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ReportsPage() {
  const barData = PROJECTS.map(p => ({ name: p.title.split(" ").slice(0, 2).join(" "), budget: p.budget / 100000, spent: p.spent / 100000 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-zinc-500 text-sm mt-1">Financial summaries & exports</p>
        </div>
        <div className="flex gap-2">
          {["PDF", "Excel", "CSV"].map(f => (
            <button key={f} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 px-3 py-2 rounded-lg transition-colors">
              ↓ {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-widest">Budget vs Spending per Project (₹ Lakhs)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#52525b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#52525b" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}L`} />
            <Tooltip formatter={v => `₹${v}L`} contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
            <Legend formatter={v => <span style={{ color: "#a1a1aa", fontSize: 12 }}>{v}</span>} />
            <Bar dataKey="budget" fill="#6366f1" radius={[4, 4, 0, 0]} name="Budget" />
            <Bar dataKey="spent" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Project Financial Summary", desc: "Full breakdown per project", icon: "📑" },
          { title: "Monthly Expense Report", desc: "Month-wise expenditure trends", icon: "📅" },
          { title: "Budget Utilization Report", desc: "Category-wise usage", icon: "📊" },
          { title: "Funding Agency Report", desc: "Agency-wise project performance", icon: "🏛️" },
        ].map(r => (
          <Card key={r.title} className="p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="text-3xl">{r.icon}</div>
            <div>
              <div className="text-white font-semibold text-sm">{r.title}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{r.desc}</div>
            </div>
            <div className="ml-auto text-zinc-500 text-lg">→</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AgenciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Funding Agencies</h2>
          <p className="text-zinc-500 text-sm mt-1">{AGENCIES.length} active agencies</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + Add Agency
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENCIES.map(a => (
          <Card key={a.id} className="p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {a.name}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{a.name}</div>
                <div className="text-zinc-500 text-xs">{a.fullName}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Projects</span>
                <span className="text-zinc-300 font-semibold">{a.projects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Contact</span>
                <span className="text-indigo-400">{a.contact}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-zinc-500 text-sm mt-1">{USERS.length} system users</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + Invite User
        </button>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Name", "Email", "Role", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center text-white text-xs font-bold">
                      {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-white font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-400">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    u.role === "admin" ? "bg-indigo-900/60 text-indigo-300 border-indigo-700" :
                    u.role === "faculty" ? "bg-cyan-900/60 text-cyan-300 border-cyan-700" :
                    "bg-amber-900/60 text-amber-300 border-amber-700"
                  }`}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1 rounded-lg transition-colors">Edit</button>
                    <button className="text-xs text-rose-400 hover:text-rose-300 border border-rose-900 hover:border-rose-700 px-3 py-1 rounded-lg transition-colors">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
        <p className="text-zinc-500 text-sm mt-1">System activity trail</p>
      </div>
      <Card>
        <div className="divide-y divide-zinc-800">
          {AUDIT_LOGS.map(log => (
            <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold flex-shrink-0 mt-0.5">
                {log.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{log.user}</span>
                  <span className="text-zinc-400 text-sm">{log.action}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                  <span>Project: {log.project}</span>
                  <span>·</span>
                  <span>{log.time}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.action.includes("Approved") ? "bg-emerald-400" :
                  log.action.includes("Rejected") ? "bg-rose-400" :
                  log.action.includes("Created") ? "bg-indigo-400" : "bg-zinc-500"
                }`} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const NAV_ALL = [
  { key: "dashboard", label: "Dashboard", icon: "⬛", roles: ["admin", "faculty", "finance"] },
  { key: "projects", label: "Projects", icon: "🔬", roles: ["admin", "faculty", "finance"] },
  { key: "budget", label: "Budget", icon: "📊", roles: ["admin", "finance"] },
  { key: "expenses", label: "Expenses", icon: "🧾", roles: ["admin", "faculty", "finance"] },
  { key: "payments", label: "Payments", icon: "💳", roles: ["admin", "finance"] },
  { key: "agencies", label: "Agencies", icon: "🏛️", roles: ["admin", "finance"] },
  { key: "reports", label: "Reports", icon: "📑", roles: ["admin", "finance"] },
  { key: "users", label: "Users", icon: "👥", roles: ["admin"] },
  { key: "audit", label: "Audit Logs", icon: "🔍", roles: ["admin"] },
];

function Sidebar({ page, setPage, role, onLogout }) {
  const nav = NAV_ALL.filter(n => n.roles.includes(role));
  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">RF</div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">ResearchFinance</div>
            <div className="text-zinc-500 text-xs capitalize">{role} Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
              page === n.key ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}>
            <span className="text-base">{n.icon}</span>
            <span className="font-medium">{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <span>🚪</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("admin");
  const [page, setPage] = useState("dashboard");

  const handleLogin = (r) => {
    setRole(r);
    setLoggedIn(true);
    setPage("dashboard");
  };

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  const pageMap = {
    dashboard: <Dashboard />,
    projects: <ProjectsPage />,
    budget: <BudgetPage />,
    expenses: <ExpensesPage role={role} />,
    payments: <PaymentsPage />,
    agencies: <AgenciesPage />,
    reports: <ReportsPage />,
    users: <UsersPage />,
    audit: <AuditPage />,
  };

  return (
    <div className="flex bg-zinc-950 min-h-screen text-white" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Sidebar page={page} setPage={setPage} role={role} onLogout={() => setLoggedIn(false)} />
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        {pageMap[page] || <Dashboard />}
      </main>
    </div>
  );
}