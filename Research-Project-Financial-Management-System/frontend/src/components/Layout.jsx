import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

/**
 * Shell layout for all authenticated pages.
 * Renders the sidebar on the left and the current route's page on the right.
 */
const Layout = () => {
  return (
    <div
      className="flex bg-zinc-950 min-h-screen text-white"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;