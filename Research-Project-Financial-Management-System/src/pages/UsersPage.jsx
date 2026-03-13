import { useState } from "react";
import Card from "../components/Card";
import { USERS } from "../data/mockData";
import { getInitials } from "../utils/helpers";

const ROLE_STYLES = {
  admin:   "bg-indigo-900/60 text-indigo-300 border-indigo-700",
  faculty: "bg-cyan-900/60   text-cyan-300   border-cyan-700",
  finance: "bg-amber-900/60  text-amber-300  border-amber-700",
};

const RoleBadge = ({ role }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLES[role] ?? "bg-zinc-800 text-zinc-300 border-zinc-600"}`}>
    {role === "faculty" ? "Faculty / PI" : role.charAt(0).toUpperCase() + role.slice(1)}
  </span>
);

/* ── Invite User Form ────────────────────────────────────────── */
const InviteUserForm = ({ onBack }) => {
  const [form, setForm] = useState({ name: "", email: "", role: "faculty" });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Invite User</h2>
      </div>

      <Card className="p-6 max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)}
              placeholder="Dr. Full Name"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
              placeholder="name@university.edu"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => update("role", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="admin">Admin</option>
              <option value="faculty">Faculty / PI</option>
              <option value="finance">Finance Officer</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onBack}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Send Invitation
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

/* ── Users Page ──────────────────────────────────────────────── */
const UsersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [users]                 = useState(USERS);

  if (showForm) return <InviteUserForm onBack={() => setShowForm(false)} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-zinc-500 text-sm mt-1">{users.length} system users</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Invite User
        </button>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { role: "admin",   label: "Admins",   style: "border-indigo-800 bg-indigo-950/30" },
          { role: "faculty", label: "Faculty",  style: "border-cyan-800 bg-cyan-950/30" },
          { role: "finance", label: "Finance",  style: "border-amber-800 bg-amber-950/30" },
        ].map((r) => (
          <Card key={r.role} className={`p-4 ${r.style}`}>
            <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{r.label}</div>
            <div className="text-2xl font-bold text-white">
              {users.filter((u) => u.role === r.role).length}
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                {/* Avatar + Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-800 border border-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitials(u.name)}
                    </div>
                    <span className="text-white font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-400">{u.email}</td>
                <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                <td className="px-5 py-4 text-zinc-500 text-xs">{u.joined}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button className="text-xs text-rose-400 hover:text-rose-300 border border-rose-900 hover:border-rose-700 px-3 py-1 rounded-lg transition-colors">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default UsersPage;