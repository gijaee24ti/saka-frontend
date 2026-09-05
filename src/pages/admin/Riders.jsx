import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLocalShipping,
  MdSearch,
  MdCheckCircle,
  MdLocalCafe,
  MdBedtime,
} from "react-icons/md";
import api from "../../services/api";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import ResponsiveGrid from "../../components/ResponsiveGrid";
import { showAlert, showToast } from "../../utils/notification";
const createUsername = (name = "") => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const emptyForm = {
  name: "",
  phone: "",
  username: "",
  password: "",
  accountStatus: "Aktif",
  stand: "",
};

export default function Riders() {
  const [riders, setRiders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  const normalizeRiderFromApi = (rider) => ({
    id: rider.id,
    name: rider.name || "",
    phone: rider.phone || "",
    username: rider.username || createUsername(rider.name),
    password: "",
    accountStatus: rider.account_status || "Aktif",
    stand: rider.outlet?.branch || "",
    outletId: rider.outlet_id || rider.outlet?.id || "",
    operationalStatus: rider.operational_status || "Tidak Beroperasi",

    location: rider.outlet?.branch || "",
    status:
      rider.operational_status === "Berjualan"
        ? "Active"
        : rider.operational_status === "Istirahat"
          ? "Break"
          : "Inactive",
  });

  const normalizeOutletFromApi = (outlet) => ({
    id: outlet.id,
    branch: outlet.branch || "",
  });

  const fetchRiders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/riders?all=1");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setRiders(data.map(normalizeRiderFromApi));
    } catch (error) {
      showAlert.error(getErrorMessage(error, "Gagal mengambil data rider dari backend."));
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get("/public/outlets");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setLocations(data.map(normalizeOutletFromApi));
    } catch (error) {
      showAlert.error(getErrorMessage(error, "Gagal mengambil data outlet."));
    }
  };

  useEffect(() => {
    fetchRiders();
    fetchLocations();
  }, []);

  const locationOptions = useMemo(() => {
    return locations || [];
  }, [locations]);

  const getInitial = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredRiders = riders.filter((rider) => {
    const keyword = search.toLowerCase();

    return (
      (rider.name || "").toLowerCase().includes(keyword) ||
      (rider.phone || "").toLowerCase().includes(keyword) ||
      (rider.username || "").toLowerCase().includes(keyword) ||
      (rider.accountStatus || "").toLowerCase().includes(keyword) ||
      (rider.stand || "").toLowerCase().includes(keyword) ||
      (rider.operationalStatus || "").toLowerCase().includes(keyword)
    );
  });

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedRiders,
  } = usePagination(filteredRiders, 5);

  const totalRiders = riders.length;
  const activeAccounts = riders.filter(
    (rider) => rider.accountStatus === "Aktif"
  ).length;
  const sellingRiders = riders.filter(
    (rider) => rider.operationalStatus === "Berjualan"
  ).length;
  const breakRiders = riders.filter(
    (rider) => rider.operationalStatus === "Istirahat"
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setForm((prev) => ({
        ...prev,
        name: value,
        username: prev.username || createUsername(value),
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const validateForm = () => {
    if (!form.name || !form.phone) {
      showAlert.warning("Nama rider dan No HP wajib diisi!", "Data Belum Lengkap");
      return false;
    }

    return true;
  };

  const createPayload = () => {
    const oldData = riders.find((rider) => rider.id === editId);

    const finalUsername =
      form.username || oldData?.username || createUsername(form.name);

    const selectedOutlet = locationOptions.find(
      (location) => location.branch === form.stand
    );

    const payload = {
      outlet_id: selectedOutlet?.id || oldData?.outletId || null,
      name: form.name,
      phone: form.phone,
      username: finalUsername,
      account_status: form.accountStatus || oldData?.accountStatus || "Aktif",
      operational_status: editId
        ? oldData?.operationalStatus || "Tidak Beroperasi"
        : "Tidak Beroperasi",
      note: null,
    };

    if (editId) {
      if (form.password) {
        payload.password = form.password;
      }
    } else {
      payload.password = form.password || `${finalUsername}123`;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = createPayload();

      if (editId) {
        await api.put(`/admin/riders/${editId}`, payload);
        showToast.success("Data rider berhasil diperbarui.");
      } else {
        await api.post("/admin/riders", payload);
        showToast.success("Rider baru berhasil ditambahkan.");
      }

      resetForm();
      fetchRiders();
    } catch (error) {
      showAlert.error(getErrorMessage(error, "Gagal menyimpan data rider."));
    }
  };

  const handleEdit = (rider) => {
    setEditId(rider.id);

    setForm({
      name: rider.name || "",
      phone: rider.phone || "",
      username: rider.username || createUsername(rider.name),
      password: "",
      accountStatus: rider.accountStatus || "Aktif",
      stand: rider.stand || rider.location || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = await showAlert.confirm("Yakin mau hapus data rider ini?", "Konfirmasi Hapus");

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/riders/${id}`);
      showToast.success("Data rider berhasil dihapus.");
      fetchRiders();
    } catch (error) {
      showAlert.error(getErrorMessage(error, "Gagal menghapus data rider."));
    }
  };

  const accountStatusClass = (status) => {
    if (status === "Aktif") return "bg-green-500/20 text-green-300";
    return "bg-red-500/20 text-red-300";
  };

  const operationalStatusClass = (status) => {
    if (status === "Berjualan") return "bg-green-500/20 text-green-300";
    if (status === "Istirahat") return "bg-yellow-500/20 text-yellow-300";
    if (status === "Tutup") return "bg-red-500/20 text-red-300";
    return "bg-slate-500/20 text-slate-300";
  };

  return (
    <div className="min-h-screen px-8 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
            SAKA ADMIN PANEL
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Data Rider
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Admin mengelola data akun rider dan melihat status operasional.
            Status operasional nantinya diperbarui oleh rider.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-[#103c2e] px-5 py-3">
          <MdLocalShipping className="text-xl text-emerald-300" />
          <span className="text-sm font-bold text-slate-200">
            Total Rider: {totalRiders}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <ResponsiveGrid>
          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#e7ddd0] text-[#06251c]"><MdLocalShipping /></div>}
            label="Total Rider"
            value={totalRiders}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#cce6dd] text-[#607f75]"><MdCheckCircle /></div>}
            label="Akun Aktif"
            value={activeAccounts}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-emerald-100 text-emerald-600"><MdLocalCafe /></div>}
            label="Berjualan"
            value={sellingRiders}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-yellow-100 text-yellow-600"><MdBedtime /></div>}
            label="Istirahat"
            value={breakRiders}
            className="bg-white text-[#06251c]"
          />
        </ResponsiveGrid>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="saka-panel bg-[#f7f0e6] p-7 text-[#06251c]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
              <MdLocalShipping className="text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-black">
                {editId ? "Edit Rider" : "Tambah Rider"}
              </h2>
              <p className="text-xs text-slate-500">
                Admin hanya mengatur akun dan stand tugas rider.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Nama Rider
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Aris Setiawan"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                No HP / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Contoh: 08123456789"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Opsional: otomatis dari nama rider"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Password
              </label>
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  editId
                    ? "Kosongkan jika tidak ingin mengganti password"
                    : "Opsional: contoh aris123"
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Stand Tugas
              </label>
              <select
                name="stand"
                value={form.stand}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="">Belum ditentukan</option>
                {locationOptions.map((location) => (
                  <option
                    key={location.id || location.branch}
                    value={location.branch}
                  >
                    {location.branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Status Akun
              </label>
              <select
                name="accountStatus"
                value={form.accountStatus}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="rounded-2xl bg-[#06251c]/10 p-4">
              <p className="text-xs font-bold leading-6 text-slate-600">
                Status operasional seperti Berjualan, Istirahat, Tutup, atau
                Tidak Beroperasi tidak diubah dari halaman ini.
              </p>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-3 text-sm font-black text-white transition hover:bg-[#103c2e]"
            >
              <MdAdd />
              {editId ? "Simpan Perubahan" : "Tambah Rider"}
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
              <h2 className="text-2xl font-black">Monitoring Rider</h2>
              <p className="mt-1 text-sm text-slate-300">
                Admin hanya melihat status operasional rider.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
              <MdSearch className="text-slate-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari rider..."
                className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="rounded-3xl bg-white/5 p-8 text-center text-sm text-slate-400">
                Mengambil data rider dari backend...
              </div>
            ) : filteredRiders.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-8 text-center text-sm text-slate-400">
                Data rider tidak ditemukan.
              </div>
            ) : (
              <>
                <div className="hidden lg:block min-w-[1050px]">
                  <div className="mb-3 grid grid-cols-[1.5fr_1.15fr_1fr_1.55fr_1fr_1.25fr_0.8fr] gap-5 px-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <div>Rider</div>
                    <div>No HP</div>
                    <div>Username</div>
                    <div>Stand Tugas</div>
                    <div>Akun</div>
                    <div>Operasional</div>
                    <div className="text-right">Aksi</div>
                  </div>

                  <div className="space-y-3">
                    {paginatedRiders.map((rider) => (
                      <div
                        key={rider.id}
                        className="grid grid-cols-[1.5fr_1.15fr_1fr_1.55fr_1fr_1.25fr_0.8fr] items-center gap-5 rounded-3xl bg-white/5 px-5 py-5 transition hover:bg-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7f2ea] text-sm font-black text-[#06251c]">
                            {getInitial(rider.name)}
                          </div>

                          <div>
                            <p className="font-black text-white">{rider.name}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Rider Saka
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            WhatsApp
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            {rider.phone || "Belum diisi"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            Login
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            {rider.username || createUsername(rider.name)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            Cabang
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            {rider.stand || rider.location || "Belum ditentukan"}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${accountStatusClass(
                              rider.accountStatus
                            )}`}
                          >
                            {rider.accountStatus || "Aktif"}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${operationalStatusClass(
                              rider.operationalStatus
                            )}`}
                          >
                            {rider.operationalStatus || "Tidak Beroperasi"}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(rider)}
                            className="rounded-full bg-white/10 p-3 text-slate-200 transition hover:bg-white hover:text-[#06251c]"
                          >
                            <MdEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(rider.id)}
                            className="rounded-full bg-red-500/20 p-3 text-red-300 transition hover:bg-red-500 hover:text-white"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:hidden space-y-4">
                  {paginatedRiders.map((rider) => (
                    <div
                      key={rider.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f2ea] text-sm font-black text-[#06251c]">
                            {getInitial(rider.name)}
                          </div>
                          <div>
                            <p className="font-black text-white">{rider.name}</p>
                            <p className="mt-1 text-xs text-slate-400">Rider Saka</p>
                          </div>
                        </div>

                        <div className="space-y-2 text-right">
                          <span
                            className={`inline-flex rounded-full px-3 py-2 text-xs font-black ${accountStatusClass(
                              rider.accountStatus
                            )}`}
                          >
                            {rider.accountStatus || "Aktif"}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-2 text-xs font-black ${operationalStatusClass(
                              rider.operationalStatus
                            )}`}
                          >
                            {rider.operationalStatus || "Tidak Beroperasi"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 text-sm text-slate-300">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            No HP
                          </p>
                          <p className="mt-1 font-bold text-white">
                            {rider.phone || "Belum diisi"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            Username
                          </p>
                          <p className="mt-1 font-bold text-white">
                            {rider.username || createUsername(rider.name)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            Stand Tugas
                          </p>
                          <p className="mt-1 font-bold text-white">
                            {rider.stand || rider.location || "Belum ditentukan"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(rider)}
                          className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-black text-slate-200 transition hover:bg-white hover:text-[#06251c]"
                        >
                          <MdEdit className="mr-2" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rider.id)}
                          className="inline-flex items-center justify-center rounded-full bg-red-500/20 px-4 py-2 text-sm font-black text-red-300 transition hover:bg-red-500 hover:text-white"
                        >
                          <MdDelete className="mr-2" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <div className="mt-6 rounded-3xl bg-white/5 p-5">
            <h3 className="text-sm font-black text-white">Catatan</h3>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Admin mengelola data akun rider seperti nama, nomor HP, username,
              password, status akun, dan stand tugas. Status operasional rider
              akan diperbarui langsung oleh rider sesuai kondisi di lapangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}