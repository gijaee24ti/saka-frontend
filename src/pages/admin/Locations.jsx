import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLocationOn,
  MdSearch,
  MdStorefront,
  MdOpenInNew,
  MdWarningAmber,
  MdCheckCircle,
  MdBedtime,
  MdCancel,
} from "react-icons/md";
import api from "../../services/api";
import {
  findOutletUtama,
  getStatusBadge,
  normalizeOutletUtamaFromApi,
} from "../../utils/outletUtama";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import ResponsiveGrid from "../../components/ResponsiveGrid";

const emptyForm = {
  branch: "",
  vehicle: "Sepeda",
  openTime: "",
  closeTime: "",
  address: "",
  mapsLink: "",
};

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
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

  const formatTime = (time) => {
    if (!time) return "";
    return String(time).slice(0, 5);
  };

  const normalizeOutletFromApi = (item) => ({
    id: item.id,
    branch: item.branch || "",
    vehicle: item.vehicle || "Sepeda",
    openTime: formatTime(item.open_time),
    closeTime: formatTime(item.close_time),
    address: item.address && item.address !== "-" ? item.address : "",
    mapsLink: item.maps_link || "",
    status: item.status || "Tidak Beroperasi",
  });

  const fetchLocations = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/outlets");
      const data = response.data.data ?? response.data;
      setLocations(data.map(normalizeOutletFromApi));
    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Gagal mengambil data lokasi dari backend.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      (item.branch || "").toLowerCase().includes(keyword) ||
      (item.vehicle || "").toLowerCase().includes(keyword) ||
      (item.status || "").toLowerCase().includes(keyword) ||
      (item.address || "").toLowerCase().includes(keyword) ||
      (item.mapsLink || "").toLowerCase().includes(keyword)
    );
  });

  const outletUtama = useMemo(
    () => normalizeOutletUtamaFromApi(findOutletUtama(locations)),
    [locations]
  );

  const cabangLain = useMemo(
    () => filteredLocations.filter((item) => item.id !== outletUtama?.id),
    [filteredLocations, outletUtama?.id]
  );

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedCabang,
  } = usePagination(cabangLain, 5);

  const totalLocations = locations.length;

  const activeLocations = locations.filter(
    (item) => item.status === "Aktif"
  ).length;

  const breakLocations = locations.filter(
    (item) => item.status === "Istirahat"
  ).length;

  const closedLocations = locations.filter(
    (item) => item.status === "Tutup" || item.status === "Tidak Beroperasi"
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const createPayload = () => {
    const oldData = locations.find((item) => item.id === editId);

    return {
      branch: form.branch,
      vehicle: form.vehicle,
      open_time: form.openTime,
      close_time: form.closeTime,
      address: form.address || "",
      maps_link: form.mapsLink || "",
      status: editId
        ? oldData?.status || "Tidak Beroperasi"
        : "Tidak Beroperasi",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.branch || !form.openTime || !form.closeTime) {
      showNotice("error", "Nama cabang, jam buka, dan jam tutup wajib diisi.");
      return;
    }

    try {
      const payload = createPayload();

      if (editId) {
        await api.put(`/admin/outlets/${editId}`, payload);
        showNotice("success", "Data cabang berhasil diperbarui.");
      } else {
        await api.post("/admin/outlets", payload);
        showNotice("success", "Cabang baru berhasil ditambahkan.");
      }

      resetForm();
      fetchLocations();
    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Gagal menyimpan data cabang.")
      );
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      branch: item.branch || "",
      vehicle: item.vehicle || "Sepeda",
      openTime: item.openTime || "",
      closeTime: item.closeTime || "",
      address: item.address && item.address !== "-" ? item.address : "",
      mapsLink: item.mapsLink || "",
    });

    showNotice("info", "Mode edit aktif. Ubah data cabang lalu simpan.");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin mau hapus data cabang ini?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/outlets/${id}`);
      showNotice("success", "Data cabang berhasil dihapus.");
      fetchLocations();
    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Gagal menghapus data cabang.")
      );
    }
  };

  const getVehicleIcon = (vehicle) => {
    if (vehicle === "Outlet") return "🏪";
    if (vehicle === "Sepeda") return "🚲";
    if (vehicle === "Bajaj") return "🛺";
    if (vehicle === "Tenda") return "⛺";
    return "📍";
  };

  const statusClass = (status) => {
    if (status === "Aktif") return "bg-green-500/20 text-green-300";
    if (status === "Istirahat") return "bg-yellow-500/20 text-yellow-300";
    if (status === "Bergerak") return "bg-blue-500/20 text-blue-300";
    return "bg-red-500/20 text-red-300";
  };

  const hasAddress = (item) => item.address && item.address !== "-";
  const hasMaps = (item) => item.mapsLink && item.mapsLink.trim() !== "";

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
            SAKA ADMIN PANEL
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Lokasi Cabang
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Admin mengelola data cabang, jam operasional, alamat, dan link maps.
            Status operasional hanya ditampilkan dan nantinya diperbarui oleh
            rider.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-[#103c2e] px-5 py-3">
          <MdLocationOn className="text-xl text-emerald-300" />
          <span className="text-sm font-bold text-slate-200">
            Total Cabang: {totalLocations}
          </span>
        </div>
      </div>

      {outletUtama?.id && (
        <div className="mb-6 max-w-full rounded-3xl border border-emerald-500/30 bg-[#103c2e] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">
                Outlet Utama
              </p>
              <h2 className="mt-2 text-2xl font-black">{outletUtama.branch}</h2>
              <p className="mt-2 text-sm text-slate-300">
                {outletUtama.deskripsi || "Kelola informasi outlet utama di halaman khusus."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                <span>
                  {getStatusBadge(outletUtama.status).emoji}{" "}
                  {getStatusBadge(outletUtama.status).label}
                </span>
                <span>
                  🕒 {outletUtama.openTime} - {outletUtama.closeTime}
                </span>
                {outletUtama.produkLiteranTersedia && <span>🥤 Literan</span>}
                {outletUtama.donatTersedia && <span>🍩 Donat</span>}
              </div>

              {outletUtama.address && (
                <p className="mt-3 break-words text-sm text-slate-400">
                  📌 {outletUtama.address}
                </p>
              )}
            </div>

            <Link
              to="/admin/settings"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[#f8efe1] px-5 py-3 text-sm font-black text-[#06251c] transition hover:bg-white"
            >
              Kelola Outlet Utama
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6">
        <ResponsiveGrid>
          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#e7ddd0] text-[#06251c]"><MdStorefront /></div>}
            label="Total Cabang"
            value={totalLocations}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#cce6dd] text-[#607f75]"><MdCheckCircle /></div>}
            label="Aktif"
            value={activeLocations}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-yellow-100 text-yellow-600"><MdBedtime /></div>}
            label="Istirahat"
            value={breakLocations}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-red-100 text-red-600"><MdCancel /></div>}
            label="Tutup"
            value={closedLocations}
            className="bg-white text-[#06251c]"
          />
        </ResponsiveGrid>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="saka-panel bg-[#f7f0e6] p-7 text-[#06251c]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
              <MdStorefront className="text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-black">
                {editId ? "Edit Cabang" : "Tambah Cabang"}
              </h2>
              <p className="text-xs text-slate-500">
                Admin hanya mengatur data cabang, bukan status operasional.
              </p>
            </div>
          </div>

          {notice.text && (
            <div
              className={`mb-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-bold leading-6 ${
                notice.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : notice.type === "info"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              <MdWarningAmber className="mt-1 shrink-0" />
              <span>{notice.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Nama Cabang
              </label>
              <input
                type="text"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="Contoh: Cabang Parit Indah"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Jenis Outlet
              </label>
              <select
                name="vehicle"
                value={form.vehicle}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="Outlet">Outlet</option>
                <option value="Sepeda">Sepeda</option>
                <option value="Bajaj">Bajaj</option>
                <option value="Tenda">Tenda</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Jam Buka
                </label>
                <input
                  type="time"
                  name="openTime"
                  value={form.openTime}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Jam Tutup
                </label>
                <input
                  type="time"
                  name="closeTime"
                  value={form.closeTime}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Detail Alamat
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                placeholder="Opsional: Jalan Nangka, dekat RS Andini"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Link Google Maps
              </label>
              <input
                type="text"
                name="mapsLink"
                value={form.mapsLink}
                onChange={handleChange}
                placeholder="Opsional: tempel link Google Maps di sini"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div className="rounded-2xl bg-[#06251c]/10 p-4">
              <p className="text-xs font-bold leading-6 text-slate-600">
                Status operasional tidak bisa diubah oleh admin. Status akan
                diperbarui oleh rider melalui halaman rider.
              </p>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-3 text-sm font-black text-white transition hover:bg-[#103c2e]"
            >
              <MdAdd />
              {editId ? "Simpan Perubahan" : "Tambah Cabang"}
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
              <h2 className="text-xl font-black">Monitoring Cabang</h2>
              <p className="mt-1 text-xs text-slate-300">
                Data cabang ini diambil dari backend Laravel.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <MdSearch className="text-slate-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari cabang..."
                className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  <th className="pb-5 font-black">Cabang</th>
                  <th className="pb-5 font-black">Alamat</th>
                  <th className="pb-5 font-black">Link Maps</th>
                  <th className="pb-5 font-black">Jenis</th>
                  <th className="pb-5 font-black">Jam</th>
                  <th className="pb-5 font-black">Status</th>
                  <th className="pb-5 text-right font-black">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Mengambil data cabang dari backend...
                    </td>
                  </tr>
                ) : cabangLain.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Data cabang tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedCabang.map((item) => (
                    <tr key={item.id}>
                      <td className="py-5 pr-4">
                        <p className="font-bold text-white">{item.branch}</p>
                      </td>

                      <td className="py-5 pr-4">
                        {hasAddress(item) ? (
                          <p className="max-w-[230px] text-xs font-medium leading-5 text-slate-300">
                            {item.address}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Belum ada alamat
                          </span>
                        )}
                      </td>

                      <td className="py-5 pr-4">
                        {hasMaps(item) ? (
                          <a
                            href={item.mapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
                          >
                            Buka Maps
                            <MdOpenInNew />
                          </a>
                        ) : (
                          <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-slate-400">
                            Belum ada link
                          </span>
                        )}
                      </td>

                      <td className="py-5 pr-4 text-xs font-medium text-slate-300">
                        <span className="mr-2">{getVehicleIcon(item.vehicle)}</span>
                        {item.vehicle}
                      </td>

                      <td className="py-5 pr-4 text-xs font-medium text-slate-300">
                        {item.openTime} - {item.closeTime}
                      </td>

                      <td className="py-5 pr-4">
                        <span
                          className={`rounded-full px-4 py-1 text-xs font-black ${statusClass(
                            item.status
                          )}`}
                        >
                          {item.status || "Tidak Beroperasi"}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {cabangLain.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <div className="mt-6 rounded-3xl bg-white/5 p-5">
            <h3 className="text-sm font-black text-white">Catatan</h3>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Data lokasi dikelola oleh admin. Status operasional seperti Aktif,
              Istirahat, Tutup, atau Tidak Beroperasi akan diperbarui oleh rider
              sesuai kondisi di lapangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}