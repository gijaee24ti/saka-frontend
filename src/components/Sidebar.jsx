import {
  MdDashboard,
  MdLocalShipping,
  MdFeedback,
  MdInventory,
  MdSettings,
  MdRestaurantMenu,
  MdLocationOn,
  MdLogout,
} from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const adminSession = localStorage.getItem("saka_admin_session");
  const admin = adminSession ? JSON.parse(adminSession) : null;

  const handleLogout = () => {
    localStorage.removeItem("saka_admin_session");
    navigate("/login", { replace: true });
  };

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all
    ${isActive
      ? "bg-white text-[#06251c]"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="relative flex min-h-screen w-[280px] flex-col overflow-hidden bg-[#061c14] px-8 py-10 text-white">
      <div className="absolute left-0 top-0 h-4 w-full saka-checker-strip" />

      {/* Logo */}
      <div className="mb-16 mt-6">
        <h1 className="text-5xl font-black tracking-[0.25em] text-white">
          SAKA<span className="text-emerald-400">.</span>
        </h1>

        <div className="mt-5 inline-block rounded-xl bg-black px-4 py-2 shadow-md">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-white">
            On The Road
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav>
        <ul className="space-y-4">
          <li>
            <NavLink to="/admin" className={menuClass}>
              <MdDashboard className="text-xl" />
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/riders" className={menuClass}>
              <MdLocalShipping className="text-xl" />
              <span>Rider</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/menu-harga" className={menuClass}>
              <MdRestaurantMenu className="text-xl" />
              <span>Menu & Harga</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/lokasi" className={menuClass}>
              <MdLocationOn className="text-xl" />
              <span>Lokasi</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/keluhan" className={menuClass}>
              <MdFeedback className="text-xl" />
              <span>Keluhan</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/monitoring-stok" className={menuClass}>
              <MdInventory className="text-xl" />
              <span>Monitoring Stok</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/settings" className={menuClass}>
              <MdSettings className="text-xl" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <div className="rounded-3xl bg-[#0d3a2a] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
            Login Sebagai
          </p>

          <p className="mt-3 text-sm font-black text-white">
            {admin?.name || "Admin Saka"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {admin?.role || "Admin Pengelola"}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#06251c] transition hover:bg-emerald-100"
          >
            <MdLogout />
            Logout
          </button>
        </div>

        <div className="mt-8">
          <p className="font-bold text-slate-400">SAKA On The Road Admin</p>
          <p className="mt-2 text-sm text-slate-500">
            © 2025 All Right Reserved
          </p>
        </div>
      </div>
    </aside>
  );
}