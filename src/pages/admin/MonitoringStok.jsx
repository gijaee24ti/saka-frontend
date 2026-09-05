import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdInventory,
  MdSearch,
  MdCheckCircle,
  MdCancel,
  MdClose,
  MdSave,
  MdLocationOn,
  MdPerson,
  MdAccessTime,
  MdRefresh,
} from "react-icons/md";
import api from "../../services/api";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import ResponsiveGrid from "../../components/ResponsiveGrid";
import { showAlert } from "../../utils/notification";
import { formatMapsLink } from "../../utils/outletUtama";
/* ─── Branch defaults (fallback jika API kosong) ─── */
const defaultBranches = [
  { branch: "Outlet Saka", outletType: "Outlet" },
  { branch: "Cabang Cut Nyak Dien", outletType: "Sepeda" },
  { branch: "Cabang Patimura", outletType: "Sepeda" },
  { branch: "Cabang Rajawali", outletType: "Sepeda" },
  { branch: "Cabang Riau", outletType: "Sepeda" },
  { branch: "Cabang Kharudin Nasution / Simpang", outletType: "Sepeda" },
  { branch: "Cabang Tuanku Tambusai / Nangka", outletType: "Sepeda" },
  { branch: "Cabang Nangka Ujung", outletType: "Sepeda" },
  { branch: "Cabang Parit Indah", outletType: "Sepeda" },
  { branch: "Cabang HR. Soebrantas / Panam", outletType: "Bajaj" },
  { branch: "Cabang Soekarno Hatta", outletType: "Sepeda" },
  { branch: "Cabang Hangtuah", outletType: "Sepeda" },
  { branch: "Cabang Arifin Ahmad", outletType: "Bajaj" },
  { branch: "Cabang Rumbai", outletType: "Tenda" },
  { branch: "Cabang Stadion / Nagasakti", outletType: "Bajaj" },
  { branch: "Cabang Hang Tuah Ujung", outletType: "Bajaj" },
  { branch: "Bajaj Dipo Malam", outletType: "Bajaj" },
];

const DONUT_ALLOWED = [
  "OUTLET SAKA DAHLIA",
  "Outlet Saka",
  "Cabang Stadion / Nagasakti",
  "Cabang Rumbai",
  "Cabang Hang Tuah Ujung",
];

const BASE_PRODUCTS = [
  "Kopi Susu Aren",
  "Es Kopi Susu",
  "Coklat Susu Aren",
  "Pinky Milky",
  "Creamy Butterscotch",
];

const VEHICLE_ICONS = {
  Sepeda: "🚲",
  Bajaj: "🛺",
  Tenda: "⛺",
  Outlet: "🏪",
};

export default function MonitoringStok() {
  const [inventory, setInventory] = useState([]);
  const [riders, setRiders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [selectedBranchGroup, setSelectedBranchGroup] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState("");
  const [newStockForm, setNewStockForm] = useState({ menuId: "", quantity: 20, status: "Tersedia", note: "" });

  /* ─── Helpers ─── */
  const showNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice({ type: "", text: "" }), 3500);
  };

  const getErrorMessage = (error, fallback) => {
    const message = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;
    if (message) return message;
    if (errors) {
      const first = Object.values(errors)[0];
      if (Array.isArray(first)) return first[0];
    }
    return fallback;
  };

  const toArray = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(value).slice(0, 16);
    }
  };

  /* ─── Normalizers ─── */
  const normalizeOutletFromApi = (item) => ({
    id: item.id,
    branch: item.branch || "",
    outletType: item.vehicle || item.outlet_type || item.outletType || "Sepeda",
    status: item.status || "Tidak Beroperasi",
    openTime: item.open_time || item.openTime || "",
    closeTime: item.close_time || item.closeTime || "",
    address: item.address || "",
    mapsLink: formatMapsLink(item.maps_link || item.mapsLink || ""),
    note: item.note || "",
  });

  const normalizeRiderFromApi = (item, outletList = []) => {
    const outletId = item.outlet_id || item.outlet?.id || "";
    const outlet = item.outlet || outletList.find((d) => d.id === outletId);
    return {
      id: item.id,
      name: item.name || "",
      phone: item.phone || "",
      outletId,
      stand: item.stand || item.location || outlet?.branch || "",
      operationalStatus: item.operational_status || item.operationalStatus || "Tidak Beroperasi",
      status: item.operational_status === "Berjualan" ? "Active" : "Inactive",
    };
  };

  const normalizeMenuFromApi = (item) => ({
    id: item.id,
    name: item.name || "",
    category: item.category || "",
  });

  const normalizeStockFromApi = (item, outletList = [], riderList = [], menuList = []) => {
    const outletId = item.outlet_id || item.outlet?.id || item.outletId || "";
    const riderId = item.rider_id || item.rider?.id || item.riderId || "";
    const menuId = item.menu_id || item.menu?.id || item.menuId || "";
    const outlet = item.outlet || outletList.find((d) => d.id === outletId);
    const rider = item.rider || riderList.find((d) => d.id === riderId);
    const menu = item.menu || menuList.find((d) => d.id === menuId);
    return {
      id: item.id,
      outletId,
      riderId,
      menuId,
      branch: item.branch || item.outlet_branch || outlet?.branch || "",
      outletType: item.outlet_type || item.outletType || outlet?.outletType || "",
      riderName: item.rider_name || item.riderName || rider?.name || "",
      productName: item.product_name || item.productName || menu?.name || "",
      quantity: item.quantity ?? 0,
      stockStatus: item.stock_status || item.stockStatus || "Tersedia",
      updatedAt: formatDateTime(item.updated_at || item.updatedAt),
      note: item.note || "",
    };
  };

  /* ─── Fetch ─── */
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [stockRes, riderRes, menuRes, outletRes] = await Promise.all([
        api.get("/public/stocks"),
        api.get("/admin/riders"),
        api.get("/admin/menus"),
        api.get("/public/outlets"),
      ]);
      const outletData = toArray(outletRes).map(normalizeOutletFromApi);
      const riderData = toArray(riderRes).map((i) => normalizeRiderFromApi(i, outletData));
      const menuData = toArray(menuRes).map(normalizeMenuFromApi);
      const stockData = toArray(stockRes).map((i) =>
        normalizeStockFromApi(i, outletData, riderData, menuData)
      );
      setLocations(outletData);
      setRiders(riderData);
      setMenus(menuData);
      setInventory(stockData);
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal mengambil data dari backend."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const branchOptions = useMemo(() => {
    if (locations.length > 0) {
      return locations.map((item) => ({
        id: item.id,
        branch: item.branch,
        outletType: item.outletType || "Sepeda",
        status: item.status || "Tidak Beroperasi",
        openTime: item.openTime || "",
        closeTime: item.closeTime || "",
        address: item.address || "",
        mapsLink: item.mapsLink || "",
      }));
    }
    return defaultBranches;
  }, [locations]);

  /* ─── Filtered Rider Stocks (Excluding Literan) ─── */
  const riderInventory = useMemo(() => {
    return inventory.filter((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      const isLiteranMenu =
        menu?.category === "Literan" ||
        (item.productName || "").toLowerCase().includes("literan");
      return !isLiteranMenu;
    });
  }, [inventory, menus]);

  /* ─── Group by Branch ─── */
  const groupedByBranch = useMemo(() => {
    const groups = {};
    branchOptions.forEach((bo) => {
      const assignedRider = riders.find(
        (r) => r.outletId === bo.id || r.stand === bo.branch
      );
      groups[bo.branch] = {
        id: bo.id,
        branch: bo.branch,
        outletType: bo.outletType || "Sepeda",
        status: bo.status || "Tidak Beroperasi",
        openTime: bo.openTime || "",
        closeTime: bo.closeTime || "",
        address: bo.address || "",
        mapsLink: bo.mapsLink || "",
        riderName: assignedRider?.name || "",
        riderPhone: assignedRider?.phone || "",
        riderOperational: assignedRider?.operationalStatus || "",
        lastUpdated: "-",
        items: [],
        availableCount: 0,
        unavailableCount: 0,
      };
    });

    riderInventory.forEach((item) => {
      const branchName = item.branch;
      if (!groups[branchName]) {
        groups[branchName] = {
          id: item.outletId,
          branch: branchName,
          outletType: item.outletType || "Sepeda",
          status: "Tidak Beroperasi",
          openTime: "",
          closeTime: "",
          address: "",
          riderName: item.riderName || "",
          riderPhone: "",
          riderOperational: "",
          lastUpdated: "-",
          items: [],
          availableCount: 0,
          unavailableCount: 0,
        };
      }
      const group = groups[branchName];
      group.items.push(item);
      if (!group.riderName && item.riderName) group.riderName = item.riderName;
      if (item.updatedAt && item.updatedAt !== "-") {
        if (group.lastUpdated === "-") {
          group.lastUpdated = item.updatedAt;
        }
      }
      if (item.stockStatus === "Tersedia") group.availableCount++;
      else group.unavailableCount++;
    });

    return Object.values(groups);
  }, [branchOptions, riderInventory, riders]);

  /* ─── Metrics ─── */
  const totalCabang = branchOptions.length;

  const cabangAktif = useMemo(() => {
    return branchOptions.filter((b) => {
      const loc = locations.find((l) => l.id === b.id || l.branch === b.branch);
      if (loc && (loc.status === "Aktif" || loc.status === "Buka" || loc.status === "Bergerak")) return true;
      const rider = riders.find((r) => r.outletId === b.id || r.stand === b.branch);
      if (rider && (rider.operationalStatus === "Berjualan" || rider.status === "Active")) return true;
      return false;
    }).length;
  }, [branchOptions, locations, riders]);

  const produkTidakTersediaCount = useMemo(() =>
    riderInventory.filter((i) => i.stockStatus === "Tidak Tersedia").length
    , [riderInventory]);

  const persentaseKetersediaan = useMemo(() => {
    if (riderInventory.length === 0) return 100;
    const available = riderInventory.filter((i) => i.stockStatus === "Tersedia").length;
    return Math.round((available / riderInventory.length) * 100);
  }, [riderInventory]);

  /* ─── Search Filter ─── */
  const filteredGroupedBranches = useMemo(() => {
    if (!search.trim()) return groupedByBranch;
    const kw = search.toLowerCase();
    return groupedByBranch.filter((group) =>
      group.branch.toLowerCase().includes(kw) ||
      group.riderName.toLowerCase().includes(kw) ||
      group.items.some((item) => item.productName.toLowerCase().includes(kw))
    );
  }, [groupedByBranch, search]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedBranches,
  } = usePagination(filteredGroupedBranches, 6);

  /* ─── Modal ─── */
  const handleOpenModal = (e, group) => {
    e.stopPropagation();
    setSelectedBranchGroup(group);
    setNewStockForm({ menuId: "", status: "Tersedia", note: "" });
    setEditingNoteId(null);
  };

  useEffect(() => {
    if (selectedBranchGroup) {
      const updated = groupedByBranch.find((g) => g.branch === selectedBranchGroup.branch);
      if (updated) setSelectedBranchGroup(updated);
      else setSelectedBranchGroup(null);
    }
  }, [groupedByBranch]);

  // Close modal on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedBranchGroup(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleToggleStatus = async (item) => {
    const nextStatus = item.stockStatus === "Tersedia" ? "Tidak Tersedia" : "Tersedia";
    try {
      await api.put(`/admin/stocks/${item.id}`, {
        outlet_id: item.outletId,
        rider_id: item.riderId,
        menu_id: item.menuId,
        quantity: item.quantity,
        stock_status: nextStatus,
        note: item.note,
      });
      showNotice("success", `${item.productName} → ${nextStatus}`);
      await fetchAllData();
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal mengubah status."));
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity, 10) || 0);
    try {
      await api.put(`/admin/stocks/${item.id}`, {
        outlet_id: item.outletId,
        rider_id: item.riderId,
        menu_id: item.menuId,
        quantity: qty,
        stock_status: item.stockStatus,
        note: item.note,
      });
      showNotice("success", `Stok ${item.productName} diubah menjadi ${qty}.`);
      await fetchAllData();
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal memperbarui jumlah stok."));
    }
  };

  const handleSaveNote = async (item) => {
    try {
      await api.put(`/admin/stocks/${item.id}`, {
        outlet_id: item.outletId,
        rider_id: item.riderId,
        menu_id: item.menuId,
        quantity: item.quantity,
        stock_status: item.stockStatus,
        note: tempNoteText,
      });
      showNotice("success", "Catatan berhasil disimpan.");
      setEditingNoteId(null);
      await fetchAllData();
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal menyimpan catatan."));
    }
  };

  const handleDeleteItem = async (item) => {
    const confirmDelete = await showAlert.confirm(`Hapus pemantauan ${item.productName}?`, "Konfirmasi Hapus");
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/stocks/${item.id}`);
      showNotice("success", "Produk dihapus dari pemantauan.");
      await fetchAllData();
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal menghapus."));
    }
  };

  const unmonitoredProducts = useMemo(() => {
    if (!selectedBranchGroup) return [];
    const monitoredMenuIds = selectedBranchGroup.items.map((i) => String(i.menuId));
    const monitoredNames = selectedBranchGroup.items.map((i) => (i.productName || "").toLowerCase());
    return menus.filter(
      (m) => !monitoredMenuIds.includes(String(m.id)) && !monitoredNames.includes((m.name || "").toLowerCase())
    );
  }, [menus, selectedBranchGroup]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newStockForm.menuId) { showNotice("error", "Pilih produk terlebih dahulu."); return; }
    const selectedMenu = menus.find((m) => String(m.id) === String(newStockForm.menuId) || m.name === newStockForm.menuId);
    if (!selectedMenu) { showNotice("error", "Menu tidak valid."); return; }
    const assignedRider = riders.find(
      (r) => r.outletId === selectedBranchGroup.id || r.stand === selectedBranchGroup.branch
    );
    try {
      await api.post("/admin/stocks", {
        outlet_id: selectedBranchGroup.id || null,
        rider_id: assignedRider?.id || null,
        menu_id: selectedMenu.id,
        quantity: Number(newStockForm.quantity || 0),
        stock_status: newStockForm.status,
        note: newStockForm.note,
      });
      showNotice("success", `${selectedMenu.name} berhasil ditambahkan ke monitoring.`);
      setNewStockForm({ menuId: "", quantity: 20, status: "Tersedia", note: "" });
      await fetchAllData();
    } catch (error) {
      showNotice("error", getErrorMessage(error, "Gagal menambahkan produk."));
    }
  };

  const getStatusColor = (status) => {
    if (status === "Berjualan" || status === "Aktif" || status === "Buka") return "text-emerald-400";
    if (status === "Istirahat") return "text-yellow-400";
    return "text-slate-400";
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 text-white overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            Admin Panel
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl flex items-center gap-2">
            <MdInventory className="text-emerald-400 shrink-0" />
            Monitoring Stok
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Status ketersediaan produk per cabang/outlet · Klik <strong>Lihat Detail</strong> untuk kelola stok
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/20 disabled:opacity-50"
          >
            <MdRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 max-w-sm">
        <MdSearch className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari cabang, rider, atau produk..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-white">
            <MdClose className="text-sm" />
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="mb-8">
        <ResponsiveGrid>
          <StatCard
            icon={<MdLocationOn />}
            iconClass="bg-slate-100 text-slate-900"
            label="Total Cabang"
            value={totalCabang}
            className="bg-white text-[#06251c]"
          />
          <StatCard
            icon={<MdCheckCircle />}
            iconClass="bg-emerald-100 text-emerald-700"
            label="Cabang Aktif"
            value={cabangAktif}
            className="bg-white text-[#06251c]"
          />
          <StatCard
            icon={<MdCancel />}
            iconClass="bg-red-100 text-red-600"
            label="Produk Habis"
            value={produkTidakTersediaCount}
            className="bg-white text-[#06251c]"
          />
          <StatCard
            icon={<MdInventory />}
            iconClass="bg-slate-100 text-slate-900"
            label="Ketersediaan"
            value={`${persentaseKetersediaan}%`}
            className="bg-white text-[#06251c]"
          >
            <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                style={{ width: `${persentaseKetersediaan}%` }}
              />
            </div>
          </StatCard>
        </ResponsiveGrid>
      </div>

      {/* Notice */}
      {notice.text && (
        <div
          className={`mb-5 rounded-2xl px-4 py-3 text-xs font-bold ${notice.type === "success"
            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
            : "bg-red-500/20 text-red-200 border border-red-500/30"
            }`}
        >
          {notice.text}
        </div>
      )}

      {/* Loading */}
      {loading && inventory.length === 0 && (
        <div className="rounded-3xl bg-[#103c2e] p-12 text-center text-slate-300 text-sm">
          Mengambil data ketersediaan cabang...
        </div>
      )}

      {/* Empty */}
      {!loading && filteredGroupedBranches.length === 0 && (
        <div className="rounded-3xl bg-[#103c2e] p-12 text-center text-slate-300 text-sm">
          {search ? `Tidak ada cabang cocok dengan "${search}"` : "Belum ada data cabang."}
        </div>
      )}

      {/* Outlet Cards Grid */}
      {paginatedBranches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {paginatedBranches.map((group) => {
            const hasUnavailable = group.unavailableCount > 0;
            const vehicleIcon = VEHICLE_ICONS[group.outletType] || "📍";

            return (
              <div
                key={group.branch}
                className={`saka-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4 transition-all duration-200 ${hasUnavailable
                  ? "border-red-500/20"
                  : "border-white/10"
                  }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-lg">{vehicleIcon}</span>
                      <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                        {group.branch}
                      </h3>
                    </div>
                    <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {group.outletType}
                    </span>
                  </div>
                  {/* Status Indicator */}
                  {hasUnavailable ? (
                    <span className="shrink-0 rounded-full bg-red-500/15 border border-red-500/25 px-2.5 py-1 text-[10px] font-black text-red-300">
                      {group.unavailableCount} Habis
                    </span>
                  ) : null}
                </div>

                {/* Rider Info */}
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MdPerson className="text-slate-500 shrink-0" />
                  <span>
                    Rider:{" "}
                    <span className="font-bold text-white">{group.riderName || "-"}</span>
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Product Badges */}
                {group.items.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item.id}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 ${item.stockStatus === "Tidak Tersedia"
                          ? "bg-red-500/15 text-red-300 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/15"
                          }`}
                      >
                        {item.stockStatus === "Tersedia" ? "✅" : "❌"} {item.productName} <span className="opacity-80">· Stok: {item.quantity}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Belum ada produk dipantau.
                  </p>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <span className="text-[10px] text-slate-500">
                    {group.lastUpdated !== "-"
                      ? `Update: ${group.lastUpdated}`
                      : "Belum ada update"}
                  </span>
                  <button
                    onClick={(e) => handleOpenModal(e, group)}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-[11px] font-black text-white transition hover:bg-emerald-500 active:scale-95"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredGroupedBranches.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ── Modal Detail ── */}
      {selectedBranchGroup && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedBranchGroup(null)}
        >
          <div
            className="bg-[#f7f0e6] text-[#06251c] w-full sm:max-w-2xl rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-200 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                  Detail Cabang
                </p>
                <h2 className="text-xl font-black leading-tight">
                  {VEHICLE_ICONS[selectedBranchGroup.outletType] || "📍"} {selectedBranchGroup.branch}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBranchGroup(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
              >
                <MdClose />
              </button>
            </div>

            {/* Modal Body — Scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1">
                    <MdPerson className="text-sm" /> Rider
                  </p>
                  <p className="mt-1 text-sm font-black">{selectedBranchGroup.riderName || "-"}</p>
                  {selectedBranchGroup.riderPhone && (
                    <p className="text-xs text-slate-500 mt-0.5">{selectedBranchGroup.riderPhone}</p>
                  )}
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1">
                    <MdLocationOn className="text-sm" /> Kendaraan
                  </p>
                  <p className="mt-1 text-sm font-black">{selectedBranchGroup.outletType}</p>
                  <p className={`text-xs mt-0.5 font-bold ${getStatusColor(selectedBranchGroup.riderOperational)}`}>
                    {selectedBranchGroup.riderOperational || "Tidak Beroperasi"}
                  </p>
                </div>
                {(selectedBranchGroup.openTime || selectedBranchGroup.closeTime) && (
                  <div className="rounded-2xl bg-white p-4 shadow-sm col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1 mb-1">
                      <MdAccessTime className="text-sm" /> Jam Operasional
                    </p>
                    <p className="text-sm font-black">
                      {selectedBranchGroup.openTime || "?"} — {selectedBranchGroup.closeTime || "?"}
                    </p>
                  </div>
                )}
                {selectedBranchGroup.address && selectedBranchGroup.address !== "-" && (
                  <div className="rounded-2xl bg-white p-4 shadow-sm col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Alamat</p>
                    <p className="text-xs text-slate-600 leading-5">{selectedBranchGroup.address}</p>
                  </div>
                )}
                {selectedBranchGroup.mapsLink && (
                  <div className="rounded-2xl bg-white p-4 shadow-sm col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Google Maps</p>
                      <p className="text-xs text-slate-600 truncate max-w-[280px]">{selectedBranchGroup.mapsLink}</p>
                    </div>
                    <a
                      href={selectedBranchGroup.mapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-[#06251c] px-3 py-1.5 text-xs font-black text-white hover:bg-[#103c2e] transition shrink-0"
                    >
                      Buka Maps ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Product List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Daftar Produk ({selectedBranchGroup.items.length})
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    <span className="text-emerald-600 font-bold">{selectedBranchGroup.availableCount} OK</span>
                    {selectedBranchGroup.unavailableCount > 0 && (
                      <span className="text-red-500 font-bold ml-2">{selectedBranchGroup.unavailableCount} Habis</span>
                    )}
                  </div>
                </div>

                {selectedBranchGroup.items.length === 0 ? (
                  <p className="text-sm text-slate-500 italic rounded-2xl bg-slate-100 p-4 text-center">
                    Belum ada produk dipantau di cabang ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedBranchGroup.items.map((item) => {
                      const isAvail = item.stockStatus === "Tersedia";
                      const isEditing = editingNoteId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl p-4 border shadow-sm ${isAvail
                            ? "bg-white/5 border-slate-100"
                            : "bg-red-50 border-red-100"
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                              <span className="text-base">{isAvail ? "✅" : "❌"}</span>
                              <h4 className="font-bold text-sm">{item.productName}</h4>
                              <div className="flex items-center gap-1 rounded-lg bg-white/40 border border-slate-200 px-2 py-0.5 text-xs">
                                <span className="text-slate-500 font-medium">Stok:</span>
                                <input
                                  type="number"
                                  min="0"
                                  defaultValue={item.quantity}
                                  onBlur={(e) => handleUpdateQuantity(item, e.target.value)}
                                  className="w-14 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center text-xs font-black text-slate-800 outline-none focus:border-[#06251c]"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleToggleStatus(item)}
                                className={`rounded-full px-3 py-1 text-[10px] font-black border transition ${isAvail
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  : "bg-red-50 text-red-700 border-red-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                                  }`}
                              >
                                {item.stockStatus}
                              </button>
                              <button
                                onClick={() => { setEditingNoteId(item.id); setTempNoteText(item.note || ""); }}
                                className="text-slate-400 hover:text-slate-700 transition"
                                title="Edit Catatan"
                              >
                                <MdEdit className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                className="text-red-300 hover:text-red-500 transition"
                                title="Hapus"
                              >
                                <MdDelete className="text-sm" />
                              </button>
                            </div>
                          </div>

                          {/* Note */}
                          <div className="mt-2 text-xs text-slate-500">
                            {isEditing ? (
                              <div className="flex gap-2 mt-1">
                                <input
                                  type="text"
                                  value={tempNoteText}
                                  onChange={(e) => setTempNoteText(e.target.value)}
                                  placeholder="Catatan rider..."
                                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[#06251c]"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveNote(item)}
                                  className="rounded-lg bg-emerald-600 px-2 py-1.5 text-white hover:bg-emerald-700 transition flex items-center gap-1"
                                >
                                  <MdSave className="text-sm" />
                                </button>
                                <button
                                  onClick={() => setEditingNoteId(null)}
                                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-500 hover:bg-slate-50 transition text-xs"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <p className="leading-5">
                                Catatan: <span className="text-slate-600">{item.note || "-"}</span>
                              </p>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Update: {item.updatedAt}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Product Form */}
              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                  + Tambah Produk Pantauan
                </h3>
                {unmonitoredProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Semua produk sudah dipantau.</p>
                ) : (
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Produk</label>
                      <select
                        value={newStockForm.menuId}
                        onChange={(e) => setNewStockForm((p) => ({ ...p, menuId: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#06251c]"
                      >
                        <option value="">Pilih Produk...</option>
                        {unmonitoredProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Jumlah Stok</label>
                      <input
                        type="number"
                        min="0"
                        value={newStockForm.quantity}
                        onChange={(e) => setNewStockForm((p) => ({ ...p, quantity: e.target.value }))}
                        placeholder="20"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#06251c]"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Status</label>
                      <select
                        value={newStockForm.status}
                        onChange={(e) => setNewStockForm((p) => ({ ...p, status: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#06251c]"
                      >
                        <option value="Tersedia">✅ Tersedia</option>
                        <option value="Tidak Tersedia">❌ Tidak Tersedia</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Catatan (Opsional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newStockForm.note}
                          onChange={(e) => setNewStockForm((p) => ({ ...p, note: e.target.value }))}
                          placeholder="Stok terbatas, dll..."
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#06251c]"
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-xl bg-[#06251c] px-4 py-2 text-xs font-black text-white transition hover:bg-[#103c2e]"
                        >
                          <MdAdd /> Tambah
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 shrink-0">
              <button
                onClick={() => setSelectedBranchGroup(null)}
                className="w-full rounded-full border border-slate-300 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}