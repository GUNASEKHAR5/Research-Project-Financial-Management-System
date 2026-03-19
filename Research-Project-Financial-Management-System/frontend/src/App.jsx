import { useState } from "react";
import { useAuth } from "./context/AuthContext";

import Sidebar     from "./components/Sidebar";
import LoginPage   from "./pages/LoginPage";
import Dashboard   from "./pages/Dashboard";
import ProjectsPage  from "./pages/ProjectsPage";
import ExpensesPage  from "./pages/ExpensesPage";
import BudgetPage    from "./pages/BudgetPage";
import PaymentsPage  from "./pages/PaymentsPage";
import ReportsPage   from "./pages/ReportsPage";
import AgenciesPage  from "./pages/AgenciesPage";
import UsersPage     from "./pages/UsersPage";
import AuditPage     from "./pages/AuditPage";
import { Spinner }   from "./components/PageState";

const buildPageMap = (role) => ({
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
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState("dashboard");

  // While rehydrating token from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const pages   = buildPageMap(user.role);
  const current = pages[page] ?? <Dashboard />;

  return (
    <div
      className="flex bg-zinc-950 min-h-screen text-white"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        role={user.role}
        onLogout={logout}
      />
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        {current}
      </main>
    </div>
  );
};

export default App;