import { Navigate, Outlet } from "react-router-dom";

export default function RiderProtectedRoute() {
  const session = localStorage.getItem("saka_rider_session");

  if (!session) {
    return <Navigate to="/rider/login" replace />;
  }

  try {
    const parsedSession = JSON.parse(session);

    const isRiderLoggedIn =
      parsedSession?.isLoggedIn === true && parsedSession?.role === "Rider";

    if (!isRiderLoggedIn) {
      localStorage.removeItem("saka_rider_session");
      localStorage.removeItem("saka_current_rider_id");
      return <Navigate to="/rider/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    localStorage.removeItem("saka_rider_session");
    localStorage.removeItem("saka_current_rider_id");
    return <Navigate to="/rider/login" replace />;
  }
}
