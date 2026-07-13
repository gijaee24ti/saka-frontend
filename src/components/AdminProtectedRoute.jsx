import { Navigate, Outlet } from "react-router-dom";

export default function AdminProtectedRoute() {
  const session = localStorage.getItem("saka_admin_session");

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  try {
    const parsedSession = JSON.parse(session);

    const isAdminLoggedIn =
      parsedSession?.isLoggedIn === true && parsedSession?.role === "Admin";

    if (!isAdminLoggedIn) {
      localStorage.removeItem("saka_admin_session");
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    localStorage.removeItem("saka_admin_session");
    return <Navigate to="/login" replace />;
  }
}