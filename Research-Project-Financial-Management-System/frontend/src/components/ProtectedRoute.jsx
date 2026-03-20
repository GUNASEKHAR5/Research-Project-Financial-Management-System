import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./PageState";

/**
 * Wraps routes that require authentication.
 * - Shows spinner while the auth state is rehydrating from localStorage.
 * - Redirects to /login if no user is found.
 * - Optionally restricts by role: <ProtectedRoute roles={["admin"]} />
 */
const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → send to dashboard
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // All good — render the child route
  return <Outlet />;
};

export default ProtectedRoute;