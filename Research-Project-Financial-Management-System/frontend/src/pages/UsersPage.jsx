import { useState, useEffect } from "react";
import Card from "../components/Card";
import { Spinner, ErrorMsg } from "../components/PageState";
import { getUsers, createUser, deleteUser, activateUser } from "../services/userService";
import { getInitials } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const ROLE_STYLES = {
  admin:   "bg-indigo-900/60 text-indigo-300 border-indigo-700",
  faculty: "bg-cyan-900/60   text-cyan-300   border-cyan-700",
  finance: "bg-amber-900/60  text-amber-300  border-amber-700",
};

const RoleBadge = ({ role }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLES[role] || "bg-zinc-800 text-zinc-300 border-zinc-600"}`}>
    {role === "faculty" ? "Faculty / PI" : role.charAt(0).toUpperCase() + role.slice(1)}
  </span>
);

/* ── Invite Form ─────────────────────────────────────────────── */
const InviteUserForm = ({ onBack, onCreated }) => {
  const [form,    setForm]    = useState({ name: "", email: "", password: "", role: "faculty" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      await createUser(form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm transition-colors">← Back</button>
        <h2 className="text-2xl font-bold text-white">Invite User</h2>
      </div>
      <Card className="p-6 max-w-xl">
        {error && (
          <div className="mb-4 text-rose-400 text-sm bg-rose-900/30 border border-rose-800 rounded-xl px-4 py-3">{error}</div>
        )}
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
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
              placeholder="Temporary password"
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
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              {loading ? "Creating…" : "Create User"}
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
const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try { setUsers(await getUsers()); }
    catch { setError("Failed to load users."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate user.");
    }
  };

  const handleActivate = async (id, name) => {
    if (!window.confirm(`Activate ${name}?`)) return;
    try {
      await activateUser(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to activate user.");
    }
  };

  if (showForm) {
    return <InviteUserForm onBack={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-zinc-500 text-sm mt-1">{users.length} system users</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          + Invite User
        </button>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMsg message={error} onRetry={load} /> : (
        <>
          {/* Role summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { role: "admin",   label: "Admins",   border: "border-indigo-800", bg: "bg-indigo-950/30" },
              { role: "faculty", label: "Faculty",  border: "border-cyan-800",   bg: "bg-cyan-950/30" },
              { role: "finance", label: "Finance",  border: "border-amber-800",  bg: "bg-amber-950/30" },
            ].map((r) => (
              <Card key={r.role} className={`p-4 ${r.border} ${r.bg}`}>
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
                  {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
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
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${u.is_active ? "text-emerald-400" : "text-zinc-500"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs">{u.created_at?.slice(0, 10)}</td>
                    <td className="px-5 py-4">
                      {u.id !== currentUser.id && (
                        u.is_active ? (
                          <button onClick={() => handleDeactivate(u.id, u.name)}
                            className="text-xs text-rose-400 hover:text-rose-300 border border-rose-900 hover:border-rose-700 px-3 py-1 rounded-lg transition-colors">
                            Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(u.id, u.name)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-900 hover:border-emerald-700 px-3 py-1 rounded-lg transition-colors">
                            Activate
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};

export default UsersPage;