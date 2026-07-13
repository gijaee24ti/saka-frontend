import { useEffect, useMemo, useState } from "react";
import {
  MdNotificationsNone,
  MdStorefront,
  MdLocalShipping,
  MdRestaurantMenu,
  MdFeedback,
  MdCheckCircle,
  MdCancel,
  MdPercent,
  MdInventory,
} from "react-icons/md";
import api from "../services/api";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import StatCard from "../components/StatCard";
import ResponsiveGrid from "../components/ResponsiveGrid";
export default function AdminDashboard() {
  const [riders, setRiders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [menus, setMenus] = useState([]);
  const [feedback, setfeedback] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  /* ─── Helpers ─── */
  const toArray = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const formatTime = (value) => {
    if (!value) return "00:00";
    const text = String(value);
    if (text.includes("T")) return text.split("T")[1]?.slice(0, 5) || "00:00";
    if (text.includes(" ")) return text.split(" ")[1]?.slice(0, 5) || "00:00";
    return text.slice(0, 5);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 10);
  };

  const getInitial = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  /* ─── Normalizers ─── */
  const normalizeLocationFromApi = (item) => ({
    id: item.id,
    branch: item.branch || "",
    vehicle: item.vehicle || "Outlet",
    openTime: formatTime(item.open_time),
    closeTime: formatTime(item.close_time),
    status: item.status || "Tidak Beroperasi",
  });

  const normalizeRiderFromApi = (item, outletList = []) => {
    const outletId = item.outlet_id || item.outlet?.id || "";
    const outlet = item.outlet || outletList.find((loc) => loc.id === outletId);
    const operationalStatus =
      item.operational_status || item.operationalStatus || "Tidak Beroperasi";
    return {
      id: item.id,
      initial: getInitial(item.name || ""),
      name: item.name || "",
      location: outlet?.branch || item.stand || item.location || "",
      stand: outlet?.branch || item.stand || item.location || "",
      phone: item.phone || "",
      time: formatTime(item.updated_at || item.created_at),
      operationalStatus,
      status:
        operationalStatus === "Berjualan"
          ? "Active"
          : operationalStatus === "Istirahat"
            ? "Break"
            : "Inactive",
    };
  };

  const normalizeMenuFromApi = (item) => ({
    id: item.id,
    name: item.name || "",
    category: item.category || "",
    status: item.status || "Aktif",
  });

  const normalizefeedbackFromApi = (item) => ({
    id: item.id,
    customerName:
      item.customer_name || item.customerName || item.name || "Konsumen",
    type: item.type || "feedback",
    rating: Number(item.rating || 0),
    message: item.message || "",
    status: item.status || "Pending",
    date: formatDate(item.date || item.created_at),
  });

  /* Inventory normalizer — availability only, no quantity fields */
  const normalizeInventoryFromApi = (item, outletList = [], riderList = [], menuList = []) => {
    const outletId = item.outlet_id || item.outlet?.id || "";
    const riderId = item.rider_id || item.rider?.id || "";
    const menuId = item.menu_id || item.menu?.id || "";

    const outlet = item.outlet || outletList.find((loc) => loc.id === outletId);
    const rider = item.rider || riderList.find((d) => d.id === riderId);
    const menu = item.menu || menuList.find((d) => d.id === menuId);

    return {
      id: item.id,
      branch: item.branch || item.outlet_branch || outlet?.branch || "",
      outletType: item.outlet_type || item.outletType || outlet?.vehicle || "",
      riderName: item.rider_name || item.riderName || rider?.name || "",
      productName: item.product_name || item.productName || menu?.name || "",
      stockStatus: item.stock_status || item.stockStatus || "Tersedia",
      note: item.note || "",
    };
  };

  /* ─── Fetch ─── */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setNotice("");

      const [outletRes, riderRes, menuRes, feedbackRes, stockRes] =
        await Promise.all([
          api.get("/public/outlets"),
          api.get("/admin/riders"),
          api.get("/admin/menus"),
          api.get("/public/feedback"),
          api.get("/public/stocks"),
        ]);

      const outletData = toArray(outletRes).map(normalizeLocationFromApi);
      const menuData = toArray(menuRes).map(normalizeMenuFromApi);
      const riderData = toArray(riderRes).map((item) =>
        normalizeRiderFromApi(item, outletData)
      );
      const feedbackData = toArray(feedbackRes).map(normalizefeedbackFromApi);
      const stockData = toArray(stockRes).map((item) =>
        normalizeInventoryFromApi(item, outletData, riderData, menuData)
      );

      setLocations(outletData);
      setMenus(menuData);
      setRiders(riderData);
      setfeedback(feedbackData);
      setInventory(stockData);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem("saka_admin_session");
        window.location.href = "/login";
        return;
      }
      setNotice("Gagal mengambil data dashboard dari backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ─── Computed metrics ─── */
  const activeRiders = riders.filter((r) => r.status === "Active").length;

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedRiders,
  } = usePagination(riders, 5);

  const activeLocations = locations.filter(
    (loc) =>
      loc.status === "Aktif" ||
      loc.status === "Bergerak" ||
      loc.status === "Buka"
  ).length;

  const totalMenus = menus.length;
  const activeMenus = menus.filter((m) => m.status === "Aktif").length;
  const totalfeedback = feedback.length;
  const pendingfeedback = feedback.filter((f) => f.status === "Pending").length;

  /* Availability metrics — replaces all quantity-based calculations */
  const totalMonitored = inventory.length;
  const totalAvailable = inventory.filter((i) => i.stockStatus === "Tersedia").length;
  const totalUnavailable = inventory.filter((i) => i.stockStatus === "Tidak Tersedia").length;
  const availabilityPct =
    totalMonitored > 0
      ? Math.round((totalAvailable / totalMonitored) * 100)
      : 100;

  /* Literan metrics */
  const literanMenus = useMemo(() =>
    menus.filter((m) => m.category === "Literan" || (m.name || "").toLowerCase().includes("literan"))
    , [menus]);
  const literanAktif = useMemo(() => {
    return literanMenus.filter((m) => {
      const stock = inventory.find((i) => i.menuId === m.id);
      return !stock || stock.stockStatus === "Tersedia";
    }).length;
  }, [literanMenus, inventory]);

  /* ─── Stats cards ─── */
  const stats = [
    {
      label: "Total Menu",
      value: totalMenus.toString().padStart(2, "0"),
      note: `${activeMenus} aktif`,
      icon: <MdRestaurantMenu />,
      bg: "bg-white",
      text: "text-[#06251c]",
      iconBox: "bg-[#e7ddd0] text-[#06251c]",
      noteColor: "text-emerald-700",
    },
    {
      label: "Lokasi",
      value: activeLocations.toString().padStart(2, "0"),
      note: "aktif / bergerak",
      icon: <MdStorefront />,
      bg: "bg-white",
      text: "text-[#06251c]",
      iconBox: "bg-[#cce6dd] text-[#607f75]",
      noteColor: "text-emerald-700",
    },
    {
      label: "Rider",
      value: riders.length.toString().padStart(2, "0"),
      note: `${activeRiders} aktif`,
      icon: <MdLocalShipping />,
      bg: "bg-white",
      text: "text-[#06251c]",
      iconBox: "bg-[#e5eeee] text-[#607f75]",
      noteColor: "text-emerald-700",
    },
    {
      label: "Keluhan",
      value: totalfeedback.toString().padStart(2, "0"),
      note: `${pendingfeedback} pending`,
      icon: <MdFeedback />,
      bg: "bg-white",
      text: "text-[#06251c]",
      iconBox: "bg-white/10 text-slate-200",
      noteColor: pendingfeedback > 0 ? "text-yellow-300" : "text-green-300",
    },
  ];

  /* ─── Recent products unavailable (replaces "best seller") ─── */
  const unavailableProducts = useMemo(() => {
    return inventory
      .filter((i) => i.stockStatus === "Tidak Tersedia")
      .slice(0, 4);
  }, [inventory]);

  const recentfeedback = useMemo(() => [...feedback].slice(0, 3), [feedback]);

  const statusClass = (status) => {
    if (status === "Active") return "bg-green-500/25 text-green-300";
    if (status === "Break") return "bg-yellow-500/25 text-yellow-300";
    return "bg-red-500/25 text-red-300";
  };

  const feedbackStatusClass = (status) => {
    if (status === "Ditampilkan") return "text-emerald-600";
    if (status === "Disembunyikan") return "text-red-500";
    return "text-yellow-600";
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 text-white overflow-x-hidden">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
            SAKA ADMIN PANEL
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Dashboard Pengelola
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Ringkasan operasional Kopi Saka On The Road — menu, rider, lokasi,
            keluhan, dan ketersediaan produk outlet.
          </p>
          {loading && (
            <p className="mt-3 text-xs font-bold text-emerald-300">
              Mengambil data dashboard...
            </p>
          )}
          {notice && (
            <p className="mt-3 text-xs font-bold text-red-300">{notice}</p>
          )}
        </div>

        <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/15">
          <MdNotificationsNone />
          {pendingfeedback > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-4">
        <ResponsiveGrid>
          {stats.map((item, index) => (
            <StatCard
              key={index}
              icon={<div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${item.iconBox}`}>{item.icon}</div>}
              label={item.label}
              value={item.value}
              note={item.note}
              className={`${item.bg} ${item.text}`}
            />
          ))}
        </ResponsiveGrid>
      </div>

      {/* Literan Aktif Card */}
      <div className="mb-6">
        <div className="rounded-2xl sm:rounded-3xl bg-[#0d3a2a] border border-emerald-900/50 px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-xl">
            <MdStorefront />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">Literan Aktif</p>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-2xl font-black text-white">{literanAktif}</span>
              <span className="text-xs text-slate-400">dari {literanMenus.length} produk literan</span>
            </div>
          </div>
          <a
            href="/manajemen-literan"
            className="shrink-0 rounded-full bg-emerald-600/80 px-3 py-1.5 text-[10px] font-black text-white hover:bg-emerald-500 transition"
          >
            Kelola
          </a>
        </div>
      </div>

      {/* ── Availability Summary ── */}
      <div className="mb-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">

        {/* Availability panel */}
        <div className="saka-card bg-[#103c2e] p-6 text-white lg:col-span-2">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                Availability Summary
              </p>
              <h2 className="mt-2 text-2xl font-black">Ringkasan Ketersediaan</h2>
              <p className="mt-2 text-sm text-slate-300">
                Status ketersediaan produk diperbarui oleh rider secara real-time.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-6 py-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Tersedia
              </p>
              <h3 className="mt-2 text-4xl font-black">{availabilityPct}%</h3>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-300 transition-all duration-700"
              style={{ width: `${availabilityPct}%` }}
            />
          </div>

          {/* Three metric boxes */}
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-[22px] bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <MdInventory className="text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Total Dipantau
                </p>
              </div>
              <p className="mt-2 text-2xl font-black">{totalMonitored}</p>
            </div>

            <div className="rounded-[22px] bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <MdCheckCircle className="text-emerald-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Tersedia
                </p>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-300">{totalAvailable}</p>
            </div>

            <div className="rounded-[22px] bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <MdCancel className="text-red-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Tidak Tersedia
                </p>
              </div>
              <p className="mt-2 text-2xl font-black text-red-300">{totalUnavailable}</p>
            </div>
          </div>
        </div>

        {/* Produk Tidak Tersedia list */}
        <div className="saka-card bg-[#f7f0e6] p-6 text-[#06251c]">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
            Perlu Perhatian
          </p>
          <h2 className="mt-2 text-2xl font-black">Produk Habis</h2>
          <div className="mt-5 space-y-4">
            {unavailableProducts.length === 0 ? (
              <p className="text-sm text-slate-500">
                Semua produk tersedia. 🎉
              </p>
            ) : (
              unavailableProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-[#d8cfc1] pb-3 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-black">{item.productName || "Produk"}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.branch || "-"}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black text-red-600">
                    Habis
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Grid: Rider Table + Feedback ── */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">

        {/* Active Fleet Monitoring */}
        <div className="saka-panel bg-[#103c2e] p-7 xl:col-span-2">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                Fleet Monitoring
              </p>
              <h2 className="mt-2 text-xl font-black text-white">
                Monitoring Rider
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                Tampilan ringkas status rider yang sedang terdaftar.
              </p>
            </div>
            <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-black text-slate-200">
              Dashboard View
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                  <th className="pb-5 font-black">Rider</th>
                  <th className="pb-5 font-black">Lokasi</th>
                  <th className="pb-5 font-black">No. HP</th>
                  <th className="pb-5 font-black">Timer</th>
                  <th className="pb-5 font-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedRiders.map((rider) => (
                  <tr key={rider.id}>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f2ea] text-xs font-black text-[#06251c]">
                          {rider.initial || getInitial(rider.name)}
                        </div>
                        <span className="font-bold text-white">
                          {rider.name || "Rider"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-xs font-medium text-slate-300">
                      {rider.location || rider.stand || "-"}
                    </td>
                    <td className="py-5 text-xs font-medium text-slate-300">
                      {rider.phone || "-"}
                    </td>
                    <td className="py-5 text-xs font-medium text-slate-300">
                      {rider.time || "00:00"}
                    </td>
                    <td className="py-5">
                      <span
                        className={`rounded-full px-4 py-1 text-[10px] font-black ${statusClass(rider.status)}`}
                      >
                        {rider.status || "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {riders.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Belum ada data rider.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {riders.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="saka-panel bg-[#f7f0e6] p-7 text-[#06251c]">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
            feedback
          </p>
          <h2 className="mt-2 mb-6 text-xl font-black">
            Keluhan &amp; Masukan Terbaru
          </h2>
          <div className="space-y-6">
            {recentfeedback.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada keluhan atau masukan.
              </p>
            ) : (
              recentfeedback.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[#d8cfc1] pb-5 last:border-b-0 last:pb-0"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black">
                      {item.type || "feedback"}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase ${feedbackStatusClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">
                    {item.message || item.desc || "-"}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      {item.customerName || "Konsumen"}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      {item.date || "-"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}