import { useMemo } from "react";
import {
  MdNotificationsNone,
  MdWarningAmber,
  MdStorefront,
  MdLocalShipping,
  MdInventory,
  MdRestaurantMenu,
  MdFeedback,
  MdTrendingUp,
} from "react-icons/md";

const defaultRiders = [
  {
    id: 1,
    initial: "AS",
    name: "Aris Setiawan",
    location: "Cabang Arifin Ahmad",
    phone: "081234567891",
    time: "05:22",
    status: "Active",
  },
  {
    id: 2,
    initial: "BK",
    name: "Budi Kusuma",
    location: "Cabang Rumbai",
    phone: "081234567892",
    time: "02:15",
    status: "Break",
  },
];

const defaultLocations = [
  { id: 1, branch: "Cabang Cut Nyak Dien", status: "Aktif" },
  { id: 2, branch: "Cabang Patimura", status: "Aktif" },
  { id: 3, branch: "Cabang Rajawali", status: "Aktif" },
  { id: 4, branch: "Cabang Riau", status: "Aktif" },
  { id: 5, branch: "Cabang Kharudin Nasution / Simpang", status: "Aktif" },
  { id: 6, branch: "Cabang Arifin Ahmad", status: "Aktif" },
  { id: 7, branch: "Cabang Rumbai", status: "Aktif" },
  { id: 8, branch: "Cabang Stadion / Nagasakti", status: "Aktif" },
  { id: 9, branch: "Cabang Tuanku Tambusai / Nangka", status: "Aktif" },
  { id: 10, branch: "Cabang Nangka Ujung", status: "Aktif" },
  { id: 11, branch: "Cabang Hang Tuah Ujung", status: "Aktif" },
  { id: 12, branch: "Cabang Parit Indah", status: "Bergerak" },
  { id: 13, branch: "Cabang HR. Soebrantas", status: "Aktif" },
  { id: 14, branch: "Cabang Soekarno Hatta", status: "Aktif" },
  { id: 15, branch: "Cabang Hangtuah", status: "Aktif" },
  { id: 16, branch: "Bajaj Dipo Malam", status: "Aktif" },
];

const defaultMenus = [
  {
    id: 1,
    name: "Kopi Susu Aren",
    category: "Coffee",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Es Kopi Susu",
    category: "Coffee",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Coklat Susu Aren",
    category: "Non Coffee",
    status: "Aktif",
  },
];

const defaultFeedbacks = [
  {
    id: 1,
    customerName: "Aditra Rahman",
    type: "Review",
    rating: 5,
    message: "Kopinya enak, pelayanan cepat, dan rider ramah.",
    status: "Ditampilkan",
    date: "2026-05-29",
  },
  {
    id: 2,
    customerName: "Isfi Ansyah",
    type: "Keluhan",
    rating: 3,
    message: "Pesanan datang agak lama di cabang tertentu.",
    status: "Pending",
    date: "2026-05-29",
  },
];

const defaultInventory = [
  {
    id: 1,
    branch: "Cabang Parit Indah",
    outletType: "Sepeda",
    riderName: "Gizza",
    productName: "Kopi Susu Aren",
    maxCapacity: 250,
    initialStock: 200,
    remainingStock: 200,
    updatedAt: "09:00",
    note: "Stok awal untuk rider.",
  },
  {
    id: 2,
    branch: "Cabang Arifin Ahmad",
    outletType: "Bajaj",
    riderName: "Budi Kusuma",
    productName: "Es Kopi Susu",
    maxCapacity: 600,
    initialStock: 600,
    remainingStock: 600,
    updatedAt: "09:00",
    note: "Stok awal bajaj Arifin Ahmad.",
  },
];

export default function AdminDashboard() {
  const riders = useMemo(() => {
    const saved = localStorage.getItem("saka_riders");
    return saved ? JSON.parse(saved) : defaultRiders;
  }, []);

  const locations = useMemo(() => {
    const saved = localStorage.getItem("saka_locations");
    return saved ? JSON.parse(saved) : defaultLocations;
  }, []);

  const menus = useMemo(() => {
    const saved = localStorage.getItem("saka_menus");
    return saved ? JSON.parse(saved) : defaultMenus;
  }, []);

  const feedbacks = useMemo(() => {
    const saved = localStorage.getItem("saka_feedbacks");
    return saved ? JSON.parse(saved) : defaultFeedbacks;
  }, []);

  const inventory = useMemo(() => {
    const saved = localStorage.getItem("saka_inventory");
    return saved ? JSON.parse(saved) : defaultInventory;
  }, []);

  const activeRiders = riders.filter((rider) => rider.status === "Active").length;

  const activeLocations = locations.filter(
    (location) =>
      location.status === "Aktif" ||
      location.status === "Bergerak" ||
      location.status === "Buka"
  ).length;

  const totalMenus = menus.length;
  const activeMenus = menus.filter((menu) => menu.status === "Aktif").length;
  const totalFeedbacks = feedbacks.length;
  const pendingFeedbacks = feedbacks.filter(
    (feedback) => feedback.status === "Pending"
  ).length;

  const totalInitialStock = inventory.reduce(
    (total, item) => total + Number(item.initialStock || 0),
    0
  );

  const totalRemainingStock = inventory.reduce(
    (total, item) => total + Number(item.remainingStock || 0),
    0
  );

  const totalSoldStock = totalInitialStock - totalRemainingStock;

  const stockPercentage =
    totalInitialStock > 0
      ? Math.round((totalRemainingStock / totalInitialStock) * 100)
      : 100;

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
      value: totalFeedbacks.toString().padStart(2, "0"),
      note: `${pendingFeedbacks} pending`,
      icon: <MdFeedback />,
      bg: "bg-white",
      text: "text-[#06251c]",
      iconBox: "bg-white/10 text-slate-200",
      noteColor: pendingFeedbacks > 0 ? "text-yellow-300" : "text-green-300",
    },
  ];

  const bestSellerMenus = inventory
    .map((item) => {
      const sold =
        Number(item.initialStock || 0) - Number(item.remainingStock || 0);

      return {
        name: item.productName,
        branch: item.branch,
        sold: sold < 0 ? 0 : sold,
      };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  const recentFeedbacks = feedbacks.slice(0, 3);

  const getInitial = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

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

  return (
    <div className="min-h-screen px-8 py-8 text-white">
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
            Ringkasan operasional Kopi Saka On The Road untuk memantau menu,
            rider, lokasi, keluhan, dan kondisi stok outlet.
          </p>
        </div>

        <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/15">
          <MdNotificationsNone />
          {pendingFeedbacks > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
          )}
        </button>
      </div>

      {/* Monitoring Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`saka-card ${item.bg} ${item.text} px-6 py-5`}
          >
            <div className="mb-8 flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${item.iconBox}`}
              >
                {item.icon}
              </div>

              {item.note && (
                <span
                  className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.noteColor}`}
                >
                  {item.note}
                </span>
              )}
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              {item.label}
            </p>

            <h2 className="mt-2 text-4xl font-black">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Stock Summary */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="saka-card bg-[#103c2e] p-6 text-white lg:col-span-2">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                Inventory Summary
              </p>
              <h2 className="mt-2 text-2xl font-black">Ringkasan Stok Outlet</h2>
              <p className="mt-2 text-sm text-slate-300">
                Stok awal diinput oleh admin, sedangkan stok sisa nantinya
                diperbarui oleh rider.
              </p>
            </div>

            <div className="rounded-[24px] bg-white/10 px-6 py-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Sisa Stok
              </p>
              <h3 className="mt-2 text-4xl font-black">{stockPercentage}%</h3>
            </div>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-300"
              style={{ width: `${stockPercentage}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-[22px] bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Stok Awal
              </p>
              <p className="mt-2 text-2xl font-black">{totalInitialStock}</p>
            </div>

            <div className="rounded-[22px] bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Stok Sisa
              </p>
              <p className="mt-2 text-2xl font-black">{totalRemainingStock}</p>
            </div>

            <div className="rounded-[22px] bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Terjual
              </p>
              <p className="mt-2 text-2xl font-black">{totalSoldStock}</p>
            </div>
          </div>
        </div>

        <div className="saka-card bg-[#f7f0e6] p-6 text-[#06251c]">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
            Best Seller
          </p>

          <h2 className="mt-2 text-2xl font-black">Menu Terlaris</h2>

          <div className="mt-5 space-y-4">
            {bestSellerMenus.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada data penjualan dari inventory.
              </p>
            ) : (
              bestSellerMenus.map((menu, index) => (
                <div
                  key={`${menu.name}-${index}`}
                  className="flex items-center justify-between border-b border-[#d8cfc1] pb-3 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-black">{menu.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{menu.branch}</p>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-black text-emerald-700">
                    <MdTrendingUp />
                    {menu.sold}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
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
                {riders.slice(0, 5).map((rider) => (
                  <tr key={rider.id}>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f2ea] text-xs font-black text-[#06251c]">
                          {rider.initial || getInitial(rider.name)}
                        </div>

                        <span className="font-bold text-white">
                          {rider.name}
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
                        className={`rounded-full px-4 py-1 text-[10px] font-black ${statusClass(
                          rider.status
                        )}`}
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
        </div>

        {/* Recent Feedback */}
        <div className="saka-panel bg-[#f7f0e6] p-7 text-[#06251c]">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
            Feedback
          </p>

          <h2 className="mt-2 mb-6 text-xl font-black">
            Keluhan & Masukan Terbaru
          </h2>

          <div className="space-y-6">
            {recentFeedbacks.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada keluhan atau masukan.
              </p>
            ) : (
              recentFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[#d8cfc1] pb-5 last:border-b-0 last:pb-0"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black">
                      {item.type || "Feedback"}
                    </h3>

                    <span
                      className={`text-[10px] font-black uppercase ${feedbackStatusClass(
                        item.status
                      )}`}
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