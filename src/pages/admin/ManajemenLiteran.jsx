import { useEffect, useState, useMemo } from "react";
import {
  MdCheckCircle,
  MdCancel,
  MdSearch,
  MdWarningAmber,
  MdStorefront,
  MdRefresh,
  MdClose,
  MdLock,
} from "react-icons/md";
import api from "../../services/api";
import { findOutletUtama } from "../../utils/outletUtama";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import ResponsiveGrid from "../../components/ResponsiveGrid";

export default function ManajemenLiteran() {
  const [menus, setMenus] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const showNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice({ type: "", text: "" }), 3500);
  };

  const toArray = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const getErrorMessage = (error, fallback) => {
    const message = error?.response?.data?.message;
    if (message) return message;
    return fallback;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, stockRes, outletRes] = await Promise.all([
        api.get("/admin/menus?all=1"),
        api.get("/public/stocks"),
        api.get("/public/outlets"),
      ]);
      const allMenus = toArray(menuRes);
      const allStocks = toArray(stockRes);
      const allOutlets = toArray(outletRes);

      const literanMenus = allMenus.filter(
        (m) => m.category === "Literan" || (m.name || "").toLowerCase().includes("literan")
      );

      setMenus(literanMenus);
      setStocks(allStocks);
      setOutlets(allOutlets);
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal mengambil data produk literan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const outletUtama = useMemo(() => findOutletUtama(outlets), [outlets]);

  const filteredMenus = useMemo(() =>
    menus.filter((m) => (m.name || "").toLowerCase().includes(search.toLowerCase()))
  , [menus, search]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedMenus,
  } = usePagination(filteredMenus, 6);

  const totalAvailable = useMemo(() =>
    menus.filter((m) => {
      const s = stocks.find((s) => s.menu_id === m.id || s.menu?.id === m.id);
      return !s || (s.stock_status || s.stockStatus || "Tersedia") === "Tersedia";
    }).length
  , [menus, stocks]);

  const handleToggleStatus = async (menuId, currentStatus) => {
    if (!outletUtama) { showNotice("error", "Outlet utama tidak ditemukan."); return; }
    const nextStatus = currentStatus === "Tersedia" ? "Tidak Tersedia" : "Tersedia";
    const existing = stocks.find((s) => s.menu_id === menuId || s.menu?.id === menuId);
    try {
      const payload = {
        outlet_id: outletUtama.id,
        menu_id: menuId,
        rider_id: null,
        stock_status: nextStatus,
      };
      if (existing) await api.put(`/admin/stocks/${existing.id}`, payload);
      else await api.post("/admin/stocks", payload);
      showNotice("success", `Status diubah → ${nextStatus}`);
      fetchData();
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal mengubah status."));
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 text-white overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            Admin Only
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl flex items-center gap-2">
            <MdStorefront className="text-emerald-400 shrink-0" />
            Manajemen Produk Literan
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Kelola ketersediaan produk literan untuk Outlet Utama · Rider tidak dapat mengakses halaman ini
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/20 disabled:opacity-50"
        >
          <MdRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats + Search Row */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Stats Cards */}
        <div className="w-full sm:flex-1">
          <ResponsiveGrid>
            <StatCard
              icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#e7ddd0] text-[#06251c]"><MdStorefront /></div>}
              label="Total Literan"
              value={menus.length}
              className="bg-white text-[#06251c]"
            />

            <StatCard
              icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#cce6dd] text-[#607f75]"><MdCheckCircle /></div>}
              label="Tersedia"
              value={totalAvailable}
              className="bg-white text-[#06251c]"
            />

            <StatCard
              icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-red-100 text-red-600"><MdCancel /></div>}
              label="Tidak Tersedia"
              value={menus.length - totalAvailable}
              className="bg-white text-[#06251c]"
            />
          </ResponsiveGrid>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 w-full sm:w-auto sm:min-w-[220px]">
          <MdSearch className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk literan..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-white">
              <MdClose className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 rounded-2xl bg-[#0d3a2a] border border-emerald-900/60 p-4 flex items-start gap-3">
        <MdLock className="text-emerald-400 text-lg shrink-0 mt-0.5" />
        <p className="text-xs leading-5 text-slate-300">
          <span className="font-black text-white">Produk Literan hanya dikelola Admin.</span>{" "}
          Rider tidak dapat melihat atau mengubah status literan. Perubahan status di halaman ini
          langsung ditampilkan di halaman pelanggan.
        </p>
      </div>

      {/* Notice */}
      {notice.text && (
        <div className={`mb-5 rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2 ${
          notice.type === "success"
            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
            : "bg-red-500/20 text-red-200 border border-red-500/30"
        }`}>
          <MdWarningAmber className="text-lg shrink-0" />
          {notice.text}
        </div>
      )}

      {/* Loading */}
      {loading && menus.length === 0 && (
        <div className="rounded-3xl bg-[#103c2e] p-12 text-center text-slate-300 text-sm">
          Memuat data produk literan...
        </div>
      )}

      {/* Empty */}
      {!loading && filteredMenus.length === 0 && (
        <div className="rounded-3xl bg-[#103c2e] p-12 text-center text-slate-300 text-sm">
          {search ? `Produk "${search}" tidak ditemukan.` : "Belum ada produk literan di database."}
        </div>
      )}

      {/* Product Cards Grid */}
      {filteredMenus.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {paginatedMenus.map((menu) => {
            const stock = stocks.find(
              (s) => s.menu_id === menu.id || s.menu?.id === menu.id
            );
            const status = stock?.stock_status || stock?.stockStatus || "Tersedia";
            const isAvailable = status === "Tersedia";
            const lastUpdate = stock?.updated_at || stock?.updatedAt;

            return (
              <div
                key={menu.id}
                className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border transition-all duration-200 ${
                  isAvailable
                    ? "bg-white/5 border-emerald-900/20 text-[#06251c]"
                    : "bg-[#2a1010] border-red-900/40"
                }`}
              >
                {/* Product Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black leading-tight">{menu.name}</h3>
                    <p className="text-xs text-emerald-300 mt-1">Literan · Outlet Utama</p>
                  </div>
                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(menu.id, status)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black border transition-all ${
                      isAvailable
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30"
                    }`}
                    title="Klik untuk toggle status"
                  >
                    {isAvailable ? <MdCheckCircle /> : <MdCancel />}
                    {status}
                  </button>
                </div>

                {/* Description if any */}
                {menu.description && (
                  <p className="text-xs text-slate-400 leading-5">{menu.description}</p>
                )}

                {/* Last Updated */}
                {lastUpdate && (
                  <p className="text-[10px] text-slate-500 text-right border-t border-white/10 pt-3">
                    Update:{" "}
                    {new Date(lastUpdate).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredMenus.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
