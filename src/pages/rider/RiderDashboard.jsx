import { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  MdAccessTime,
  MdCheckCircle,
  MdInventory,
  MdLocalCafe,
  MdPerson,
  MdStorefront,
  MdWarningAmber,
  MdLogin,
  MdLock,
  MdInfo,
  MdUpdate,
} from "react-icons/md";
import api from "../../services/api";
import RiderLayout from "../../layouts/RiderLayout";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const operationalOptions = [
  {
    label: "Buka",
    riderStatus: "Berjualan",
    riderLegacyStatus: "Active",
    locationStatus: "Aktif",
  },
  {
    label: "Istirahat",
    riderStatus: "Istirahat",
    riderLegacyStatus: "Break",
    locationStatus: "Istirahat",
  },
  {
    label: "Tutup",
    riderStatus: "Tutup",
    riderLegacyStatus: "Inactive",
    locationStatus: "Tutup",
  },
  {
    label: "Pindah",
    riderStatus: "Pindah",
    riderLegacyStatus: "Inactive",
    locationStatus: "Pindah",
  },
  {
    label: "Tidak Beroperasi",
    riderStatus: "Tidak Beroperasi",
    riderLegacyStatus: "Inactive",
    locationStatus: "Tidak Beroperasi",
  },
];

export default function RiderDashboard() {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentRiderId, setCurrentRiderId] = useState(() => {
    const session = localStorage.getItem("saka_rider_session");

    if (!session) return "";

    try {
      const parsedSession = JSON.parse(session);

      // Validate both isLoggedIn flag AND token existence
      if (!parsedSession.isLoggedIn || !parsedSession.token) {
        localStorage.removeItem("saka_rider_session");
        localStorage.removeItem("saka_current_rider_id");
        return "";
      }

      return String(parsedSession.id || "");
    } catch (error) {
      localStorage.removeItem("saka_rider_session");
      localStorage.removeItem("saka_current_rider_id");
      return "";
    }
  });



  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  const showNotice = (type, text) => {
    setNotice({ type, text });

    setTimeout(() => {
      setNotice({ type: "", text: "" });
    }, 3500);
  };

  const getErrorMessage = (error, fallback) => {
    const message = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;

    if (message) return message;

    if (errors) {
      const firstError = Object.values(errors)[0];

      if (Array.isArray(firstError)) {
        return firstError[0];
      }
    }

    return fallback;
  };

  const toArray = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const formatTime = (value) => {
    if (!value) return "";

    const text = String(value);

    if (text.includes("T")) {
      return text.split("T")[1]?.slice(0, 5) || "";
    }

    if (text.includes(" ")) {
      return text.split(" ")[1]?.slice(0, 5) || "";
    }

    return text.slice(0, 5);
  };

  const getDatePart = (value) => {
    if (!value) return "";

    const text = String(value);

    if (text.includes("T")) return text.split("T")[0];
    if (text.includes(" ")) return text.split(" ")[0]?.slice(0, 10) || "";

    return text.length >= 10 ? text.slice(0, 10) : "";
  };

  const formatDisplayDate = (value) => {
    if (!value) return "-";

    const dateStr = getDatePart(value);

    if (!dateStr) return "-";

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeLocationFromApi = (item) => ({
    id: item.id,
    branch: item.branch || "",
    vehicle: item.vehicle || "Sepeda",
    openTime: formatTime(item.open_time),
    closeTime: formatTime(item.close_time),
    status: item.status || "Tidak Beroperasi",
    address: item.address || "",
    mapsLink: item.maps_link || "",
    note: item.note || "",
  });

  const normalizeRiderFromApi = (item, outletList = []) => {
    const outletId = item.outlet_id || item.outlet?.id || "";
    const outlet =
      item.outlet || outletList.find((location) => location.id === outletId);

    return {
      id: item.id,
      name: item.name || "",
      phone: item.phone || "",
      username: item.username || "",
      accountStatus: item.account_status || "Aktif",
      operationalStatus: item.operational_status || "Tidak Beroperasi",
      status:
        item.operational_status === "Berjualan"
          ? "Active"
          : item.operational_status === "Istirahat"
            ? "Break"
            : "Inactive",
      stand: outlet?.branch || item.stand || item.location || "",
      location: outlet?.branch || item.stand || item.location || "",
      outletId,
      note: item.note || "",
    };
  };

  const normalizeStockFromApi = (item, outletList = [], riderList = []) => {
    const outletId = item.outlet_id || item.outlet?.id || item.outletId || "";
    const riderId = item.rider_id || item.rider?.id || item.riderId || "";

    const outlet =
      item.outlet || outletList.find((location) => location.id === outletId);
    const rider = item.rider || riderList.find((data) => data.id === riderId);
    const menu = item.menu || {};

    return {
      id: item.id,
      outletId,
      riderId,
      menuId: item.menu_id || item.menu?.id || item.menuId || "",
      branch:
        item.branch ||
        item.outlet_branch ||
        item.outletBranch ||
        outlet?.branch ||
        "",
      outletType:
        item.outlet_type ||
        item.outletType ||
        outlet?.vehicle ||
        "",
      riderName:
        item.rider_name ||
        item.riderName ||
        rider?.name ||
        "",
      productName:
        item.product_name ||
        item.productName ||
        menu?.name ||
        "",
      category: menu?.category || "",
      stockStatus: item.stock_status || item.stockStatus || "Tersedia",
      updatedAtRaw:
        item.updated_time ||
        item.input_time ||
        item.updatedAt ||
        item.updated_at ||
        "",
      updatedAt: formatTime(
        item.updated_time ||
          item.input_time ||
          item.updatedAt ||
          item.updated_at
      ),
      updatedBy: item.updated_by || item.updatedBy || "",
      note: item.note || "",
    };
  };

  const doAutoLogout = (message) => {
    localStorage.removeItem("saka_current_rider_id");
    localStorage.removeItem("saka_rider_session");
    setCurrentRiderId("");
    setRiders([]);
    setLocations([]);
    setInventory([]);
    navigate("/rider/login");
  };

  const fetchDashboardData = async () => {
    // Check token before making authenticated calls
    const session = localStorage.getItem("saka_rider_session");
    let hasToken = false;
    try {
      const parsed = JSON.parse(session || "{}");
      hasToken = !!parsed.token;
    } catch {
      // invalid JSON
    }

    if (!hasToken) {
      doAutoLogout("Sesi tidak valid. Silakan login kembali.");
      return;
    }

    try {
      setLoading(true);

      // Fetch public data first (doesn't require auth)
      const outletResponse = await api.get("/public/outlets");
      const outletData = toArray(outletResponse).map(normalizeLocationFromApi);

      // Fetch authenticated data sequentially so we can stop on 401
      // instead of firing both requests and getting duplicate errors
      const riderResponse = await api.get("/rider/profile");
      const riderRaw = riderResponse.data?.rider || riderResponse.data?.data || riderResponse.data;
      const riderData = riderRaw ? [normalizeRiderFromApi(riderRaw, outletData)] : [];

      const stockResponse = await api.get("/rider/stocks");
      const stockData = toArray(stockResponse).map((item) =>
        normalizeStockFromApi(item, outletData, riderData)
      );

      setLocations(outletData);
      setRiders(riderData);
      setInventory(stockData);
    } catch (error) {
      // If token is expired/invalid (401) or forbidden (403), auto-logout
      // so the rider sees the login form instead of being stuck on loading
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        doAutoLogout("Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      showNotice(
        "error",
        getErrorMessage(error, "Gagal mengambil data rider dari backend.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRiderId) {
      fetchDashboardData();
    }
  }, [currentRiderId]);

  const currentRider = useMemo(() => {
    return riders.find((rider) => String(rider.id) === String(currentRiderId));
  }, [riders, currentRiderId]);

  useEffect(() => {
    if (!currentRiderId || loading) return;

    if (riders.length === 0) return;

    const riderStillExists = riders.some(
      (rider) => String(rider.id) === String(currentRiderId)
    );

    if (!riderStillExists) {
      localStorage.removeItem("saka_current_rider_id");
      localStorage.removeItem("saka_rider_session");
      setCurrentRiderId("");
    }
  }, [riders, currentRiderId, loading]);

  const selectedLocation = useMemo(() => {
    if (!currentRider) return null;

    return locations.find(
      (location) =>
        String(location.id) === String(currentRider.outletId) ||
        location.branch === currentRider.stand ||
        location.branch === currentRider.location
    );
  }, [locations, currentRider]);

  const riderInventory = useMemo(() => {
    if (!currentRider) return [];

    return inventory.filter((item) => {
      // Hide Literan products
      const isLiteran =
        item.category === "Literan" ||
        (item.productName || "").toLowerCase().includes("literan");
      if (isLiteran) return false;

      const sameRiderId =
        String(item.riderId || "") === String(currentRider.id || "");

      const sameRiderName =
        item.riderName === currentRider.name ||
        item.rider === currentRider.name;

      const sameStandWithoutRider =
        !item.riderName &&
        (item.branch === currentRider.stand ||
          item.branch === currentRider.location);

      return sameRiderId || sameRiderName || sameStandWithoutRider;
    });
  }, [inventory, currentRider]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedInventory,
  } = usePagination(riderInventory, 3);

  const totalProduct = riderInventory.length;
  const totalAvailable = riderInventory.filter(
    (item) => item.stockStatus === "Tersedia"
  ).length;
  const totalUnavailable = riderInventory.filter(
    (item) => item.stockStatus !== "Tersedia"
  ).length;
  const today = new Date().toISOString().slice(0, 10);
  const totalUpdatedToday = riderInventory.filter(
    (item) => getDatePart(item.updatedAtRaw) === today
  ).length;

  const formatStatusLabel = (status) => {
    if (status === "Berjualan") return "Buka";
    return status || "Tidak Beroperasi";
  };

  const getOperationalColor = (status) => {
    if (status === "Berjualan") return "bg-emerald-500/20 text-emerald-300";
    if (status === "Istirahat") return "bg-yellow-500/20 text-yellow-300";
    if (status === "Tutup") return "bg-red-500/20 text-red-300";
    if (status === "Pindah") return "bg-blue-500/20 text-blue-300";
    return "bg-slate-500/20 text-slate-300";
  };

  const getStockColor = (status) => {
    if (status === "Tersedia") return "bg-emerald-500/20 text-emerald-300";
    return "bg-red-500/20 text-red-300";
  };

  const getStockBadgeLabel = (status) => {
    if (status === "Tersedia") return "🟢 Tersedia";
    return "🔴 Tidak Tersedia";
  };

  const getProductNote = (item) => {
    const productName = (item.productName || "").toLowerCase();

    if (productName.includes("literan")) {
      return "Produk literan hanya tersedia di outlet utama.";
    }

    if (productName.includes("donat")) {
      return "Donat saat ini tersedia di Cabang Stadion Nagasakti, Cabang Rumbai, dan Cabang Hang Tuah Ujung. Ketersediaan dapat berubah mengikuti kebijakan outlet.";
    }

    return "";
  };

  const handleLogout = async () => {
    try {
      await api.post("/rider/logout");
    } catch {
      // Token may already be expired, proceed with local cleanup
    }
    localStorage.removeItem("saka_current_rider_id");
    localStorage.removeItem("saka_rider_session");
    setCurrentRiderId("");
    setRiders([]);
    setLocations([]);
    setInventory([]);
    setNotice({ type: "", text: "" });
    navigate("/rider/login");
  };

  const handleOperationalChange = async (e) => {
    if (!currentRider) return;

    const selected = operationalOptions.find(
      (option) => option.riderStatus === e.target.value
    );

    if (!selected) return;

    try {
      await api.patch("/rider/status", {
        operational_status: selected.riderStatus,
      });

      setRiders((prev) =>
        prev.map((rider) =>
          String(rider.id) === String(currentRider.id)
            ? {
                ...rider,
                operationalStatus: selected.riderStatus,
                status: selected.riderLegacyStatus,
              }
            : rider
        )
      );

      setLocations((prev) =>
        prev.map((location) =>
          String(location.id) === String(selectedLocation?.id)
            ? {
                ...location,
                status: selected.locationStatus,
              }
            : location
        )
      );

      showNotice("success", "Status operasional berhasil diperbarui.");
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        doAutoLogout("Sesi telah berakhir. Silakan login kembali.");
        return;
      }
      showNotice(
        "error",
        getErrorMessage(error, "Gagal memperbarui status operasional.")
      );
    }
  };

  const handleToggleStockStatus = async (item) => {
    if (!currentRider) return;

    const newStatus = item.stockStatus === "Tersedia" ? "Tidak Tersedia" : "Tersedia";
    const payload = {
      stock_status: newStatus,
    };

    const now = getCurrentTime();

    try {
      await api.patch(`/rider/stocks/${item.id}/availability`, payload);

      const updatedAtRaw = new Date().toISOString();

      setInventory((prev) =>
        prev.map((data) =>
          data.id === item.id
            ? {
                ...data,
                stockStatus: newStatus,
                updatedAt: now,
                updatedAtRaw,
                updatedBy: currentRider.name,
              }
            : data
        )
      );

      showNotice("success", `Status ${item.productName} berhasil diubah menjadi ${newStatus}.`);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        doAutoLogout("Sesi telah berakhir. Silakan login kembali.");
        return;
      }
      showNotice(
        "error",
        getErrorMessage(error, "Gagal memperbarui status ketersediaan.")
      );
    }
  };

  if (!currentRiderId) {
    return <Navigate to="/rider/login" replace />;
  }

  if (!currentRider) {
    return (
      <div className="saka-bubble-bg min-h-screen overflow-x-hidden text-white">
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 h-4 saka-checker-strip" />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-full rounded-3xl bg-white/5 px-6 py-8 text-center">
            <MdWarningAmber className="mx-auto text-5xl text-yellow-300" />
            <h3 className="mt-4 text-xl font-black">Memuat Dashboard</h3>
            <p className="mt-2 text-sm text-slate-300">
              Sedang mengambil data rider...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RiderLayout
      rider={currentRider}
      selectedLocation={selectedLocation}
      operationalStatus={currentRider?.operationalStatus}
      formatStatusLabel={formatStatusLabel}
      getOperationalColor={getOperationalColor}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl p-3 text-white sm:p-4 md:p-6 lg:p-8">
        <div className="mb-6 hidden lg:block">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
            Rider Panel
          </p>
          <h2 className="mt-2 text-3xl font-black">Dashboard Rider</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Halaman ini digunakan rider untuk memperbarui status operasional dan stok
            produk sesuai kondisi langsung di lapangan.
          </p>
        </div>

        {notice.text && (
          <div
            className={`mb-6 max-w-full rounded-2xl px-4 py-3 text-sm font-bold sm:px-5 sm:py-4 ${
              notice.type === "success"
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-red-500/20 text-red-200"
            }`}
          >
            {notice.text}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <div className="saka-card bg-white rounded-3xl p-4 sm:p-5 md:p-6 text-[#06251c] flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#e6ddd0] text-[#06251c]">
                <MdInventory className="text-xl sm:text-2xl" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-[#06251c]">
                Semua
              </span>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">
                Total Produk
              </p>
              <h3 className="mt-1 sm:mt-2 text-3xl font-black sm:text-4xl">
                {totalProduct < 10 && totalProduct > 0 ? `0${totalProduct}` : totalProduct === 0 ? "00" : totalProduct}
              </h3>
            </div>
          </div>

          <div className="saka-card bg-white rounded-3xl p-4 sm:p-5 md:p-6 text-[#06251c] flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#dff4ea] text-emerald-600">
                <MdCheckCircle className="text-xl sm:text-2xl" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600">
                Aman
              </span>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">
                Tersedia
              </p>
              <h3 className="mt-1 sm:mt-2 text-3xl font-black sm:text-4xl text-emerald-700">
                {totalAvailable < 10 && totalAvailable > 0 ? `0${totalAvailable}` : totalAvailable === 0 ? "00" : totalAvailable}
              </h3>
            </div>
          </div>

          <div className="saka-card bg-white rounded-3xl p-4 sm:p-5 md:p-6 text-[#06251c] flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <MdWarningAmber className="text-xl sm:text-2xl" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-red-500">
                Habis
              </span>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">
                Tidak Tersedia
              </p>
              <h3 className="mt-1 sm:mt-2 text-3xl font-black sm:text-4xl text-red-600">
                {totalUnavailable < 10 && totalUnavailable > 0 ? `0${totalUnavailable}` : totalUnavailable === 0 ? "00" : totalUnavailable}
              </h3>
            </div>
          </div>

          <div className="saka-card bg-white rounded-3xl p-4 sm:p-5 md:p-6 text-[#06251c] flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <MdUpdate className="text-xl sm:text-2xl" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                Hari Ini
              </span>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">
                Update
              </p>
              <h3 className="mt-1 sm:mt-2 text-3xl font-black sm:text-4xl">
                {totalUpdatedToday < 10 && totalUpdatedToday > 0 ? `0${totalUpdatedToday}` : totalUpdatedToday === 0 ? "00" : totalUpdatedToday}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 md:gap-6 xl:grid-cols-3">
          <div className="saka-panel max-w-full bg-[#f7f0e6] p-4 text-[#06251c] sm:p-5 md:p-6 lg:p-7">
            <div className="mb-5 flex items-center gap-3 md:mb-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                <MdStorefront />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-black sm:text-xl">Status Operasional</h2>
                <p className="text-xs text-slate-500">Update kondisi stand saat ini.</p>
              </div>
            </div>

            <div className="rounded-3xl bg-[#06251c] p-4 text-white sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Status Sekarang
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${getOperationalColor(
                    currentRider.operationalStatus
                  )}`}
                >
                  {formatStatusLabel(currentRider.operationalStatus)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Ubah Status
                </label>

                <select
                  value={currentRider.operationalStatus || "Tidak Beroperasi"}
                  onChange={handleOperationalChange}
                  className="min-h-[44px] w-full max-w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all duration-300 focus:border-[#06251c]"
                >
                  {operationalOptions.map((option) => (
                    <option key={option.riderStatus} value={option.riderStatus}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#06251c]/10 p-4">
              <p className="text-xs font-bold leading-6 text-slate-600">
                Rider hanya mengubah status operasional, bukan mengubah lokasi stand.
                Lokasi tetap diatur oleh admin.
              </p>
            </div>
          </div>

          <div className="saka-panel max-w-full bg-[#103c2e] p-4 sm:p-5 md:p-6 lg:p-7 xl:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                  Update Ketersediaan
                </p>
                <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
                  Status Produk Rider
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Kelola ketersediaan produk outlet Anda. Ketuk tombol untuk mengubah
                  status produk.
                </p>
              </div>

              <div className="shrink-0 rounded-3xl bg-white/10 px-4 py-3 sm:px-5 sm:py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Tersedia
                </p>
                <p className="mt-1 text-2xl font-black text-white">{totalAvailable}</p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white/5 p-6 text-center sm:p-8">
                <MdWarningAmber className="mx-auto text-5xl text-yellow-300" />
                <h3 className="mt-4 text-xl font-black text-white">Mengambil Data</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-300">
                  Data rider sedang diambil dari backend.
                </p>
              </div>
            ) : riderInventory.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-6 text-center sm:p-8">
                <MdWarningAmber className="mx-auto text-5xl text-yellow-300" />
                <h3 className="mt-4 text-xl font-black text-white">Belum Ada Produk</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-300">
                  Admin belum menetapkan produk untuk rider/outlet ini. Silakan hubungi
                  admin untuk menambahkan produk.
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {paginatedInventory.map((item) => {
                  const stockStatus = item.stockStatus;
                  const productNote = getProductNote(item);

                  return (
                    <div
                      key={item.id}
                      className="max-w-full rounded-3xl bg-white/5 p-4 transition-all duration-300 hover:bg-white/10 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                              <MdLocalCafe />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="break-words text-base font-black text-white sm:text-lg">
                                {item.productName || "Produk"}
                              </h3>
                              <p className="mt-1 text-xs text-slate-400">
                                {item.branch || currentRider.stand}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">Status:</span>
                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${getStockColor(
                                  stockStatus
                                )}`}
                              >
                                {getStockBadgeLabel(stockStatus)}
                              </span>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-slate-400">
                              <MdAccessTime className="mt-0.5 shrink-0" />
                              <span>
                                Terakhir Update:{" "}
                                {formatDisplayDate(item.updatedAtRaw)}
                                {item.updatedAt ? ` · ${item.updatedAt}` : ""}
                                {item.updatedBy ? ` oleh ${item.updatedBy}` : ""}
                              </span>
                            </div>
                          </div>

                          {productNote && (
                            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-blue-500/15 p-3 text-xs font-bold leading-6 text-blue-200 sm:p-4">
                              <MdInfo className="mt-1 shrink-0" />
                              <span>{productNote}</span>
                            </div>
                          )}

                          <div className="mt-4 hidden rounded-2xl bg-white/5 p-4 md:block">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                              Catatan Admin
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {item.note && item.note !== "-"
                                ? item.note
                                : "Tidak ada catatan dari admin."}
                            </p>
                          </div>
                        </div>

                        <div className="w-full max-w-full shrink-0 lg:w-72">
                          <div className="rounded-3xl bg-[#f7f0e6] p-4 text-[#06251c] sm:p-5">
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                              Ubah Ketersediaan
                            </label>

                            <div className="mt-2 text-sm font-bold md:hidden">
                              {getStockBadgeLabel(stockStatus)}
                            </div>

                            <div className="mt-2 hidden text-sm font-bold md:block">
                              Status saat ini:{" "}
                              <span
                                className={
                                  stockStatus === "Tersedia"
                                    ? "text-emerald-700"
                                    : "text-red-600"
                                }
                              >
                                {stockStatus}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleStockStatus(item)}
                              className={`mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black text-white transition-all duration-300 ${
                                stockStatus === "Tersedia"
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              {stockStatus === "Tersedia"
                                ? "❌ Tidak Tersedia"
                                : "✅ Tersedia"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {riderInventory.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  variant="dark"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </RiderLayout>
  );
}