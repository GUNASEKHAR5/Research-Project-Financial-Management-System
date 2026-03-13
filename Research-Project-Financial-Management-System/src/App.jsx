import { useState } from "react";

import Sidebar    from "./components/Sidebar";
import LoginPage  from "./pages/LoginPage";
import Dashboard  from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import ExpensesPage from "./pages/ExpensesPage";
import BudgetPage   from "./pages/BudgetPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage  from "./pages/ReportsPage";
import AgenciesPage from "./pages/AgenciesPage";
import UsersPage    from "./pages/UsersPage";
import AuditPage    from "./pages/AuditPage";

const PAGE_MAP = (role) => ({
  dashboard: <Dashboard />,
  projects:  <ProjectsPage />,
  budget:    <BudgetPage />,
  expenses:  <ExpensesPage role={role} />,
  payments:  <PaymentsPage />,
  agencies:  <AgenciesPage />,
  reports:   <ReportsPage />,
  users:     <UsersPage />,
  audit:     <AuditPage />,
});

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role,     setRole]     = useState("admin");
  const [page,     setPage]     = useState("dashboard");

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setPage("dashboard");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setRole("admin");
    setPage("dashboard");
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const pages = PAGE_MAP(role);
  const currentPage = pages[page] ?? <Dashboard />;

  return (
    <div
      className="flex bg-zinc-950 min-h-screen text-white"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        role={role}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        {currentPage}
      </main>
    </div>
  );
};

export default App;