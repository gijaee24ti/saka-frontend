import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdImage,
  MdInfo,
  MdRestaurantMenu,
  MdSearch,
  MdStorefront,
  MdWarningAmber,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import api from "../../services/api";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import ResponsiveGrid from "../../components/ResponsiveGrid";
import { showAlert } from "../../utils/notification";
const emptyForm = {
  name: "",
  category: "Cup Series",
  cupPrice: "",
  price500: "",
  price1L: "",
  description: "",
  image: "",
  status: "Aktif",
};

export default function Products() {
  const [menus, setMenus] = useState([]);
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

  const normalizeMenuFromApi = (item) => ({
    id: item.id,
    name: item.name || "",
    category: item.category || "Cup Series",
    cupPrice: item.cup_price ?? 0,
    price500: item.price_500 ?? 0,
    price1L: item.price_1l ?? 0,
    description: item.description || "",
    image: item.image || "",
    status: item.status || "Aktif",
  });

  const createPayload = () => ({
    name: form.name,
    category: form.category,
    cup_price: Number(form.cupPrice || 0),
    price_500: Number(form.price500 || 0),
    price_1l: Number(form.price1L || 0),
    description: form.description || "Belum ada deskripsi.",
    image: form.image,
    status: form.status,
  });

  const fetchMenus = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/menus?all=1");

      const data = response.data.data ?? [];

      setMenus(data.map(normalizeMenuFromApi));

    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Gagal mengambil data menu.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const filteredMenus = menus.filter((menu) => {
    const keyword = search.toLowerCase();

    return (
      (menu.name || "").toLowerCase().includes(keyword) ||
      (menu.category || "").toLowerCase().includes(keyword) ||
      (menu.description || "").toLowerCase().includes(keyword) ||
      (menu.status || "").toLowerCase().includes(keyword)
    );
  });

  const categoryOrder = {
    "Cup Series": 1,
    Literan: 2,
    Snack: 3,
  };

  const sortedMenus = [...filteredMenus].sort((a, b) => {
    const orderA = categoryOrder[a.category] || 99;
    const orderB = categoryOrder[b.category] || 99;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.id - b.id;
  });

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedMenus,
  } = usePagination(sortedMenus, 5);

  const totalMenu = menus.length;
  const activeMenu = menus.filter((menu) => menu.status === "Aktif").length;
  const nonActiveMenu = menus.filter(
    (menu) => menu.status === "Nonaktif"
  ).length;

  const totalCategory = useMemo(() => {
    const categories = menus.map((menu) => menu.category);
    return [...new Set(categories)].length;
  }, [menus]);

  const formatRupiah = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: `/img/${file.name}`,
    }));

    showNotice(
      "info",
      "Nama file gambar berhasil dimasukkan. Pastikan file gambar ada di folder public/img."
    );
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const validateForm = () => {
    if (!form.name || !form.category) {
      showNotice("error", "Nama menu dan kategori wajib diisi.");
      return false;
    }

    if (form.cupPrice === "" && form.price500 === "" && form.price1L === "") {
      showNotice("error", "Minimal isi salah satu harga produk.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = createPayload();

      if (editId) {
        await api.put(`/admin/menus/${editId}`, payload);

        showNotice("success", "Data menu berhasil diperbarui.");
      } else {
        await api.post("/admin/menus", payload);

        showNotice("success", "Menu berhasil ditambahkan.");
      }

      resetForm();
      fetchMenus();

    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Gagal menyimpan menu.")
      );
    }
  };

  const handleEdit = (menu) => {
    setEditId(menu.id);

    setForm({
      name: menu.name || "",
      category: menu.category || "Cup Series",
      cupPrice: menu.cupPrice ?? "",
      price500: menu.price500 ?? "",
      price1L: menu.price1L ?? "",
      description: menu.description || "",
      image: menu.image || "",
      status: menu.status || "Aktif",
    });

    showNotice("info", "Mode edit aktif. Ubah data yang diperlukan lalu simpan.");
  };

  const handleDelete = async (id) => {
  const confirmDelete = await showAlert.confirm("Yakin ingin menghapus menu ini?", "Konfirmasi Hapus");
  if (!confirmDelete) return;

  try {
    await api.delete(`/admin/menus/${id}`);

    showNotice("success", "Menu berhasil dihapus.");

    fetchMenus();

  } catch (error) {
    showNotice(
      "error",
      getErrorMessage(error, "Gagal menghapus menu.")
    );
  }
};

  const renderPriceCards = (menu) => {
    const isSnack = menu.category === "Snack";

    const prices = isSnack
      ? [
        {
          label: "Harga",
          value: menu.cupPrice,
        },
      ].filter((item) => Number(item.value) > 0)
      : [
        {
          label: "Cup",
          value: menu.cupPrice,
        },
        {
          label: "500 ML",
          value: menu.price500,
        },
        {
          label: "1 Liter",
          value: menu.price1L,
        },
      ].filter((item) => Number(item.value) > 0);

    if (prices.length === 0) {
      return (
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            Harga
          </p>
          <p className="mt-1 text-sm font-black text-white">Belum diisi</p>
        </div>
      );
    }

    return prices.map((item) => (
      <div key={item.label} className="rounded-2xl bg-white/10 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
          {item.label}
        </p>
        <p className="mt-1 text-sm font-black text-white">
          {formatRupiah(item.value)}
        </p>
      </div>
    ));
  };

  const renderSpecialNote = (menu) => {
    if (menu.category === "Literan") {
      return (
        <div className="mt-4 rounded-2xl bg-emerald-500/15 p-4 text-xs font-bold leading-6 text-emerald-200">
          Produk literan hanya tersedia di outlet utama.
        </div>
      );
    }

    if ((menu.name || "").toLowerCase().includes("donat")) {
      return (
        <div className="mt-4 rounded-2xl bg-yellow-500/15 p-4 text-xs font-bold leading-6 text-yellow-200">
          Donat saat ini tersedia di Cabang Stadion / Nagasakti, Cabang Rumbai,
          dan Cabang Hang Tuah Ujung.
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen px-8 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Menu & Harga</h1>
          <p className="mt-1 text-sm text-slate-300">
            Kelola data master menu Kopi Saka. Ketersediaan per rider/outlet
            diatur dari Monitoring Stok.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-[#103c2e] px-5 py-3">
          <MdRestaurantMenu className="text-xl text-emerald-300" />
          <span className="text-sm font-bold text-slate-200">
            Total Menu: {totalMenu}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <ResponsiveGrid>
          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#e7ddd0] text-[#06251c]"><MdRestaurantMenu /></div>}
            label="Total Menu"
            value={totalMenu}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#cce6dd] text-[#607f75]"><MdCheckCircle /></div>}
            label="Menu Aktif"
            value={activeMenu}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-[#e5eeee] text-[#607f75]"><MdInfo /></div>}
            label="Kategori"
            value={totalCategory}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg bg-red-100 text-red-600"><MdCancel /></div>}
            label="Nonaktif"
            value={nonActiveMenu}
            className="bg-white text-[#06251c]"
          />
        </ResponsiveGrid>
      </div>

      <div className="mb-6 rounded-3xl bg-[#f7f0e6] p-6 text-[#06251c]">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#06251c] text-white">
            <MdInfo />
          </div>

          <div>
            <h2 className="text-xl font-black">Informasi Daya Tahan Produk</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Semua produk Saka dibuat fresh di hari yang sama. Untuk produk cup,
              sebaiknya langsung diminum setelah dibeli. Untuk produk botol 500ml
              dan 1 liter, simpan di kulkas/chiller dan sebaiknya habiskan dalam
              1-2 hari. Jika disimpan di freezer, perkiraan daya tahan 2-3 hari.
              Jangan simpan produk terlalu lama di suhu ruang.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="saka-panel bg-[#f7f0e6] p-7 text-[#06251c]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
              <MdAdd className="text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-black">
                {editId ? "Edit Menu" : "Tambah Menu"}
              </h2>
              <p className="text-xs text-slate-500">
                Status Aktif/Nonaktif bukan stok, hanya status menu utama.
              </p>
            </div>
          </div>

          {notice.text && (
            <div
              className={`mb-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-bold leading-6 ${notice.type === "success"
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
                Nama Menu
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Kopi Susu Aren"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Kategori
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="Cup Series">Cup Series</option>
                <option value="Literan">Literan</option>
                <option value="Snack">Snack</option>
                <option value="Coffee">Coffee</option>
                <option value="Non Coffee">Non Coffee</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Harga Cup
                </label>
                <input
                  type="number"
                  name="cupPrice"
                  value={form.cupPrice}
                  onChange={handleChange}
                  placeholder="12000"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Harga 500 ML
                </label>
                <input
                  type="number"
                  name="price500"
                  value={form.price500}
                  onChange={handleChange}
                  placeholder="36000"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Harga 1 Liter
                </label>
                <input
                  type="number"
                  name="price1L"
                  value={form.price1L}
                  onChange={handleChange}
                  placeholder="70000"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Deskripsi Menu
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Tuliskan deskripsi singkat menu..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Foto Produk
              </label>

              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="/img/kopisusuaren.jpeg"
                className="mb-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              />

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-500 transition hover:border-[#06251c] hover:text-[#06251c]">
                <MdImage className="text-xl" />
                Pilih Nama File dari Komputer
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {form.image && (
                <div className="mt-3 overflow-hidden rounded-2xl bg-white">
                  <img
                    src={form.image}
                    alt="Preview produk"
                    className="h-36 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Status Menu
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#06251c]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Aktif berarti menu masih dijual secara umum. Stok per cabang
                tetap diatur dari Monitoring Stok.
              </p>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-3 text-sm font-black text-white transition hover:bg-[#103c2e]"
            >
              <MdAdd />
              {editId ? "Simpan Perubahan" : "Tambah Menu"}
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
              <h2 className="text-xl font-black">Daftar Menu Kopi Saka</h2>
              <p className="mt-1 text-xs text-slate-300">
                Data master menu ini diambil dari backend Laravel.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <MdSearch className="text-slate-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari menu..."
                className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl bg-white/5 p-8 text-center text-sm text-slate-400">
                Mengambil data menu dari backend...
              </div>
            ) : sortedMenus.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-8 text-center text-sm text-slate-400">
                Data menu tidak ditemukan.
              </div>
            ) : (
              paginatedMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="rounded-3xl bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <div className="flex flex-col gap-5 lg:flex-row">
                    <div className="h-32 w-full overflow-hidden rounded-3xl bg-white/10 lg:w-40">
                      {menu.image ? (
                        <img
                          src={menu.image}
                          alt={menu.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <MdStorefront className="text-4xl text-slate-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-white">
                              {menu.name}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-black ${menu.status === "Aktif"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                                }`}
                            >
                              {menu.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-bold text-emerald-300">
                            {menu.category}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(menu)}
                            className="rounded-full bg-white/10 p-2 text-slate-200 transition hover:bg-white hover:text-[#06251c]"
                          >
                            <MdEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(menu.id)}
                            className="rounded-full bg-red-500/20 p-2 text-red-300 transition hover:bg-red-500 hover:text-white"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {menu.description || "Belum ada deskripsi."}
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {renderPriceCards(menu)}
                      </div>

                      {renderSpecialNote(menu)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {sortedMenus.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <div className="mt-6 rounded-3xl bg-white/5 p-5">
            <h3 className="text-sm font-black text-white">Catatan Konsep</h3>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Halaman ini hanya mengatur data master menu. Ketersediaan menu di
              rider atau outlet akan ditentukan melalui data Monitoring Stok,
              bukan dari status menu di halaman ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}