import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout         from "./components/Layout";

import LoginPage    from "./pages/LoginPage";
import Dashboard    from "./pages/Dashboard";
import ProjectsPage  from "./pages/ProjectsPage";
import ExpensesPage  from "./pages/ExpensesPage";
import BudgetPage    from "./pages/BudgetPage";
import PaymentsPage  from "./pages/PaymentsPage";
import ReportsPage   from "./pages/ReportsPage";
import AgenciesPage  from "./pages/AgenciesPage";
import UsersPage     from "./pages/UsersPage";
import AuditPage     from "./pages/AuditPage";

/**
 * Route access matrix
 * ─────────────────────────────────────────
 * /login          public   (redirect to /dashboard if already logged in)
 * /dashboard      all roles
 * /projects       all roles
 * /expenses       all roles
 * /budget         admin, finance
 * /payments       admin, finance
 * /agencies       admin, finance
 * /reports        admin, finance
 * /users          admin only
 * /audit          admin only
 */

// Redirect already-authenticated users away from /login
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ──────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* ── Protected — all authenticated roles ─────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            {/* All roles */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects"  element={<ProjectsPage />} />
            <Route path="/expenses"  element={<ExpensesPage />} />

            {/* Admin + Finance */}
            <Route element={<ProtectedRoute roles={["admin", "finance"]} />}>
              <Route path="/budget"    element={<BudgetPage />} />
              <Route path="/payments"  element={<PaymentsPage />} />
              <Route path="/agencies"  element={<AgenciesPage />} />
              <Route path="/reports"   element={<ReportsPage />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit" element={<AuditPage />} />
            </Route>

          </Route>
        </Route>

        {/* ── Fallback redirects ───────────────────────────── */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;