import { NAV_ITEMS } from "../data/mockData";

const Sidebar = ({ page, setPage, role, onLogout }) => {
  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(role));

  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold select-none">
            RF
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">ResearchFinance</div>
            <div className="text-zinc-500 text-xs capitalize">{role} Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map((n) => (
          <button
            key={n.key}
            onClick={() => setPage(n.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
              page === n.key
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <span className="text-base">{n.icon}</span>
            <span className="font-medium">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <button
          onClick={onLogout}
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