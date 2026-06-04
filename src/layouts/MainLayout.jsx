import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import Loading from "../components/Loading";

const Sidebar = lazy(() => import("../components/Sidebar"));

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[#06251c]">
      <Suspense fallback={<Loading />}>
        <Sidebar />
      </Suspense>

      <main className="saka-bubble-bg flex-1">
        <div className="pointer-events-none fixed left-[280px] right-0 top-0 z-20 h-4 saka-checker-strip" />

        <div className="saka-bubble-content min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}