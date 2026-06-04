import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdInventory,
  MdSearch,
  MdWarningAmber,
  MdTrendingUp,
} from "react-icons/md";

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
  {
    id: 3,
    branch: "Cabang Rumbai",
    outletType: "Tenda",
    riderName: "Aris Setiawan",
    productName: "Donat",
    maxCapacity: 650,
    initialStock: 120,
    remainingStock: 120,
    updatedAt: "09:00",
    note: "Donat tersedia di Rumbai.",
  },
];

const defaultBranches = [
  { branch: "Cabang Cut Nyak Dien", outletType: "Sepeda" },
  { branch: "Cabang Patimura", outletType: "Sepeda" },
  { branch: "Cabang Rajawali", outletType: "Sepeda" },
  { branch: "Cabang Riau", outletType: "Sepeda" },
  { branch: "Cabang Kharudin Nasution / Simpang", outletType: "Sepeda" },
  { branch: "Cabang Arifin Ahmad", outletType: "Bajaj" },
  { branch: "Cabang Rumbai", outletType: "Tenda" },
  { branch: "Cabang Stadion / Nagasakti", outletType: "Bajaj" },
  { branch: "Cabang Tuanku Tambusai / Nangka", outletType: "Sepeda" },
  { branch: "Cabang Nangka Ujung", outletType: "Sepeda" },
  { branch: "Cabang Hang Tuah Ujung", outletType: "Bajaj" },
  { branch: "Cabang Parit Indah", outletType: "Sepeda" },
  { branch: "Cabang HR. Soebrantas / Panam", outletType: "Bajaj" },
  { branch: "Cabang Soekarno Hatta", outletType: "Sepeda" },
  { branch: "Cabang Hangtuah", outletType: "Sepeda" },
  { branch: "Bajaj Dipo Malam", outletType: "Bajaj" },
  { branch: "Outlet Saka", outletType: "Outlet" },
];

const baseProducts = [
  "Kopi Susu Aren",
  "Es Kopi Susu",
  "Coklat Susu Aren",
  "Pinky Milky",
  "Creamy Butterscotch",
  "Donat",
  "Literan",
];

const donutBranches = [
  "Cabang Stadion / Nagasakti",
  "Cabang Rumbai",
  "Cabang Hang Tuah Ujung",
];

export default function MonitoringStok() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("saka_inventory");

    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);

      const isOldData = parsed.some(
        (item) =>
          !item.branch ||
          !item.outletType ||
          !item.riderName ||
          !item.productName ||
          item.initialStock === undefined ||
          item.remainingStock === undefined
      );

      if (isOldData) {
        localStorage.removeItem("saka_inventory");
        return [];
      }

      return parsed;
    } catch (error) {
      localStorage.removeItem("saka_inventory");
      return [];
    }
  });

  const [riders] = useState(() => {
    const saved = localStorage.getItem("saka_riders");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const [menus] = useState(() => {
    const saved = localStorage.getItem("saka_menus");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const [locations] = useState(() => {
    const saved = localStorage.getItem("saka_locations");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const [form, setForm] = useState({
    branch: "",
    outletType: "",
    riderName: "",
    productName: "",
    maxCapacity: "",
    initialStock: "",
    updatedAt: "",
    note: "",
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    localStorage.setItem("saka_inventory", JSON.stringify(inventory));
  }, [inventory]);

  const showNotice = (type, text) => {
    setNotice({ type, text });

    setTimeout(() => {
      setNotice({ type: "", text: "" });
    }, 3500);
  };

  const branchOptions = useMemo(() => {
    if (locations.length > 0) {
      return locations.map((item) => ({
        branch: item.branch,
        outletType: item.vehicle || item.outletType || "Sepeda",
      }));
    }

    return defaultBranches;
  }, [locations]);

  const productOptions = useMemo(() => {
    const menuNames = menus.map((menu) => menu.name).filter(Boolean);
    return [...new Set([...menuNames, ...baseProducts])];
  }, [menus]);

  const getCapacityByBranch = (branch = "", outletType = "") => {
    const lowerBranch = branch.toLowerCase();

    if (outletType === "Sepeda") return 250;
    if (outletType === "Tenda") return 650;
    if (outletType === "Outlet") return 9999;

    if (outletType === "Bajaj") {
      if (lowerBranch.includes("arifin")) return 600;
      if (lowerBranch.includes("hang tuah ujung")) return 400;
      if (lowerBranch.includes("panam") || lowerBranch.includes("soebrantas")) {
        return 700;
      }

      return 500;
    }

    return "";
  };

  const getSoldStock = (item) => {
    const initial = Number(item.initialStock || 0);
    const remaining = Number(item.remainingStock || 0);
    const sold = initial - remaining;

    return sold < 0 ? 0 : sold;
  };

  const getSalesPercentage = (item) => {
    const initial = Number(item.initialStock || 0);
    const sold = getSoldStock(item);

    if (initial === 0) return 0;

    return Math.round((sold / initial) * 100);
  };

  const getStatus = (item) => {
    const initial = Number(item.initialStock || 0);
    const remaining = Number(item.remainingStock || 0);
    const percentage = getSalesPercentage(item);

    if (initial === 0) return "Belum Ada Stok";
    if (remaining === 0) return "Habis";
    if (percentage >= 80) return "Cepat Habis";
    if (percentage >= 40) return "Normal";
    return "Belum Banyak Laku";
  };

  const statusClass = (status) => {
    if (status === "Habis") return "bg-red-500/25 text-red-300";
    if (status === "Cepat Habis") return "bg-orange-500/25 text-orange-300";
    if (status === "Normal") return "bg-green-500/25 text-green-300";
    if (status === "Belum Banyak Laku") {
      return "bg-yellow-500/25 text-yellow-300";
    }

    return "bg-slate-500/25 text-slate-300";
  };

  const filteredInventory = inventory.filter((item) => {
    const keyword = search.toLowerCase();
    const status = getStatus(item).toLowerCase();

    return (
      (item.branch || "").toLowerCase().includes(keyword) ||
      (item.outletType || "").toLowerCase().includes(keyword) ||
      (item.riderName || "").toLowerCase().includes(keyword) ||
      (item.productName || "").toLowerCase().includes(keyword) ||
      (item.note || "").toLowerCase().includes(keyword) ||
      status.includes(keyword)
    );
  });

  const totalData = inventory.length;

  const totalSold = inventory.reduce(
    (total, item) => total + getSoldStock(item),
    0
  );

  const fastSold = inventory.filter(
    (item) => getStatus(item) === "Cepat Habis" || getStatus(item) === "Habis"
  ).length;

  const slowSold = inventory.filter(
    (item) => getStatus(item) === "Belum Banyak Laku"
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "branch") {
      const selectedBranch = branchOptions.find((item) => item.branch === value);
      const outletType = selectedBranch?.outletType || "";
      const maxCapacity = getCapacityByBranch(value, outletType);

      setForm((prev) => ({
        ...prev,
        branch: value,
        outletType,
        maxCapacity,
      }));

      return;
    }

    if (name === "outletType") {
      const maxCapacity = getCapacityByBranch(form.branch, value);

      setForm((prev) => ({
        ...prev,
        outletType: value,
        maxCapacity,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      branch: "",
      outletType: "",
      riderName: "",
      productName: "",
      maxCapacity: "",
      initialStock: "",
      updatedAt: "",
      note: "",
    });

    setEditId(null);
  };

  const validateInventory = () => {
    if (
      !form.branch ||
      !form.outletType ||
      !form.riderName ||
      !form.productName ||
      form.initialStock === ""
    ) {
      showNotice(
        "error",
        "Lengkapi cabang, jenis outlet, rider, produk, dan stok awal dulu."
      );
      return false;
    }

    if (form.maxCapacity === "" || Number(form.maxCapacity) <= 0) {
      showNotice("error", "Kapasitas maksimal belum valid.");
      return false;
    }

    if (Number(form.initialStock) > Number(form.maxCapacity)) {
      showNotice(
        "error",
        `Stok awal tidak boleh melebihi kapasitas maksimal ${form.maxCapacity} cup.`
      );
      return false;
    }

    if (
      form.productName.toLowerCase().includes("literan") &&
      form.outletType !== "Outlet"
    ) {
      showNotice("error", "Produk literan hanya tersedia di outlet utama.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateInventory()) return;

    const oldData = inventory.find((item) => item.id === editId);

    const inventoryData = {
      branch: form.branch,
      outletType: form.outletType,
      riderName: form.riderName,
      productName: form.productName,
      maxCapacity: Number(form.maxCapacity),
      initialStock: Number(form.initialStock),

      remainingStock: editId
        ? Math.min(
          Number(oldData?.remainingStock ?? form.initialStock),
          Number(form.initialStock)
        )
        : Number(form.initialStock),

      updatedAt:
        form.updatedAt ||
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),

      note: form.note || "",
    };

    if (editId) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
              ...item,
              ...inventoryData,
            }
            : item
        )
      );

      showNotice("success", "Data stok berhasil diperbarui.");
    } else {
      setInventory((prev) => [
        {
          id: Date.now(),
          ...inventoryData,
        },
        ...prev,
      ]);

      showNotice("success", "Stok awal berhasil ditambahkan.");
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      branch: item.branch || "",
      outletType: item.outletType || "",
      riderName: item.riderName || "",
      productName: item.productName || "",
      maxCapacity: item.maxCapacity || "",
      initialStock: item.initialStock || "",
      updatedAt: item.updatedAt || "",
      note: item.note || "",
    });

    showNotice("info", "Mode edit aktif. Ubah data yang diperlukan lalu simpan.");
  };

  const handleDelete = (id) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    showNotice("success", "Data stok berhasil dihapus.");
  };

  return (
    <div className="min-h-screen px-8 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Monitoring Stok Outlet
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Admin menginput stok awal. Stok sisa akan diperbarui oleh rider.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-[#103c2e] px-5 py-3">
          <MdInventory className="text-xl text-emerald-300" />
          <span className="text-sm font-bold text-slate-200">
            Total Data: {totalData}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Total Data
          </p>
          <h2 className="mt-3 text-4xl font-black">{totalData}</h2>
        </div>

        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Total Terjual
          </p>
          <h2 className="mt-3 text-4xl font-black">{totalSold}</h2>
        </div>

        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Cepat Habis
          </p>
          <h2 className="mt-3 text-4xl font-black">{fastSold}</h2>
        </div>

        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Belum Banyak Laku
          </p>
          <h2 className="mt-3 text-4xl font-black">{slowSold}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="saka-panel bg-[#f7f0e6] p-7 text-[#06251c]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
              <MdWarningAmber className="text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-black">
                {editId ? "Edit Stok Awal" : "Tambah Stok Awal"}
              </h2>
              <p className="text-xs text-slate-500">
                Admin hanya mencatat stok awal yang dibawa rider/outlet.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Cabang
              </label>
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="">Pilih cabang</option>
                {branchOptions.map((item) => (
                  <option key={item.branch} value={item.branch}>
                    {item.branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Jenis Outlet
              </label>
              <select
                name="outletType"
                value={form.outletType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="">Pilih jenis outlet</option>
                <option value="Sepeda">Sepeda</option>
                <option value="Bajaj">Bajaj</option>
                <option value="Tenda">Tenda</option>
                <option value="Outlet">Outlet</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Rider
              </label>

              {riders.length > 0 ? (
                <select
                  name="riderName"
                  value={form.riderName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                >
                  <option value="">Pilih rider</option>
                  {riders.map((rider) => (
                    <option key={rider.id} value={rider.name}>
                      {rider.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="riderName"
                  value={form.riderName}
                  onChange={handleChange}
                  placeholder="Contoh: Aris Setiawan"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Produk
              </label>
              <select
                name="productName"
                value={form.productName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="">Pilih produk</option>
                {productOptions.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Kapasitas Maksimal
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={form.maxCapacity}
                onChange={handleChange}
                placeholder="Otomatis dari jenis outlet"
                min="0"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
              <p className="mt-2 text-xs text-slate-500">
                Sepeda 250 cup, Tenda 650 cup, Bajaj menyesuaikan cabang.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Stok Awal
              </label>
              <input
                type="number"
                name="initialStock"
                value={form.initialStock}
                onChange={handleChange}
                placeholder="Contoh: 200"
                min="0"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Waktu Input
              </label>
              <input
                type="time"
                name="updatedAt"
                value={form.updatedAt}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Catatan
              </label>
              <input
                type="text"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Contoh: Stok awal untuk rider pagi"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            {notice.text && (
              <div
                className={`rounded-2xl px-4 py-3 text-xs font-bold leading-6 ${notice.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : notice.type === "info"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                {notice.text}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-3 text-sm font-black text-white transition hover:bg-[#103c2e]"
            >
              <MdAdd />
              {editId ? "Simpan Perubahan" : "Tambah Stok Awal"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-full border border-[#06251c] py-3 text-sm font-black text-[#06251c]"
              >
                Batal Edit
              </button>
            )}
          </form>
        </div>

        <div className="saka-panel bg-[#103c2e] p-7 xl:col-span-2">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black">Monitoring Stok Outlet</h2>
              <p className="mt-1 text-xs text-slate-300">
                Stok sisa akan berubah setelah rider melakukan update stok.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <MdSearch className="text-slate-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari data..."
                className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  <th className="pb-5 font-black">Cabang</th>
                  <th className="pb-5 font-black">Jenis</th>
                  <th className="pb-5 font-black">Rider</th>
                  <th className="pb-5 font-black">Produk</th>
                  <th className="pb-5 font-black">Awal</th>
                  <th className="pb-5 font-black">Sisa</th>
                  <th className="pb-5 font-black">Terjual</th>
                  <th className="pb-5 font-black">Status</th>
                  <th className="pb-5 text-right font-black">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Data stok tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const sold = getSoldStock(item);
                    const status = getStatus(item);
                    const percentage = getSalesPercentage(item);

                    return (
                      <tr key={item.id}>
                        <td className="py-5">
                          <div>
                            <p className="font-bold text-white">
                              {item.branch}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Update: {item.updatedAt}
                            </p>
                            {item.note && (
                              <p className="mt-1 max-w-[180px] text-xs text-slate-500">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-5 text-xs font-medium text-slate-300">
                          {item.outletType}
                        </td>

                        <td className="py-5 text-xs font-medium text-slate-300">
                          {item.riderName}
                        </td>

                        <td className="py-5 text-xs font-medium text-slate-300">
                          {item.productName}
                        </td>

                        <td className="py-5 text-xs font-medium text-slate-300">
                          {item.initialStock}/{item.maxCapacity}
                        </td>

                        <td className="py-5 text-xs font-medium text-slate-300">
                          {item.remainingStock}
                        </td>

                        <td className="py-5">
                          <div className="flex items-center gap-2 text-xs font-black text-white">
                            <MdTrendingUp className="text-emerald-300" />
                            {sold}
                            <span className="text-slate-400">
                              ({percentage}%)
                            </span>
                          </div>
                        </td>

                        <td className="py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="rounded-full bg-white/10 p-2 text-slate-200 transition hover:bg-white hover:text-[#06251c]"
                            >
                              <MdEdit />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="rounded-full bg-red-500/20 p-2 text-red-300 transition hover:bg-red-500 hover:text-white"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-3xl bg-white/5 p-5">
            <h3 className="text-sm font-black text-white">Aturan Monitoring Stok</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-slate-300 md:grid-cols-2">
              <p>
                <span className="font-bold text-emerald-300">Admin</span> input
                stok awal.
              </p>
              <p>
                <span className="font-bold text-emerald-300">Rider</span>{" "}
                update stok sisa.
              </p>
              <p>
                <span className="font-bold text-emerald-300">Sepeda</span>{" "}
                maksimal 250 cup.
              </p>
              <p>
                <span className="font-bold text-emerald-300">Tenda</span>{" "}
                maksimal 650 cup.
              </p>
              <p>
                <span className="font-bold text-emerald-300">Donat</span> hanya
                untuk Nagasakti, Rumbai, Hang Tuah Ujung.
              </p>
              <p>
                <span className="font-bold text-emerald-300">Literan</span>{" "}
                hanya tersedia di outlet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}