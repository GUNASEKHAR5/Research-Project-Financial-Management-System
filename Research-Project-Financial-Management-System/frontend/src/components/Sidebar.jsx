import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard",  icon: "📊", roles: ["admin", "faculty", "finance"] },
  { path: "/projects",  label: "Projects",   icon: "🔬", roles: ["admin", "faculty", "finance"] },
  { path: "/budget",    label: "Budget",     icon: "💰", roles: ["admin", "finance"] },
  { path: "/expenses",  label: "Expenses",   icon: "🧾", roles: ["admin", "faculty", "finance"] },
  { path: "/payments",  label: "Payments",   icon: "💳", roles: ["admin", "finance"] },
  { path: "/agencies",  label: "Agencies",   icon: "🏛️", roles: ["admin", "finance"] },
  { path: "/reports",   label: "Reports",    icon: "📑", roles: ["admin", "finance"] },
  { path: "/users",     label: "Users",      icon: "👥", roles: ["admin"] },
  { path: "/audit",     label: "Audit Logs", icon: "🔍", roles: ["admin"] },
];

const ROLE_LABEL = {
  admin:   "Admin Portal",
  faculty: "Faculty Portal",
  finance: "Finance Portal",
};

const Sidebar = () => {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const { pathname }      = useLocation();

  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0 flex-shrink-0">

      {/* ── Logo + signed-in user ─────────────────────────── */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold select-none">
            RF
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">ResearchFinance</div>
            <div className="text-zinc-500 text-xs">{ROLE_LABEL[user?.role] ?? "Portal"}</div>
          </div>
        </div>

        {user && (
          <div className="px-3 py-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-0.5">Signed in as</div>
            <div className="text-sm text-white font-medium truncate">{user.name}</div>
            <div className="text-xs text-zinc-500 truncate">{user.email}</div>
          </div>
        )}
      </div>

      {/* ── Nav links ─────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map((n) => {
          const isActive = pathname === n.path || pathname.startsWith(n.path + "/");
          return (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <span className="text-base">{n.icon}</span>
              <span className="font-medium">{n.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Sign out ──────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <span>🚪</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;