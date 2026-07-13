import {
  MdDashboard,
} from "react-icons/md";
import { NavLink } from "react-router-dom";

export default function RiderSidebar({
  rider,
  selectedLocation,
  operationalStatus,
  formatStatusLabel,
  getOperationalColor,
  onLogout,
  onNavigate,
}) {
  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
      isActive
        ? "bg-white text-[#06251c]"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const handleNav = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="relative flex h-full min-h-screen w-[280px] max-w-full flex-col overflow-hidden overflow-y-auto bg-[#061c14] px-5 py-8 text-white sm:px-6 sm:py-10">
      <div className="absolute left-0 top-0 h-4 w-full saka-checker-strip" />

      {/* Logo */}
      <div className="mb-8 mt-6">
        <h1 className="text-4xl font-black tracking-[0.25em] text-white sm:text-5xl">
          SAKA<span className="text-emerald-400">.</span>
        </h1>
        <div className="mt-4 inline-block rounded-xl bg-black px-4 py-2 shadow-md">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white sm:text-sm">
            On The Road
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <p className="mb-3 px-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          Menu Rider
        </p>
        <ul className="space-y-1">
          <li>
            <NavLink to="/rider" end className={menuClass} onClick={handleNav}>
              <MdDashboard className="shrink-0 text-xl" />
              <span>Dashboard</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6">
        <p className="text-xs font-bold text-slate-500">SAKA On The Road Rider</p>
        <p className="mt-1 text-xs text-slate-600">© 2026 All Right Reserved</p>
      </div>
    </aside>
  );
}
