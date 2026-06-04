import { useEffect, useMemo, useState } from "react";
import {
  MdAccessTime,
  MdCheckCircle,
  MdInventory,
  MdLocalCafe,
  MdLocationOn,
  MdPerson,
  MdSave,
  MdStorefront,
  MdWarningAmber,
  MdLogin,
  MdLock,
  MdLogout,
  MdInfo,
} from "react-icons/md";

const defaultLocations = [
  {
    id: 1,
    branch: "Cabang Arifin Ahmad",
    vehicle: "Bajaj",
    openTime: "10:00",
    closeTime: "18:00",
    status: "Aktif",
  },
  {
    id: 2,
    branch: "Cabang Rumbai",
    vehicle: "Tenda",
    openTime: "10:00",
    closeTime: "18:00",
    status: "Aktif",
  },
];

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
  const [riders, setRiders] = useState(() => {
    const saved = localStorage.getItem("saka_riders");

    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);

      const oldDefaultNames = ["Aris Setiawan", "Budi Kusuma"];

      const isOldDefaultData =
        parsed.length <= 2 &&
        parsed.every((rider) => oldDefaultNames.includes(rider.name));

      if (isOldDefaultData) {
        localStorage.removeItem("saka_riders");
        localStorage.removeItem("saka_current_rider_id");
        localStorage.removeItem("saka_rider_session");
        return [];
      }

      return parsed;
    } catch (error) {
      localStorage.removeItem("saka_riders");
      localStorage.removeItem("saka_current_rider_id");
      localStorage.removeItem("saka_rider_session");
      return [];
    }
  });

  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem("saka_locations");

    if (!saved) return defaultLocations;

    try {
      return JSON.parse(saved);
    } catch (error) {
      localStorage.removeItem("saka_locations");
      return defaultLocations;
    }
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("saka_inventory");

    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch (error) {
      localStorage.removeItem("saka_inventory");
      return [];
    }
  });

  const [currentRiderId, setCurrentRiderId] = useState(() => {
    const session = localStorage.getItem("saka_rider_session");

    if (!session) {
      localStorage.removeItem("saka_current_rider_id");
      return "";
    }

    try {
      const parsedSession = JSON.parse(session);

      if (!parsedSession.isLoggedIn) {
        localStorage.removeItem("saka_current_rider_id");
        localStorage.removeItem("saka_rider_session");
        return "";
      }

      return String(parsedSession.id || "");
    } catch (error) {
      localStorage.removeItem("saka_current_rider_id");
      localStorage.removeItem("saka_rider_session");
      return "";
    }
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [stockInput, setStockInput] = useState({});

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

  const currentRider = useMemo(() => {
    return riders.find((rider) => String(rider.id) === String(currentRiderId));
  }, [riders, currentRiderId]);

  useEffect(() => {
    localStorage.setItem("saka_riders", JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem("saka_locations", JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem("saka_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    if (!currentRiderId) return;

    const riderStillExists = riders.some(
      (rider) => String(rider.id) === String(currentRiderId)
    );

    if (!riderStillExists) {
      setCurrentRiderId("");
      localStorage.removeItem("saka_current_rider_id");
      localStorage.removeItem("saka_rider_session");
    }
  }, [riders, currentRiderId]);

  const selectedLocation = useMemo(() => {
    if (!currentRider) return null;

    return locations.find(
      (location) =>
        location.branch === currentRider.stand ||
        location.branch === currentRider.location
    );
  }, [locations, currentRider]);

  const riderInventory = useMemo(() => {
    if (!currentRider) return [];

    return inventory.filter((item) => {
      const sameRider =
        item.riderName === currentRider.name ||
        item.rider === currentRider.name ||
        String(item.riderId || "") === String(currentRider.id);

      const sameStandWithoutRider =
        !item.riderName &&
        (item.branch === currentRider.stand ||
          item.branch === currentRider.location);

      return sameRider || sameStandWithoutRider;
    });
  }, [inventory, currentRider]);

  const totalProduct = riderInventory.length;

  const totalInitialStock = riderInventory.reduce(
    (total, item) => total + Number(item.initialStock || 0),
    0
  );

  const totalRemainingStock = riderInventory.reduce((total, item) => {
    const remaining =
      item.remainingStock === undefined || item.remainingStock === ""
        ? Number(item.initialStock || 0)
        : Number(item.remainingStock || 0);

    return total + remaining;
  }, 0);

  const totalSoldStock = totalInitialStock - totalRemainingStock;

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

  const getStockStatus = (item) => {
    const initial = Number(item.initialStock || 0);
    const remaining =
      item.remainingStock === undefined || item.remainingStock === ""
        ? initial
        : Number(item.remainingStock || 0);

    if (remaining <= 0) return "Habis";

    const percentage = initial > 0 ? (remaining / initial) * 100 : 100;

    if (percentage <= 20) return "Hampir Habis";
    return "Tersedia";
  };

  const getStockColor = (status) => {
    if (status === "Tersedia") return "bg-emerald-500/20 text-emerald-300";
    if (status === "Hampir Habis") return "bg-yellow-500/20 text-yellow-300";
    return "bg-red-500/20 text-red-300";
  };

  const getCurrentRemaining = (item) => {
    if (item.remainingStock === undefined || item.remainingStock === "") {
      return Number(item.initialStock || 0);
    }

    return Number(item.remainingStock || 0);
  };

  const getProductNote = (item) => {
    const productName = (item.productName || "").toLowerCase();

    if (productName.includes("literan")) {
      return "Produk literan hanya tersedia di outlet utama.";
    }

    if (productName.includes("donat")) {
      return "Donat saat ini tersedia di Cabang Stadion / Nagasakti, Cabang Rumbai, dan Cabang Hang Tuah Ujung. Ketersediaan dapat berubah mengikuti kebijakan outlet.";
    }

    return "";
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!loginForm.username || !loginForm.password) {
      showNotice("error", "Username dan password wajib diisi.");
      return;
    }

    if (riders.length === 0) {
      showNotice(
        "error",
        "Belum ada data rider. Tambahkan data rider dari halaman admin dulu."
      );
      return;
    }

    const foundRider = riders.find((rider) => {
      const riderUsername = (rider.username || "").toLowerCase().trim();
      const inputUsername = loginForm.username.toLowerCase().trim();

      return (
        riderUsername === inputUsername &&
        String(rider.password || "") === String(loginForm.password)
      );
    });

    if (!foundRider) {
      showNotice("error", "Username atau password rider salah.");
      return;
    }

    if (foundRider.accountStatus === "Nonaktif") {
      showNotice("error", "Akun rider ini sedang nonaktif.");
      return;
    }

    localStorage.setItem("saka_current_rider_id", foundRider.id);

    localStorage.setItem(
      "saka_rider_session",
      JSON.stringify({
        id: foundRider.id,
        name: foundRider.name,
        username: foundRider.username,
        isLoggedIn: true,
        loginAt: new Date().toISOString(),
      })
    );

    setCurrentRiderId(String(foundRider.id));
    setLoginForm({ username: "", password: "" });
    setNotice({ type: "", text: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("saka_current_rider_id");
    localStorage.removeItem("saka_rider_session");
    setCurrentRiderId("");
    setStockInput({});
    setNotice({ type: "", text: "" });
  };

  const handleOperationalChange = (e) => {
    if (!currentRider) return;

    const selected = operationalOptions.find(
      (option) => option.riderStatus === e.target.value
    );

    if (!selected) return;

    const updatedRiders = riders.map((rider) =>
      String(rider.id) === String(currentRider.id)
        ? {
            ...rider,
            operationalStatus: selected.riderStatus,
            status: selected.riderLegacyStatus,
          }
        : rider
    );

    const riderStand = currentRider.stand || currentRider.location;

    const updatedLocations = locations.map((location) =>
      location.branch === riderStand
        ? {
            ...location,
            status: selected.locationStatus,
          }
        : location
    );

    setRiders(updatedRiders);
    setLocations(updatedLocations);
    showNotice("success", "Status operasional berhasil diperbarui.");
  };

  const handleStockInputChange = (id, value) => {
    setStockInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleUpdateStock = (item) => {
    if (!currentRider) return;

    const inputValue = stockInput[item.id];

    if (inputValue === undefined || inputValue === "") {
      showNotice("error", "Isi stok sisa terlebih dahulu.");
      return;
    }

    const initialStock = Number(item.initialStock || 0);
    const newRemaining = Number(inputValue);

    if (newRemaining < 0) {
      showNotice("error", "Stok sisa tidak boleh kurang dari 0.");
      return;
    }

    if (newRemaining > initialStock) {
      showNotice("error", "Stok sisa tidak boleh lebih besar dari stok awal.");
      return;
    }

    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedInventory = inventory.map((data) =>
      data.id === item.id
        ? {
            ...data,
            remainingStock: newRemaining,
            updatedAt: now,
            updatedBy: currentRider.name,
            stockStatus: newRemaining > 0 ? "Tersedia" : "Habis",
          }
        : data
    );

    setInventory(updatedInventory);

    setStockInput((prev) => ({
      ...prev,
      [item.id]: "",
    }));

    showNotice("success", "Stok berhasil diperbarui.");
  };

  return (
    <div className="saka-bubble-bg min-h-screen text-white">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 h-4 saka-checker-strip" />

      <div className="saka-bubble-content mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-4">
              <h1 className="text-4xl font-black tracking-[0.35em] text-white">
                SAKA<span className="text-emerald-400">.</span>
              </h1>

              <div className="mt-3 inline-block rounded-lg bg-black px-4 py-2">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-white">
                  On The Road
                </p>
              </div>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
              Rider Panel
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {currentRider ? "Dashboard Rider" : "Login Rider"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {currentRider
                ? "Halaman ini digunakan rider untuk memperbarui status operasional dan stok produk sesuai kondisi langsung di lapangan."
                : "Masuk menggunakan akun rider untuk mengakses dashboard stok dan status operasional."}
            </p>
          </div>

          {currentRider && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-full bg-[#f7f0e6] px-5 py-3 text-sm font-black text-[#06251c] transition hover:bg-white"
            >
              <MdLogout />
              Logout
            </button>
          )}
        </div>

        {!currentRider ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div className="saka-panel bg-[#103c2e] p-8">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                Akses Khusus Rider
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                Update stok dan status hanya melalui akun rider.
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                Setelah login, rider hanya bisa melihat data miliknya sendiri,
                termasuk stand tugas, stok produk, catatan admin, dan status
                operasional.
              </p>

              <div className="mt-6 rounded-3xl bg-white/5 p-5">
                <p className="text-sm font-black text-white">Catatan</p>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  Username dan password dibuat oleh admin pada halaman Data
                  Rider. Jika data rider belum muncul, pastikan admin dan rider
                  dibuka pada browser yang sama selama masih prototype.
                </p>
              </div>
            </div>

            <div className="saka-panel bg-[#f7f0e6] p-8 text-[#06251c] md:p-10">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06251c] text-xl text-white">
                  <MdLogin />
                </div>

                <div>
                  <h2 className="text-2xl font-black">Masuk Rider</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Gunakan username dan password dari admin.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Username
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <MdPerson className="text-xl text-slate-400" />
                    <input
                      type="text"
                      name="username"
                      value={loginForm.username}
                      onChange={handleLoginChange}
                      placeholder="Contoh: gizza"
                      className="w-full bg-transparent text-sm font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Password
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <MdLock className="text-xl text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder="Masukkan password"
                      className="w-full bg-transparent text-sm font-bold outline-none"
                    />
                  </div>
                </div>

                {notice.text && (
                  <div
                    className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-bold leading-6 ${
                      notice.type === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <MdWarningAmber className="mt-1 shrink-0" />
                    <span>{notice.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-4 text-sm font-black text-white transition hover:bg-[#103c2e]"
                >
                  <MdLogin />
                  Login Rider
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {notice.text && (
              <div
                className={`mb-6 rounded-2xl px-5 py-4 text-sm font-bold ${
                  notice.type === "success"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-red-500/20 text-red-200"
                }`}
              >
                {notice.text}
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="saka-card bg-[#f7f0e6] p-6 text-[#06251c]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                  <MdPerson />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                  Rider
                </p>
                <h3 className="mt-2 text-xl font-black">{currentRider.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {currentRider.phone || "No HP belum diisi"}
                </p>
              </div>

              <div className="saka-card bg-[#dff4ea] p-6 text-[#06251c]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                  <MdLocationOn />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                  Stand Tugas
                </p>
                <h3 className="mt-2 text-xl font-black">
                  {currentRider.stand ||
                    currentRider.location ||
                    "Belum ditentukan"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedLocation
                    ? `${selectedLocation.openTime || "-"} - ${
                        selectedLocation.closeTime || "-"
                      }`
                    : "Jam belum tersedia"}
                </p>
              </div>

              <div className="saka-card bg-white p-6 text-[#06251c]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                  <MdInventory />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                  Total Produk
                </p>
                <h3 className="mt-2 text-4xl font-black">{totalProduct}</h3>
              </div>

              <div className="saka-card bg-[#103c2e] p-6 text-white">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <MdCheckCircle />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                  Terjual
                </p>
                <h3 className="mt-2 text-4xl font-black">{totalSoldStock}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="saka-panel bg-[#f7f0e6] p-7 text-[#06251c]">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                    <MdStorefront />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">Status Operasional</h2>
                    <p className="text-xs text-slate-500">
                      Update kondisi stand saat ini.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-[#06251c] p-5 text-white">
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

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Ubah Status
                  </label>

                  <select
                    value={currentRider.operationalStatus || "Tidak Beroperasi"}
                    onChange={handleOperationalChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#06251c]"
                  >
                    {operationalOptions.map((option) => (
                      <option key={option.riderStatus} value={option.riderStatus}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 rounded-2xl bg-[#06251c]/10 p-4">
                  <p className="text-xs font-bold leading-6 text-slate-600">
                    Rider hanya mengubah status operasional, bukan mengubah
                    lokasi stand. Lokasi tetap diatur oleh admin.
                  </p>
                </div>
              </div>

              <div className="saka-panel bg-[#103c2e] p-7 xl:col-span-2">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                      Update Stok
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white">
                      Stok Produk Rider
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      Admin input stok awal. Rider mengisi stok sisa sesuai
                      kondisi di lapangan.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/10 px-5 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Sisa Stok
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {totalRemainingStock}
                    </p>
                  </div>
                </div>

                {riderInventory.length === 0 ? (
                  <div className="rounded-3xl bg-white/5 p-8 text-center">
                    <MdWarningAmber className="mx-auto text-5xl text-yellow-300" />
                    <h3 className="mt-4 text-xl font-black text-white">
                      Belum Ada Stok
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-300">
                      Admin belum menambahkan stok untuk rider ini. Tambahkan
                      data stok dari halaman Monitoring Stok admin terlebih dahulu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {riderInventory.map((item) => {
                      const currentRemaining = getCurrentRemaining(item);
                      const sold =
                        Number(item.initialStock || 0) - currentRemaining;
                      const stockStatus = getStockStatus(item);
                      const productNote = getProductNote(item);

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl bg-white/5 p-5 transition hover:bg-white/10"
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                                  <MdLocalCafe />
                                </div>

                                <div>
                                  <h3 className="text-lg font-black text-white">
                                    {item.productName || "Produk"}
                                  </h3>
                                  <p className="mt-1 text-xs text-slate-400">
                                    {item.branch || currentRider.stand}
                                  </p>
                                </div>

                                <span
                                  className={`ml-0 rounded-full px-4 py-1 text-xs font-black lg:ml-3 ${getStockColor(
                                    stockStatus
                                  )}`}
                                >
                                  {stockStatus}
                                </span>
                              </div>

                              {productNote && (
                                <div className="mt-4 flex items-start gap-2 rounded-2xl bg-blue-500/15 p-4 text-xs font-bold leading-6 text-blue-200">
                                  <MdInfo className="mt-1 shrink-0" />
                                  <span>{productNote}</span>
                                </div>
                              )}

                              <div className="mt-5 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl bg-white/10 p-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                    Awal
                                  </p>
                                  <p className="mt-2 text-2xl font-black text-white">
                                    {item.initialStock || 0}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-white/10 p-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                    Sisa
                                  </p>
                                  <p className="mt-2 text-2xl font-black text-white">
                                    {currentRemaining}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-white/10 p-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                    Terjual
                                  </p>
                                  <p className="mt-2 text-2xl font-black text-white">
                                    {sold < 0 ? 0 : sold}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 rounded-2xl bg-white/5 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                  Catatan Admin
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {item.note && item.note !== "-"
                                    ? item.note
                                    : "Tidak ada catatan dari admin."}
                                </p>
                              </div>

                              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                <MdAccessTime />
                                <span>
                                  Update terakhir: {item.updatedAt || "-"}
                                  {item.updatedBy
                                    ? ` oleh ${item.updatedBy}`
                                    : ""}
                                </span>
                              </div>
                            </div>

                            <div className="w-full rounded-3xl bg-[#f7f0e6] p-5 text-[#06251c] lg:w-72">
                              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                Input Stok Sisa
                              </label>

                              <input
                                type="number"
                                min="0"
                                max={item.initialStock || 0}
                                value={stockInput[item.id] || ""}
                                onChange={(e) =>
                                  handleStockInputChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                placeholder={`Saat ini: ${currentRemaining}`}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                              />

                              <button
                                type="button"
                                onClick={() => handleUpdateStock(item)}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-3 text-sm font-black text-white transition hover:bg-[#103c2e]"
                              >
                                <MdSave />
                                Simpan Stok
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}