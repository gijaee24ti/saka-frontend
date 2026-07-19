import { Suspense, lazy, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { MdMenu, MdLogout } from "react-icons/md";
import api from "../services/api";

const Sidebar = lazy(() => import("../components/Sidebar"));

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch {
      // Token may already be expired, proceed with local cleanup
    }
    localStorage.removeItem("saka_admin_session");
    localStorage.removeItem("saka_auth_session");
    navigate("/admin/login", { replace: true });
  };

  // Close sidebar on route change via resize/escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#06251c]">
      {/* ── Desktop Sidebar (sticky, always visible lg+) ── */}
      <div className="hidden lg:block shrink-0 w-[280px]">
        <div className="sticky top-0 h-screen w-[280px] z-30">
          <Suspense fallback={<Loading />}>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </Suspense>
        </div>
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[280px] transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Suspense fallback={null}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </Suspense>
      </div>

      {/* ── Main Content ── */}
      <main className="saka-bubble-bg flex-1 min-w-0">
        {/* Checker strip — desktop offset, mobile full width */}
        <div className="pointer-events-none fixed left-0 lg:left-[280px] right-0 top-0 z-20 h-4 saka-checker-strip" />

        {/* ── Desktop Top Bar (logout button) ── */}
        <div className="sticky top-0 z-30 hidden lg:block">
          <div className="flex items-center justify-end px-6 pt-5 pb-3 lg:px-8">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-[#f4e7d3] px-5 py-2.5 text-sm font-black text-[#5c3b1e] shadow-sm transition-all duration-300 hover:bg-[#e8d5bc] hover:shadow-md"
            >
              <MdLogout className="text-base" />
              Logout
            </button>
          </div>
        </div>

        {/* ── Mobile Top Bar ── */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-[#06251c]/95 backdrop-blur-md px-4 py-3 border-b border-white/10 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Buka menu"
          >
            <MdMenu className="text-xl" />
          </button>

          <h1 className="text-lg font-black tracking-[0.2em]">
            SAKA<span className="text-emerald-400">.</span>
          </h1>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-[#f4e7d3] px-3.5 py-2 text-xs font-black text-[#5c3b1e] transition-all duration-300 hover:bg-[#e8d5bc]"
          >
            <MdLogout className="text-sm" />
            Logout
          </button>
        </div>

        <div className="saka-bubble-content min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}