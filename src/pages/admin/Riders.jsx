import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLocalShipping,
  MdSearch,
} from "react-icons/md";

const createUsername = (name = "") => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const defaultRiders = [
  {
    id: 1,
    name: "Aris Setiawan",
    phone: "081234567891",
    username: "aris",
    password: "aris123",
    accountStatus: "Aktif",
    stand: "Cabang Arifin Ahmad",
    operationalStatus: "Berjualan",
  },
  {
    id: 2,
    name: "Budi Kusuma",
    phone: "081234567892",
    username: "budi",
    password: "budi123",
    accountStatus: "Aktif",
    stand: "Cabang Rumbai",
    operationalStatus: "Istirahat",
  },
];

const defaultLocations = [
  { id: 1, branch: "Cabang Cut Nyak Dien" },
  { id: 2, branch: "Cabang Patimura" },
  { id: 3, branch: "Cabang Rajawali" },
  { id: 4, branch: "Cabang Riau" },
  { id: 5, branch: "Cabang Kharudin Nasution / Simpang" },
  { id: 6, branch: "Cabang Arifin Ahmad" },
  { id: 7, branch: "Cabang Rumbai" },
  { id: 8, branch: "Cabang Stadion / Nagasakti" },
  { id: 9, branch: "Cabang Tuanku Tambusai / Nangka" },
  { id: 10, branch: "Cabang Nangka Ujung" },
  { id: 11, branch: "Cabang Hang Tuah Ujung" },
  { id: 12, branch: "Cabang Parit Indah" },
  { id: 13, branch: "Cabang HR. Soebrantas" },
  { id: 14, branch: "Cabang Soekarno Hatta" },
  { id: 15, branch: "Cabang Hangtuah" },
  { id: 16, branch: "Bajaj Dipo Malam" },
];

const emptyForm = {
  name: "",
  phone: "",
  username: "",
  password: "",
  accountStatus: "Aktif",
  stand: "",
};

export default function Riders() {
  const [riders, setRiders] = useState(() => {
    const saved = localStorage.getItem("saka_riders");

    if (!saved) return defaultRiders;

    try {
      const parsed = JSON.parse(saved);

      return parsed.map((rider) => {
        const riderName = rider.name || "";
        const oldStatus = rider.status || "";

        return {
          id: rider.id || Date.now(),
          name: riderName,
          phone: rider.phone || "",
          username: rider.username || createUsername(riderName),
          password: rider.password || "",
          accountStatus:
            rider.accountStatus ||
            (oldStatus === "Inactive" ? "Nonaktif" : "Aktif"),
          stand: rider.stand || rider.location || "",
          operationalStatus:
            rider.operationalStatus ||
            (oldStatus === "Break"
              ? "Istirahat"
              : oldStatus === "Active"
              ? "Berjualan"
              : "Tidak Beroperasi"),

          location: rider.location || rider.stand || "",
          status: rider.status || "Inactive",
        };
      });
    } catch (error) {
      localStorage.removeItem("saka_riders");
      return defaultRiders;
    }
  });

  const [locations] = useState(() => {
    const saved = localStorage.getItem("saka_locations");

    if (!saved) return defaultLocations;

    try {
      return JSON.parse(saved);
    } catch (error) {
      return defaultLocations;
    }
  });

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("saka_riders", JSON.stringify(riders));
  }, [riders]);

  const locationOptions = useMemo(() => {
    if (!locations || locations.length === 0) return defaultLocations;
    return locations;
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
      alert("Nama rider dan No HP wajib diisi!");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const oldData = riders.find((rider) => rider.id === editId);

    const finalUsername =
      form.username || oldData?.username || createUsername(form.name);

    const riderData = {
      name: form.name,
      phone: form.phone,
      username: finalUsername,
      password: form.password || oldData?.password || "",
      accountStatus: form.accountStatus || oldData?.accountStatus || "Aktif",
      stand: form.stand || oldData?.stand || oldData?.location || "",

      operationalStatus: editId
        ? oldData?.operationalStatus || "Tidak Beroperasi"
        : "Tidak Beroperasi",

      location: form.stand || oldData?.stand || oldData?.location || "",
      status: editId ? oldData?.status || "Inactive" : "Inactive",
    };

    if (editId) {
      setRiders((prev) =>
        prev.map((rider) =>
          rider.id === editId
            ? {
                ...rider,
                ...riderData,
              }
            : rider
        )
      );
    } else {
      setRiders((prev) => [
        {
          id: Date.now(),
          ...riderData,
        },
        ...prev,
      ]);
    }

    resetForm();
  };

  const handleEdit = (rider) => {
    setEditId(rider.id);

    setForm({
      name: rider.name || "",
      phone: rider.phone || "",
      username: rider.username || createUsername(rider.name),
      password: rider.password || "",
      accountStatus: rider.accountStatus || "Aktif",
      stand: rider.stand || rider.location || "",
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = confirm("Yakin mau hapus data rider ini?");

    if (confirmDelete) {
      setRiders((prev) => prev.filter((rider) => rider.id !== id));
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

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Total Rider
          </p>
          <h2 className="mt-3 text-4xl font-black">{totalRiders}</h2>
        </div>

        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Akun Aktif
          </p>
          <h2 className="mt-3 text-4xl font-black">{activeAccounts}</h2>
        </div>

        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Berjualan
          </p>
          <h2 className="mt-3 text-4xl font-black">{sellingRiders}</h2>
        </div>

        <div class="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Istirahat
          </p>
          <h2 className="mt-3 text-4xl font-black">{breakRiders}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
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
                placeholder="Opsional: contoh aris123"
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
            <div className="min-w-[1050px]">
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
                {filteredRiders.length === 0 ? (
                  <div className="rounded-3xl bg-white/5 p-8 text-center text-sm text-slate-400">
                    Data rider tidak ditemukan.
                  </div>
                ) : (
                  filteredRiders.map((rider) => (
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
                  ))
                )}
              </div>
            </div>
          </div>

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