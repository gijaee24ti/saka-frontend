import { Suspense, lazy, useEffect, useState } from "react";
import { MdClose, MdMenu, MdLogout } from "react-icons/md";
import Loading from "../components/Loading";

const RiderSidebar = lazy(() => import("../components/RiderSidebar"));

export default function RiderLayout({
  children,
  rider,
  selectedLocation,
  operationalStatus,
  formatStatusLabel,
  getOperationalColor,
  onLogout,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#06251c]">
      {/* ── Desktop Sidebar (sticky, always visible lg+) ── */}
      <div className="hidden shrink-0 lg:block w-[280px]">
        <div className="sticky top-0 h-screen w-[280px] z-30">
          <Suspense fallback={<Loading />}>
            <RiderSidebar
              rider={rider}
              selectedLocation={selectedLocation}
              operationalStatus={operationalStatus}
              formatStatusLabel={formatStatusLabel}
              getOperationalColor={getOperationalColor}
              onLogout={onLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </Suspense>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-full w-[280px] max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Suspense fallback={null}>
          <RiderSidebar
            rider={rider}
            selectedLocation={selectedLocation}
            operationalStatus={operationalStatus}
            formatStatusLabel={formatStatusLabel}
            getOperationalColor={getOperationalColor}
            onLogout={onLogout}
            onNavigate={() => setSidebarOpen(false)}
          />
        </Suspense>
      </div>

      {/* ── Main Content ── */}
      <main className="saka-bubble-bg min-w-0 flex-1">
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 h-4 saka-checker-strip lg:left-[280px]" />

        {/* ── Desktop Top Bar (logout button) ── */}
        <div className="sticky top-0 z-30 hidden lg:block">
          <div className="flex items-center justify-end px-6 pt-5 pb-3 lg:px-8">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-full bg-[#f4e7d3] px-5 py-2.5 text-sm font-black text-[#5c3b1e] shadow-sm transition-all duration-300 hover:bg-[#e8d5bc] hover:shadow-md"
            >
              <MdLogout className="text-base" />
              Logout
            </button>
          </div>
        </div>

        {/* ── Mobile Top Bar ── */}
        <div className="sticky top-0 z-30 border-b border-white/10 bg-[#06251c]/95 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
              aria-label="Buka menu"
            >
              {sidebarOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {rider?.name || "Rider Saka"}
              </p>
              {operationalStatus && (
                <span
                  className={`inline-flex mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-black ${getOperationalColor(
                    operationalStatus
                  )}`}
                >
                  {formatStatusLabel(operationalStatus)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f4e7d3] px-3.5 py-2 text-xs font-black text-[#5c3b1e] transition-all duration-300 hover:bg-[#e8d5bc]"
            >
              <MdLogout className="text-sm" />
              Logout
            </button>
          </div>
        </div>

        <div className="saka-bubble-content min-h-screen">{children}</div>
      </main>
    </div>
  );
}

