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
} from "react-icons/md";

const MENU_DATA_VERSION = "saka-menu-admin-final-v2";

const defaultMenus = [
  {
    id: 1,
    name: "Kopi Susu Aren",
    category: "Cup Series",
    cupPrice: 12000,
    price500: 0,
    price1L: 0,
    description:
      "Kopi susu aren khas Saka dengan rasa creamy, manis, dan cocok untuk diminum santai.",
    image: "/img/kopisusuaren.jpeg",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Es Kopi Susu",
    category: "Cup Series",
    cupPrice: 10000,
    price500: 0,
    price1L: 0,
    description:
      "Es kopi susu klasik dengan rasa ringan, segar, dan cocok untuk diminum harian.",
    image: "/img/kopisusu.jpeg",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Coklat Susu Aren",
    category: "Cup Series",
    cupPrice: 12000,
    price500: 0,
    price1L: 0,
    description:
      "Minuman coklat susu aren dengan rasa manis, lembut, dan creamy untuk pelanggan non coffee.",
    image: "/img/coklatsusuaren.jpeg",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Pinky Milky",
    category: "Cup Series",
    cupPrice: 10000,
    price500: 0,
    price1L: 0,
    description:
      "Minuman susu manis berwarna pink dengan rasa lembut, segar, dan cocok untuk pelanggan yang tidak minum kopi.",
    image: "/img/pinkymilky.jpeg",
    status: "Aktif",
  },
  {
    id: 5,
    name: "Creamy Butterscotch",
    category: "Cup Series",
    cupPrice: 13000,
    price500: 0,
    price1L: 0,
    description:
      "Minuman creamy dengan rasa butterscotch yang manis, lembut, dan terasa premium.",
    image: "img/butterscotch.jpeg",
    status: "Aktif",
  },
  {
    id: 6,
    name: "Kopi Susu Aren Literan",
    category: "Literan",
    cupPrice: 0,
    price500: 36000,
    price1L: 70000,
    description:
      "Kopi susu aren dalam kemasan botol 500ml dan 1 liter. Cocok untuk stok minuman di rumah, kantor, atau acara kecil.",
    image: "/img/kopisusuaren1L.jpeg",
    status: "Aktif",
  },
  {
    id: 7,
    name: "Es Kopi Susu Literan",
    category: "Literan",
    cupPrice: 0,
    price500: 33000,
    price1L: 65000,
    description:
      "Es kopi susu dalam kemasan botol 500ml dan 1 liter dengan rasa ringan dan segar.",
    image: "/img/kopisusu1L.jpeg",
    status: "Aktif",
  },
  {
    id: 8,
    name: "Coklat Susu Aren Literan",
    category: "Literan",
    cupPrice: 0,
    price500: 36000,
    price1L: 70000,
    description:
      "Coklat susu aren dalam kemasan botol 500ml dan 1 liter. Cocok untuk pelanggan yang ingin minuman non coffee ukuran besar.",
    image: "/img/coklatsusuaren1L.jpeg",
    status: "Aktif",
  },
  {
    id: 9,
    name: "Pinky Milky Literan",
    category: "Literan",
    cupPrice: 0,
    price500: 33000,
    price1L: 65000,
    description:
      "Pinky Milky dalam kemasan botol 500ml dan 1 liter. Rasanya manis, lembut, dan cocok untuk pelanggan non coffee.",
    image: "/img/pinkmilky1L.jpeg",
    status: "Aktif",
  },
  {
    id: 10,
    name: "Creamy Butterscotch Literan",
    category: "Literan",
    cupPrice: 0,
    price500: 39000,
    price1L: 78000,
    description:
      "Creamy Butterscotch dalam kemasan botol 500ml dan 1 liter dengan rasa manis, creamy, dan premium.",
    image: "/img/butterscotch1L.jpeg",
    status: "Aktif",
  },
  {
    id: 11,
    name: "Donat",
    category: "Snack",
    cupPrice: 15000,
    price500: 0,
    price1L: 0,
    description:
      "Donat Saka sebagai menu pendamping minuman. Produk ini hanya tersedia di beberapa cabang tertentu.",
    image: "/img/donat.jpeg",
    status: "Aktif",
  },
];

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
  const [menus, setMenus] = useState(() => {
    const savedVersion = localStorage.getItem("saka_menus_version");

    if (savedVersion !== MENU_DATA_VERSION) {
      return defaultMenus;
    }

    const saved = localStorage.getItem("saka_menus");

    if (!saved) return defaultMenus;

    try {
      const parsed = JSON.parse(saved);

      return parsed.map((item) => ({
        id: item.id || Date.now(),
        name: item.name || "",
        category: item.category || "Cup Series",
        cupPrice: item.cupPrice ?? "",
        price500: item.price500 ?? "",
        price1L: item.price1L ?? "",
        description: item.description || "",
        image: item.image || "",
        status:
          item.status === "Tersedia" || item.status === "Aktif"
            ? "Aktif"
            : item.status === "Habis" || item.status === "Tidak Tersedia"
              ? "Nonaktif"
              : item.status || "Aktif",
      }));
    } catch (error) {
      localStorage.removeItem("saka_menus");
      return defaultMenus;
    }
  });

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    localStorage.setItem("saka_menus", JSON.stringify(menus));
    localStorage.setItem("saka_menus_version", MENU_DATA_VERSION);
  }, [menus]);

  const showNotice = (type, text) => {
    setNotice({ type, text });

    setTimeout(() => {
      setNotice({ type: "", text: "" });
    }, 3500);
  };

  const filteredMenus = menus.filter((menu) => {
    const keyword = search.toLowerCase();

    return (
      (menu.name || "").toLowerCase().includes(keyword) ||
      (menu.category || "").toLowerCase().includes(keyword) ||
      (menu.description || "").toLowerCase().includes(keyword) ||
      (menu.status || "").toLowerCase().includes(keyword)
    );
  });

  const totalMenu = menus.length;
  const activeMenu = menus.filter((menu) => menu.status === "Aktif").length;
  const nonActiveMenu = menus.filter((menu) => menu.status === "Nonaktif").length;

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

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const menuData = {
      name: form.name,
      category: form.category,
      cupPrice: Number(form.cupPrice || 0),
      price500: Number(form.price500 || 0),
      price1L: Number(form.price1L || 0),
      description: form.description || "Belum ada deskripsi.",
      image: form.image,
      status: form.status,
    };

    if (editId) {
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === editId
            ? {
              ...menu,
              ...menuData,
            }
            : menu
        )
      );

      showNotice("success", "Data menu berhasil diperbarui.");
    } else {
      setMenus((prev) => [
        {
          id: Date.now(),
          ...menuData,
        },
        ...prev,
      ]);

      showNotice("success", "Menu baru berhasil ditambahkan.");
    }

    resetForm();
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

  const handleDelete = (id) => {
    setMenus((prev) => prev.filter((menu) => menu.id !== id));
    showNotice("success", "Menu berhasil dihapus.");
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
          Donat hanya tersedia Outlet utama, cabang nagasakti, cabang rumbai, dan cabang hang tuah ujung.
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

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Total Menu
          </p>
          <h2 className="mt-3 text-4xl font-black">{totalMenu}</h2>
        </div>

        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Menu Aktif
          </p>
          <h2 className="mt-3 text-4xl font-black">{activeMenu}</h2>
        </div>

        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Kategori
          </p>
          <h2 className="mt-3 text-4xl font-black">{totalCategory}</h2>
        </div>

        <div className="saka-card bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Nonaktif
          </p>
          <h2 className="mt-3 text-4xl font-black">{nonActiveMenu}</h2>
        </div>
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
              Jangan simpan produk terlalu lama di suhu ruang. Jika pelanggan
              masih bingung, arahkan untuk bertanya lewat WhatsApp Saka.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
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

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-500 transition hover:border-[#06251c] hover:text-[#06251c]">
                <MdImage className="text-xl" />
                Upload Foto Produk
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
                Data master menu ini akan digunakan untuk tampilan pelanggan.
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
            {filteredMenus.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-8 text-center text-sm text-slate-400">
                Data menu tidak ditemukan.
              </div>
            ) : (
              filteredMenus.map((menu) => (
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