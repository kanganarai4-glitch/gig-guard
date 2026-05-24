import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "@/services/auth";

/**
 * Wraps protected routes.
 * If user is not logged in (no JWT in localStorage), redirects to /login.
 */
const ProtectedRoute = () => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
