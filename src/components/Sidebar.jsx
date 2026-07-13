import {
  MdDashboard,
  MdLocalShipping,
  MdFeedback,
  MdInventory,
  MdRestaurantMenu,
  MdLocationOn,
  MdStorefront,
} from "react-icons/md";
import { NavLink } from "react-router-dom";

export default function Sidebar({ onNavigate }) {
  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
      isActive
        ? "bg-white text-[#06251c]"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const handleNav = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="relative flex h-full min-h-screen w-[280px] flex-col overflow-hidden overflow-y-auto bg-[#061c14] px-6 py-10 text-white">
      <div className="absolute left-0 top-0 h-4 w-full saka-checker-strip" />

      {/* Logo */}
      <div className="mb-10 mt-6">
        <h1 className="text-5xl font-black tracking-[0.25em] text-white">
          SAKA<span className="text-emerald-400">.</span>
        </h1>
        <div className="mt-4 inline-block rounded-xl bg-black px-4 py-2 shadow-md">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-white">
            On The Road
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 px-1">
          Menu Utama
        </p>
        <ul className="space-y-1">
          <li>
            <NavLink to="/admin" end className={menuClass} onClick={handleNav}>
              <MdDashboard className="text-xl shrink-0" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/riders" className={menuClass} onClick={handleNav}>
              <MdLocalShipping className="text-xl shrink-0" />
              <span>Rider</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/menu-harga" className={menuClass} onClick={handleNav}>
              <MdRestaurantMenu className="text-xl shrink-0" />
              <span>Menu & Harga</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/lokasi" className={menuClass} onClick={handleNav}>
              <MdLocationOn className="text-xl shrink-0" />
              <span>Lokasi</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/keluhan" className={menuClass} onClick={handleNav}>
              <MdFeedback className="text-xl shrink-0" />
              <span>Keluhan</span>
            </NavLink>
          </li>
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 px-1">
          Stok & Produk
        </p>
        <ul className="space-y-1">
          <li>
            <NavLink to="/monitoring-stok" className={menuClass} onClick={handleNav}>
              <MdInventory className="text-xl shrink-0" />
              <span>Monitoring Stok</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/manajemen-literan" className={menuClass} onClick={handleNav}>
              <MdStorefront className="text-xl shrink-0" />
              <span>Kelola Produk Literan</span>
            </NavLink>
          </li>
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        <ul className="space-y-1">
          <li>
            <NavLink to="/settings" className={menuClass} onClick={handleNav}>
              <MdStorefront className="text-xl shrink-0" />
              <span>Outlet Utama</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6">
        <p className="text-xs font-bold text-slate-500">SAKA On The Road Admin</p>
        <p className="mt-1 text-xs text-slate-600">© 2026 All Right Reserved</p>
      </div>
    </aside>
  );
}