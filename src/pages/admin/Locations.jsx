import { useEffect, useState } from "react";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLocationOn,
  MdSearch,
  MdStorefront,
  MdOpenInNew,
} from "react-icons/md";

const defaultLocations = [
  {
    id: 1,
    branch: "Cabang Cut Nyak Dien",
    vehicle: "Sepeda",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 2,
    branch: "Cabang Patimura",
    vehicle: "Sepeda",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 3,
    branch: "Cabang Rajawali",
    vehicle: "Sepeda",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 4,
    branch: "Cabang Riau",
    vehicle: "Sepeda",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 5,
    branch: "Cabang Kharudin Nasution / Simpang",
    vehicle: "Sepeda",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 6,
    branch: "Cabang Arifin Ahmad",
    vehicle: "Bajaj",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 7,
    branch: "Cabang Rumbai",
    vehicle: "Tenda",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 8,
    branch: "Cabang Stadion / Nagasakti",
    vehicle: "Bajaj",
    openTime: "11:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 9,
    branch: "Cabang Tuanku Tambusai / Nangka",
    vehicle: "Sepeda",
    openTime: "09:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "Dekat RS Andini",
    status: "Aktif",
  },
  {
    id: 10,
    branch: "Cabang Nangka Ujung",
    vehicle: "Sepeda",
    openTime: "09:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "Seberang Simpang Srikandi",
    status: "Aktif",
  },
  {
    id: 11,
    branch: "Cabang Hang Tuah Ujung",
    vehicle: "Bajaj",
    openTime: "09:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 12,
    branch: "Cabang Parit Indah",
    vehicle: "Sepeda",
    openTime: "09:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Istirahat",
  },
  {
    id: 13,
    branch: "Cabang HR. Soebrantas",
    vehicle: "Sepeda",
    openTime: "09:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 14,
    branch: "Cabang Soekarno Hatta",
    vehicle: "Sepeda",
    openTime: "09:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 15,
    branch: "Cabang Hangtuah",
    vehicle: "Sepeda",
    openTime: "10:00",
    closeTime: "18:00",
    address: "",
    mapsLink: "",
    note: "",
    status: "Aktif",
  },
  {
    id: 16,
    branch: "Bajaj Dipo Malam",
    vehicle: "Bajaj",
    openTime: "20:00",
    closeTime: "23:00",
    address: "",
    mapsLink: "",
    note: "Operasional malam",
    status: "Aktif",
  },
];

const emptyForm = {
  branch: "",
  vehicle: "Sepeda",
  openTime: "",
  closeTime: "",
  address: "",
  mapsLink: "",
  note: "",
};

export default function Locations() {
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem("saka_locations");

    if (!saved) return defaultLocations;

    try {
      const parsed = JSON.parse(saved);

      return parsed.map((item) => ({
        id: item.id || Date.now(),
        branch: item.branch || "",
        vehicle: item.vehicle || "Sepeda",
        openTime: item.openTime || "",
        closeTime: item.closeTime || "",

        // Kalau data lama masih "-", dianggap kosong biar strip tidak muncul.
        address: item.address && item.address !== "-" ? item.address : "",

        mapsLink: item.mapsLink || "",
        note: item.note || "",
        status: item.status || "Tidak Beroperasi",
      }));
    } catch (error) {
      localStorage.removeItem("saka_locations");
      return defaultLocations;
    }
  });

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("saka_locations", JSON.stringify(locations));
  }, [locations]);

  const filteredLocations = locations.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      (item.branch || "").toLowerCase().includes(keyword) ||
      (item.vehicle || "").toLowerCase().includes(keyword) ||
      (item.status || "").toLowerCase().includes(keyword) ||
      (item.address || "").toLowerCase().includes(keyword) ||
      (item.mapsLink || "").toLowerCase().includes(keyword) ||
      (item.note || "").toLowerCase().includes(keyword)
    );
  });

  const totalLocations = locations.length;
  const activeLocations = locations.filter((item) => item.status === "Aktif").length;
  const breakLocations = locations.filter((item) => item.status === "Istirahat").length;
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.branch || !form.openTime || !form.closeTime) {
      alert("Nama cabang, jam buka, dan jam tutup wajib diisi!");
      return;
    }

    const oldData = locations.find((item) => item.id === editId);

    const locationData = {
      branch: form.branch,
      vehicle: form.vehicle,
      openTime: form.openTime,
      closeTime: form.closeTime,
      address: form.address || "",
      mapsLink: form.mapsLink || "",
      note: form.note || "",

      // Status operasional tidak diatur admin.
      status: editId ? oldData?.status || "Tidak Beroperasi" : "Tidak Beroperasi",
    };

    if (editId) {
      setLocations((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...item,
                ...locationData,
              }
            : item
        )
      );
    } else {
      setLocations((prev) => [
        {
          id: Date.now(),
          ...locationData,
        },
        ...prev,
      ]);
    }

    resetForm();
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
      note: item.note || "",
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = confirm("Yakin mau hapus data cabang ini?");

    if (confirmDelete) {
      setLocations((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const getVehicleIcon = (vehicle) => {
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
    <div className="min-h-screen px-8 py-8 text-white">
      {/* Header */}
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
            Status operasional hanya ditampilkan dan nantinya diperbarui oleh rider.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-[#103c2e] px-5 py-3">
          <MdLocationOn className="text-xl text-emerald-300" />
          <span className="text-sm font-bold text-slate-200">
            Total Cabang: {totalLocations}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Total Cabang
          </p>
          <h2 className="mt-3 text-4xl font-black">{totalLocations}</h2>
        </div>

        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Aktif
          </p>
          <h2 className="mt-3 text-4xl font-black">{activeLocations}</h2>
        </div>

        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Istirahat
          </p>
          <h2 className="mt-3 text-4xl font-black">{breakLocations}</h2>
        </div>

        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Tutup
          </p>
          <h2 className="mt-3 text-4xl font-black">{closedLocations}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Form */}
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

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Catatan Lokasi
              </label>
              <input
                type="text"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Opsional: Seberang Simpang Srikandi"
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

        {/* Table */}
        <div className="saka-panel bg-[#103c2e] p-7 xl:col-span-2">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black">Monitoring Cabang</h2>
              <p className="mt-1 text-xs text-slate-300">
                Admin hanya melihat status. Perubahan status dilakukan oleh rider.
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
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  <th className="pb-5 font-black">Cabang</th>
                  <th className="pb-5 font-black">Alamat / Maps</th>
                  <th className="pb-5 font-black">Jenis</th>
                  <th className="pb-5 font-black">Jam</th>
                  <th className="pb-5 font-black">Status</th>
                  <th className="pb-5 text-right font-black">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Data cabang tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((item) => (
                    <tr key={item.id}>
                      <td className="py-5">
                        <div>
                          <p className="font-bold text-white">{item.branch}</p>

                          {item.note && (
                            <p className="mt-1 text-xs text-slate-400">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-5">
                        <div>
                          {hasAddress(item) && (
                            <p className="max-w-[230px] text-xs font-medium leading-5 text-slate-300">
                              {item.address}
                            </p>
                          )}

                          {hasMaps(item) && (
                            <a
                              href={item.mapsLink}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-emerald-200 ${
                                hasAddress(item) ? "mt-2" : ""
                              }`}
                            >
                              Buka Maps
                              <MdOpenInNew />
                            </a>
                          )}

                          {!hasAddress(item) && !hasMaps(item) && (
                            <span className="text-xs text-slate-500">
                              Belum ada alamat
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-5 text-xs font-medium text-slate-300">
                        <span className="mr-2">{getVehicleIcon(item.vehicle)}</span>
                        {item.vehicle}
                      </td>

                      <td className="py-5 text-xs font-medium text-slate-300">
                        {item.openTime} - {item.closeTime}
                      </td>

                      <td className="py-5">
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