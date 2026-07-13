import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  MdAccessTime,
  MdInfo,
  MdLocalCafe,
  MdLocationOn,
  MdOutlineRateReview,
  MdRestaurantMenu,
  MdSend,
  MdStar,
  MdStorefront,
  MdWarningAmber,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import api from "../../services/api";
import {
  enrichOutletWithMeta,
  findOutletUtama,
  getStatusBadge,
  isOutletUtama,
  parseOutletNote,
} from "../../utils/outletUtama";

const deliveryLinks = [
  {
    id: 1,
    name: "ShopeeFood",
    logo: "/img/shopeefood.jpg",
    link: "#",
  },
  {
    id: 2,
    name: "GrabFood",
    logo: "/img/grabfood.jpg",
    link: "#",
  },
  {
    id: 3,
    name: "GoFood",
    logo: "/img/gofood.jpg",
    link: "#",
  },
];

const defaultForm = {
  customerName: "",
  phone: "",
  branch: "",
  type: "Keluhan",
  category: "Pelayanan",
  rating: "5",
  message: "",
};

/* ── Reusable hook for per-slide scroll tracking ── */
function useSlideScroll(scrollRef, itemCount) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);

    // Find which child is closest to the center of the viewport
    const children = Array.from(el.children);
    if (children.length === 0) return;
    const center = scrollLeft + clientWidth / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    setActiveIndex(closestIdx);
  }, [scrollRef, itemCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateState();
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState]);

  const scrollTo = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    const nextIdx = Math.max(0, Math.min(children.length - 1, activeIndex + direction));
    const target = children[nextIdx];
    if (target) {
      el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [scrollRef, activeIndex]);

  const goTo = useCallback((idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    const target = children[idx];
    if (target) {
      el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [scrollRef]);

  return { activeIndex, canScrollLeft, canScrollRight, scrollTo, goTo };
}

/* ── Scroll Indicator (dark bg — for Lokasi section) ── */
function ScrollIndicator({ scrollRef, itemCount, label }) {
  const { activeIndex, canScrollLeft, canScrollRight, scrollTo, goTo } = useSlideScroll(scrollRef, itemCount);

  if (itemCount <= 1) return null;

  const maxDots = Math.min(itemCount, 9);
  const dots = [];
  for (let i = 0; i < maxDots; i++) {
    dots.push(itemCount <= 9 ? i : Math.round((i / (maxDots - 1)) * (itemCount - 1)));
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-5 sm:hidden">
      <button
        onClick={() => scrollTo(-1)}
        disabled={!canScrollLeft}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
          canScrollLeft ? "bg-white/15 text-white hover:bg-white/25 active:scale-90" : "bg-transparent text-white/20 cursor-default"
        }`}
        aria-label={`Geser ${label} ke kiri`}
      >
        <MdChevronLeft className="text-xl" />
      </button>

      <div className="flex items-center gap-1.5">
        {dots.map((dotIdx, i) => {
          const isActive = (itemCount <= 9 && dotIdx === activeIndex) ||
            (itemCount > 9 && i === dots.reduce((c, d, ci) => Math.abs(d - activeIndex) < Math.abs(dots[c] - activeIndex) ? ci : c, 0));
          return (
            <button
              key={i}
              onClick={() => goTo(dotIdx)}
              className={`rounded-full transition-all duration-300 ${
                isActive ? "h-2.5 w-6 bg-[#f8efe1]" : "h-2 w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Slide ${dotIdx + 1}`}
            />
          );
        })}
      </div>

      <button
        onClick={() => scrollTo(1)}
        disabled={!canScrollRight}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
          canScrollRight ? "bg-white/15 text-white hover:bg-white/25 active:scale-90" : "bg-transparent text-white/20 cursor-default"
        }`}
        aria-label={`Geser ${label} ke kanan`}
      >
        <MdChevronRight className="text-xl" />
      </button>
    </div>
  );
}

/* ── Scroll Indicator (light bg — for Menu sections) ── */
function ScrollIndicatorLight({ scrollRef, itemCount, label }) {
  const { activeIndex, canScrollLeft, canScrollRight, scrollTo, goTo } = useSlideScroll(scrollRef, itemCount);

  if (itemCount <= 1) return null;

  const maxDots = Math.min(itemCount, 9);
  const dots = [];
  for (let i = 0; i < maxDots; i++) {
    dots.push(itemCount <= 9 ? i : Math.round((i / (maxDots - 1)) * (itemCount - 1)));
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-5 sm:hidden">
      <button
        onClick={() => scrollTo(-1)}
        disabled={!canScrollLeft}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
          canScrollLeft ? "bg-[#06251c]/10 text-[#06251c] hover:bg-[#06251c]/20 active:scale-90" : "bg-transparent text-[#06251c]/20 cursor-default"
        }`}
        aria-label={`Geser ${label} ke kiri`}
      >
        <MdChevronLeft className="text-xl" />
      </button>

      <div className="flex items-center gap-1.5">
        {dots.map((dotIdx, i) => {
          const isActive = (itemCount <= 9 && dotIdx === activeIndex) ||
            (itemCount > 9 && i === dots.reduce((c, d, ci) => Math.abs(d - activeIndex) < Math.abs(dots[c] - activeIndex) ? ci : c, 0));
          return (
            <button
              key={i}
              onClick={() => goTo(dotIdx)}
              className={`rounded-full transition-all duration-300 ${
                isActive ? "h-2.5 w-6 bg-[#06251c]" : "h-2 w-2 bg-[#06251c]/25 hover:bg-[#06251c]/40"
              }`}
              aria-label={`Slide ${dotIdx + 1}`}
            />
          );
        })}
      </div>

      <button
        onClick={() => scrollTo(1)}
        disabled={!canScrollRight}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
          canScrollRight ? "bg-[#06251c]/10 text-[#06251c] hover:bg-[#06251c]/20 active:scale-90" : "bg-transparent text-[#06251c]/20 cursor-default"
        }`}
        aria-label={`Geser ${label} ke kanan`}
      >
        <MdChevronRight className="text-xl" />
      </button>
    </div>
  );
}

export default function CustomerPage() {
  const [menus, setMenus] = useState([]);
  const [locations, setLocations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(defaultForm);
  const [notice, setNotice] = useState("");

  // Scroll refs for indicators
  const cupScrollRef = useRef(null);
  const literanScrollRef = useRef(null);
  const snackScrollRef = useRef(null);
  const lokasiScrollRef = useRef(null);

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

  const formatDate = (value) => {
    if (!value) return new Date().toISOString().slice(0, 10);
    return String(value).slice(0, 10);
  };

  const normalizeMenuFromApi = (menu) => ({
    id: menu.id,
    name: menu.name || "",
    category: menu.category || "",
    cupPrice: menu.cup_price ?? menu.cupPrice ?? 0,
    price500: menu.price_500 ?? menu.price500 ?? 0,
    price1L: menu.price_1l ?? menu.price1L ?? 0,
    description: menu.description || "",
    image: menu.image || "",
    status: menu.status || "Aktif",
  });

  const normalizeLocationFromApi = (location) => {
    const meta = parseOutletNote(location.note);
    const utama = isOutletUtama(location);

    return {
      id: location.id,
      branch: location.branch || "",
      vehicle: location.vehicle || location.outletType || "Outlet",
      openTime: formatTime(location.open_time || location.openTime),
      closeTime: formatTime(location.close_time || location.closeTime),
      status: location.status || "Aktif",
      address: location.address || "",
      mapsLink: location.maps_link || location.mapsLink || "",
      note: location.note || "",
      whatsapp: meta.whatsapp || "",
      deskripsi: meta.deskripsi || "",
      produkLiteranTersedia: meta.produkLiteranTersedia !== false,
      donatTersedia: meta.donatTersedia !== false,
      isUtama: utama,
      display_status: utama
        ? location.status === "Beroperasi" || location.status === "Aktif"
          ? "Beroperasi"
          : "Tidak Beroperasi"
        : location.status === "Aktif" || location.status === "Beroperasi"
          ? "Buka"
          : location.status === "Istirahat"
            ? "Istirahat"
            : location.status === "Tutup"
              ? "Tutup"
              : location.status === "Pindah"
                ? "Pindah"
                : "Tidak Beroperasi",
    };
  };

  const normalizefeedbackFromApi = (feedback) => ({
    id: feedback.id,
    customerName:
      feedback.customer_name ||
      feedback.customerName ||
      feedback.name ||
      "Pelanggan",
    phone: feedback.phone || "",
    branch: feedback.branch || "-",
    type: feedback.type || "Review",
    category: feedback.category || feedback.type || "Review",
    rating: Number(feedback.rating || 5),
    message: feedback.message || "",
    status: feedback.status || "Pending",
    date: formatDate(feedback.feedback_date || feedback.date || feedback.created_at),
  });

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      const [menuResponse, outletResponse, feedbackResponse, stockResponse] =
        await Promise.all([
          api.get("/public/menus"),
          api.get("/public/outlets"),
          api.get("/public/feedback"),
          api.get("/public/stocks"),
        ]);

      const outletsData = toArray(outletResponse);
      const stocksData = toArray(stockResponse);

      const normalizedLocations = outletsData.map((outlet) =>
        normalizeLocationFromApi(outlet)
      );

      setMenus(toArray(menuResponse).map(normalizeMenuFromApi));
      setLocations(normalizedLocations);
      const feedbackData = toArray(feedbackResponse).map(normalizefeedbackFromApi);

      setFeedback(feedbackData);
      setStocks(stocksData);
    } catch (error) {
      setNotice(
        getErrorMessage(error, "Gagal mengambil data pelanggan dari backend.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  /* Menu IDs yang SEMUA outlet-nya menandai Tidak Tersedia → hide dari customer */
  const unavailableMenuIds = useMemo(() => {
    // Group stocks by menu_id
    const stocksByMenu = {};
    stocks.forEach((s) => {
      const menuId = s.menu_id || s.menu?.id;
      if (!menuId) return;
      if (!stocksByMenu[menuId]) stocksByMenu[menuId] = [];
      stocksByMenu[menuId].push(s);
    });

    const ids = new Set();
    Object.entries(stocksByMenu).forEach(([menuId, entries]) => {
      // Jika SEMUA entries untuk menu ini = Tidak Tersedia, hide menu
      const allUnavailable = entries.every(
        (e) => (e.stock_status || e.stockStatus) === "Tidak Tersedia"
      );
      if (allUnavailable) ids.add(Number(menuId));
    });
    return ids;
  }, [stocks]);

  const activeMenus = useMemo(() => {
    return menus.filter(
      (menu) =>
        menu.status === "Aktif" &&
        (menu.category === "Literan" || !unavailableMenuIds.has(menu.id))
    );
  }, [menus, unavailableMenuIds]);

  const cupMenus = activeMenus.filter((menu) => menu.category === "Cup Series");
  const literanMenus = activeMenus.filter((menu) => menu.category === "Literan");
  const snackMenus = activeMenus.filter((menu) => menu.category === "Snack");

  const shownfeedback = feedback;
  const outletUtama = useMemo(
    () => enrichOutletWithMeta(findOutletUtama(locations)),
    [locations]
  );

  const cabangLain = useMemo(
    () => locations.filter((location) => !location.isUtama),
    [locations]
  );

  const formatRupiah = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const statusClass = () => {
    return "bg-[#f8efe1] text-[#06251c]";
  };

  const renderStars = (rating = 5) => {
    const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <MdStar
            key={index}
            className={`text-lg ${index < safeRating ? "text-[#06251c]" : "text-slate-300"
              }`}
          />
        ))}
      </div>
    );
  };

  const renderPrice = (menu) => {
    if (menu.category === "Snack") {
      return Number(menu.cupPrice) > 0 ? formatRupiah(menu.cupPrice) : "-";
    }

    if (menu.category === "Literan") {
      return (
        <div className="space-y-1">
          {Number(menu.price500) > 0 && (
            <p>500ml: {formatRupiah(menu.price500)}</p>
          )}
          {Number(menu.price1L) > 0 && (
            <p>1 Liter: {formatRupiah(menu.price1L)}</p>
          )}
        </div>
      );
    }

    return Number(menu.cupPrice) > 0 ? formatRupiah(menu.cupPrice) : "-";
  };

  const getOutletMenus = (outletId) => {
    const outletStocks = stocks.filter((s) => s.outlet_id === outletId);
    const available = [];
    const unavailable = [];
    outletStocks.forEach((s) => {
      const menuId = s.menu_id || s.menu?.id;
      const menu = menus.find((m) => m.id === menuId);
      if (menu && menu.status === "Aktif") {
        const isAvailable =
          (s.stock_status || s.stockStatus) !== "Tidak Tersedia";
        if (isAvailable) {
          if (!available.includes(menu.name)) available.push(menu.name);
        } else {
          if (!unavailable.includes(menu.name)) unavailable.push(menu.name);
        }
      }
    });
    return { available, unavailable };
  };

  const renderMenuCard = (menu) => {
    const isLiteran = menu.category === "Literan";
    const isDonat = (menu.name || "").toLowerCase().includes("donat");

    // Look up availability status for Literan products
    const literanStock = stocks.find(
      (s) => s.menu_id === menu.id || s.menu?.id === menu.id
    );
    const literanStatus =
      literanStock?.stock_status ||
      literanStock?.stockStatus ||
      "Tersedia";
    const isLiteranAvailable = literanStatus === "Tersedia";

    return (
      <div
        key={menu.id}
        className="group flex w-[calc(100vw-3rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[2rem] bg-white text-[#06251c] shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-full sm:max-w-none"
      >
        <div className="relative bg-[#f8efe1] p-4">
          <div className="absolute left-4 top-4 z-10 rounded-full bg-[#06251c] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white">
            {menu.category}
          </div>

          {isLiteran && (
            <div
              className={`absolute right-4 top-4 z-10 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border ${isLiteranAvailable
                ? "bg-emerald-500/20 text-emerald-800 border-emerald-500/30"
                : "bg-red-500/20 text-red-800 border-red-500/30"
                }`}
            >
              {literanStatus}
            </div>
          )}

          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-white p-3">
            {menu.image ? (
              <img
                src={menu.image}
                alt={menu.name}
                className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              />
            ) : (
              <MdLocalCafe className="text-5xl text-slate-300" />
            )}
          </div>
        </div>

        <div className="flex h-full flex-col p-5">
          <h3 className="text-xl font-black line-clamp-1">{menu.name}</h3>

          <p className="mt-2 flex-grow text-xs leading-5 text-slate-600 line-clamp-2">
            {menu.description || "Belum ada deskripsi."}
          </p>

          <div className="mt-5 flex justify-center border-t border-slate-100 pt-5">
            <div className="inline-flex min-w-[140px] flex-col items-center justify-center rounded-2xl bg-[#f8efe1] px-5 py-3 text-[#06251c] shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#06251c]/60">
                Harga
              </p>
              <div className="mt-1 text-sm font-black sm:text-base">{renderPrice(menu)}</div>
            </div>
          </div>

          {isLiteran && (
            <div className="mt-4 rounded-xl bg-[#f8efe1] p-3 text-[10px] font-bold leading-5 text-[#06251c]">
              Tersedia hanya di Outlet Utama.
            </div>
          )}

          {isDonat && (
            <div className="mt-4 rounded-xl bg-[#f8efe1] p-3 text-[10px] font-bold leading-5 text-[#06251c]">
              Tersedia di Cabang Stadion/Nagasakti, Rumbai, dan Hang Tuah Ujung.
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitfeedback = async (e) => {
    e.preventDefault();

    if (!form.customerName || !form.phone || !form.message) {
      setNotice("Nama, nomor WhatsApp, dan isi pesan wajib diisi.");
      return;
    }

    const payload = {
      customer_name: form.customerName,
      customerName: form.customerName,
      name: form.customerName,
      phone: form.phone,
      branch: form.branch || "-",
      type: form.type,
      category: form.category,
      rating: Number(form.rating || 5),
      message: form.message,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      await api.post("/public/feedback", payload);

      setForm(defaultForm);
      setNotice("Terima kasih, pesan kamu berhasil dikirim.");

      fetchCustomerData();
    } catch (error) {
      setNotice(getErrorMessage(error, "Gagal mengirim pesan pelanggan."));
    }
  };

  return (
    <div className="min-h-screen bg-[#06251c] text-white">
      <div className="h-4 saka-checker-strip" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06251c]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:px-6 md:py-5">
          <a href="#" className="flex shrink-0 items-center gap-3">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-[0.35em]">
                SAKA<span className="text-[#f8efe1]">.</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
                On The Road
              </p>
            </div>
          </a>

          <nav className="flex items-center justify-center gap-2 w-full pb-1 md:gap-3 md:pb-0">
            <a
              href="#menu"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[#f8efe1] px-5 py-2 text-xs font-black text-[#06251c] shadow-lg transition hover:bg-white sm:px-6 sm:text-sm"
            >
              Lihat Menu
            </a>
            <a
              href="#lokasi"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[#f8efe1] px-5 py-2 text-xs font-black text-[#06251c] shadow-lg transition hover:bg-white sm:px-6 sm:text-sm"
            >
              Cek Lokasi
            </a>
            <a
              href="#keluhan"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[#f8efe1] px-5 py-2 text-xs font-black text-[#06251c] shadow-lg transition hover:bg-white sm:px-6 sm:text-sm"
            >
              Kirim Masukan
            </a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        {/* Soft decorative floating shapes - Branding Identity */}
        <div className="absolute -left-10 top-10 h-32 w-32 rotate-12 rounded-[2rem] border-[8px] border-white/5 opacity-50 sm:h-40 sm:w-40 sm:border-[10px]" />
        <div className="absolute -right-20 top-40 h-56 w-56 -rotate-12 rounded-[3rem] border-[12px] border-white/5 opacity-50 sm:h-64 sm:w-64" />
        <div className="absolute left-1/3 top-2/3 h-16 w-16 rotate-45 rounded-xl border-[6px] border-[#f8efe1]/5" />

        <div className="absolute -left-24 top-20 hidden h-72 w-72 rounded-full bg-white/5 blur-3xl lg:block" />
        <div className="absolute -right-24 top-32 hidden h-96 w-96 rounded-full bg-white/5 blur-3xl lg:block" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 lg:mb-6">
              <MdStar className="text-[#f8efe1]" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#f8efe1] lg:text-xs">
                Fresh Daily Coffee
              </p>
            </div>

            <h2 className="text-4xl font-black leading-tight md:text-5xl lg:text-7xl">
              Kopi keliling, rasa fresh, dekat dari kamu.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 lg:mt-6 lg:text-base lg:leading-8">
              Cek menu, lokasi outlet, status operasional, dan ketersediaan
              produk SAKA On The Road langsung dari satu halaman.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-2 lg:mt-10 lg:gap-3">
              <div className="rounded-2xl bg-white/5 p-4 text-center lg:rounded-3xl lg:p-5 lg:text-left">
                <p className="text-2xl font-black lg:text-3xl">{activeMenus.length}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400 lg:text-xs">
                  Menu
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-center lg:rounded-3xl lg:p-5 lg:text-left">
                <p className="text-2xl font-black lg:text-3xl">{locations.length}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400 lg:text-xs">Lokasi</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-center lg:rounded-3xl lg:p-5 lg:text-left">
                <p className="text-xl font-black lg:text-3xl">Fresh</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400 lg:text-xs">
                  Tiap Hari
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-[3rem] bg-[#f8efe1] p-5 text-[#06251c] shadow-2xl">
              <div className="flex min-h-[520px] items-center justify-center overflow-hidden rounded-[2.5rem] bg-[#06251c]">
                <img
                  src="/img/login-bg.jpeg"
                  alt="SAKA On The Road"
                  className="h-full max-h-[520px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="menu"
        className="rounded-t-[3rem] bg-[#f8efe1] px-6 py-16 text-[#06251c]"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#06251c]/70">
                Our Menu
              </p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Menu Kopi Saka
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Pilih menu favorit kamu. Informasi menu diambil dari data admin.
              </p>
            </div>

            <div className="rounded-full bg-[#06251c] px-5 py-3 text-sm font-black text-white">
              {activeMenus.length} Menu Tersedia
            </div>
          </div>

          {loading && (
            <div className="mb-10 rounded-[2rem] bg-white p-6 text-center text-sm font-bold text-slate-600">
              Mengambil data dari backend...
            </div>
          )}

          {cupMenus.length > 0 && (
            <div className="mb-14">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                  <MdLocalCafe />
                </div>
                <h3 className="text-2xl font-black">Cup Series</h3>
              </div>

              <div ref={cupScrollRef} className="flex gap-4 overflow-x-auto px-1 pb-6 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4">
                {cupMenus.map(renderMenuCard)}
              </div>
              <ScrollIndicatorLight scrollRef={cupScrollRef} itemCount={cupMenus.length} label="Cup Series" />
            </div>
          )}

          {literanMenus.length > 0 && (
            <div className="mb-14">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                  <MdStorefront />
                </div>
                <h3 className="text-2xl font-black">Literan</h3>
              </div>

              <div className="mb-7 flex items-start gap-3 rounded-[2rem] bg-white p-5 text-sm font-bold leading-7 text-[#06251c]">
                <MdInfo className="mt-1 shrink-0 text-xl" />
                <p>
                  Produk literan hanya tersedia di outlet utama. Simpan di
                  kulkas/chiller dan sebaiknya habiskan dalam 1-2 hari.
                </p>
              </div>

              <div ref={literanScrollRef} className="flex gap-4 overflow-x-auto px-1 pb-6 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4">
                {literanMenus.map(renderMenuCard)}
              </div>
              <ScrollIndicatorLight scrollRef={literanScrollRef} itemCount={literanMenus.length} label="Literan" />
            </div>
          )}

          {snackMenus.length > 0 && (
            <div className="mb-14">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06251c] text-white">
                  <MdRestaurantMenu />
                </div>
                <h3 className="text-2xl font-black">Snack</h3>
              </div>

              <div className="mb-7 flex items-start gap-3 rounded-[2rem] bg-white p-5 text-sm font-bold leading-7 text-[#06251c]">
                <MdInfo className="mt-1 shrink-0 text-xl" />
                <p>
                  Donat saat ini tersedia di Cabang Stadion / Nagasakti, Cabang
                  Rumbai, dan Cabang Hang Tuah Ujung. Ketersediaan dapat berubah
                  mengikuti kebijakan outlet.
                </p>
              </div>

              <div ref={snackScrollRef} className="flex gap-4 overflow-x-auto px-1 pb-6 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4">
                {snackMenus.map(renderMenuCard)}
              </div>
              <ScrollIndicatorLight scrollRef={snackScrollRef} itemCount={snackMenus.length} label="Snack" />
            </div>
          )}

          <div className="mt-16 rounded-[2.5rem] bg-white p-7 shadow-xl">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#06251c]/70">
                Delivery Link
              </p>
              <h3 className="mt-2 text-3xl font-black">
                Temukan SAKA di aplikasi delivery
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Link ShopeeFood, GrabFood, dan GoFood bisa ditambahkan saat link
                resmi dari owner sudah tersedia.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {deliveryLinks.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between gap-4 rounded-[2rem] border border-slate-100 bg-[#f8efe1] p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white">
                      <img
                        src={app.logo}
                        alt={app.name}
                        className="h-12 w-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-lg font-black">{app.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Link akan ditambahkan
                      </p>
                    </div>
                  </div>

                  <a
                    href={app.link}
                    className="rounded-full bg-[#06251c] px-4 py-2 text-xs font-black text-white"
                  >
                    Link
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="lokasi" className="bg-[#06251c] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#f8efe1]">
              Outlet Location
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Lokasi SAKA
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Pilih cabang terdekat dan cek status operasional outlet.
            </p>
          </div>

          {outletUtama && (
            <div className="mb-8 max-w-full">
              {(() => {
                const status = getStatusBadge(outletUtama.displayStatus);

                return (
                  <div className="mx-auto max-w-3xl rounded-[2rem] border-2 border-[#f8efe1]/30 bg-[#f8efe1] p-6 text-[#06251c] shadow-2xl sm:p-8">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06251c] text-2xl text-white">
                        <MdStorefront />
                      </div>
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-black ${status.badgeClass
                          }`}
                      >
                        {status.emoji} {status.label}
                      </span>
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                      Outlet Utama
                    </p>
                    <h3 className="mt-2 text-2xl font-black uppercase sm:text-3xl">
                      {outletUtama.branch}
                    </h3>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                      <MdAccessTime />
                      <span>
                        {outletUtama.openTime || "-"} - {outletUtama.closeTime || "-"}
                      </span>
                    </div>

                    {outletUtama.address && outletUtama.address !== "-" && (
                      <p className="mt-4 break-words text-sm leading-6 text-slate-600">
                        📌 {outletUtama.address}
                      </p>
                    )}

                    {outletUtama.deskripsi && (
                      <p className="mt-4 text-sm leading-6 text-slate-500">
                        {outletUtama.deskripsi}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
                      <span>☕ Menu Tersedia</span>
                      {outletUtama.produkLiteranTersedia && <span>🥤 Produk Literan</span>}
                      {outletUtama.donatTersedia && <span>🍩 Donat</span>}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      {outletUtama.mapsLink ? (
                        <a
                          href={outletUtama.mapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[#06251c] px-5 py-3 text-sm font-black text-white transition hover:bg-[#103c2e]"
                        >
                          <MdLocationOn />
                          Buka Maps
                        </a>
                      ) : (
                        <div className="flex-1 rounded-full bg-white/60 px-5 py-3 text-center text-sm font-bold text-slate-500">
                          Link maps belum tersedia
                        </div>
                      )}

                      {outletUtama.whatsapp && (
                        <a
                          href={`https://wa.me/${String(outletUtama.whatsapp).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border-2 border-[#06251c] px-5 py-3 text-sm font-black text-[#06251c] transition hover:bg-[#06251c] hover:text-white"
                        >
                          WhatsApp Outlet
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div ref={lokasiScrollRef} className="flex gap-4 overflow-x-auto px-1 pb-8 pt-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0 xl:pb-0">
            {cabangLain.map((location) => (
              <div
                key={location.id}
                className="flex w-[calc(100vw-3rem)] shrink-0 snap-center flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-white/10 sm:w-[360px] xl:w-auto xl:shrink xl:flex-none"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8efe1] text-2xl text-[#06251c]">
                    <MdStorefront />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                      location.display_status
                    )}`}
                  >
                    {location.display_status || "Tidak Beroperasi"}
                  </span>
                </div>

                <h3 className="text-xl font-black">{location.branch}</h3>

                <p className="mt-2 text-sm font-bold text-[#f8efe1]">
                  {location.vehicle || location.outletType || "Outlet"}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                  <MdAccessTime />
                  <span>
                    {location.openTime || "-"} - {location.closeTime || "-"}
                  </span>
                </div>

                {location.address && location.address !== "-" && (
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {location.address}
                  </p>
                )}

                <div className="mt-6 border-t border-white/10 pt-5">
                  {(() => {
                    const { available, unavailable } = getOutletMenus(location.id);
                    if (available.length === 0 && unavailable.length === 0) {
                      return <p className="text-sm text-slate-400">Belum ada data menu.</p>;
                    }
                    return (
                      <div className="space-y-4">
                        {available.length > 0 && (
                          <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#f8efe1]">Menu Tersedia:</p>
                            <ul className="space-y-2 text-sm">
                              {available.map((m, i) => (
                                <li key={i} className="flex items-start gap-2 text-white">
                                  <span>✅</span> <span className="leading-5">{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {unavailable.length > 0 && (
                          <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menu Tidak Tersedia:</p>
                            <ul className="space-y-2 text-sm">
                              {unavailable.map((m, i) => (
                                <li key={i} className="flex items-start gap-2 text-white/50">
                                  <span>❌</span> <span className="leading-5">{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {location.mapsLink ? (
                  <a
                    href={location.mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f8efe1] px-5 py-3 text-sm font-black text-[#06251c] transition hover:bg-white"
                  >
                    <MdLocationOn />
                    Buka Maps
                  </a>
                ) : (
                  <div className="mt-6 rounded-full bg-white/5 px-5 py-3 text-center text-sm font-bold text-slate-400">
                    Link maps belum tersedia
                  </div>
                )}
              </div>
            ))}
          </div>
          <ScrollIndicator scrollRef={lokasiScrollRef} itemCount={cabangLain.length} label="Lokasi" />
        </div>
      </section>

      <section
        id="keluhan"
        className="rounded-t-[3rem] bg-[#f8efe1] px-6 py-16 text-[#06251c]"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center">
          {/* HEADER SECTION */}
          <div className="mb-10 max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#06251c]/70">
              Hubungi Kami
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Ruang SA-KA <br className="hidden sm:block" /> (Saling Kabar)
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Kami mendengar setiap masukan. Ceritakan pengalaman Anda agar kami
              bisa terus berkembang.
            </p>
          </div>

          {/* FORM KIRIM MASUKAN */}
          <form
            onSubmit={handleSubmitfeedback}
            className="mb-16 w-full max-w-[800px] rounded-[2.5rem] bg-[#06251c] p-7 text-white shadow-2xl sm:p-10"
          >
            <h3 className="text-2xl font-black">Kirim Pesan</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Isi form berikut untuk mengirim keluhan atau masukan.
            </p>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Nama pelanggan"
                className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#06251c] outline-none"
              />

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nomor WhatsApp"
                className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#06251c] outline-none"
              />

              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#06251c] outline-none"
              >
                <option value="">Pilih lokasi/cabang</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.branch}>
                    {location.branch}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#06251c] outline-none"
                >
                  <option value="Keluhan">Keluhan</option>
                  <option value="Masukan">Masukan</option>
                  <option value="Review">Review</option>
                </select>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#06251c] outline-none"
                >
                  <option value="Pelayanan">Pelayanan</option>
                  <option value="Stok Habis">Stok Habis</option>
                  <option value="Rasa Minuman">Rasa Minuman</option>
                  <option value="Driver">Driver</option>
                  <option value="Lokasi">Lokasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>

                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#06251c] outline-none md:col-span-2"
                >
                  <option value="5">★★★★★ - Sangat Puas</option>
                  <option value="4">★★★★☆ - Puas</option>
                  <option value="3">★★★☆☆ - Cukup</option>
                  <option value="2">★★☆☆☆ - Kurang</option>
                  <option value="1">★☆☆☆☆ - Tidak Puas</option>
                </select>
              </div>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tulis keluhan atau masukan..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-[#06251c] outline-none"
              />

              {notice && (
                <div className="flex items-start gap-2 rounded-2xl bg-[#f8efe1] px-4 py-3 text-xs font-bold leading-6 text-[#06251c]">
                  <MdWarningAmber className="mt-1 shrink-0" />
                  <span>{notice}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f8efe1] py-4 text-sm font-black text-[#06251c] transition hover:bg-white"
              >
                <MdSend />
                Kirim Pesan
              </button>
            </div>
          </form>

          {/* REVIEW PELANGGAN */}
          <div className="w-full max-w-[1000px]">
            <h3 className="mb-8 flex items-center justify-center gap-2 text-2xl font-black text-[#06251c]">
              <MdOutlineRateReview />
              Review Pelanggan
            </h3>

            {shownfeedback.length === 0 ? (
              <p className="text-center text-sm leading-6 text-slate-500">
                Belum ada review yang ditampilkan oleh admin.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {shownfeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="flex h-full flex-col justify-between rounded-[2rem] bg-white p-6 shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-[#06251c] line-clamp-1">
                            {feedback.customerName || feedback.customer_name || "Pelanggan"}
                          </p>
                          <p className="mt-1 text-[10px] font-bold text-slate-500 line-clamp-1 sm:text-xs">
                            {feedback.branch && feedback.branch !== "-"
                              ? feedback.branch
                              : "Pelanggan SAKA"}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {renderStars(feedback.rating || 5)}
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-6 text-slate-600 line-clamp-4 sm:text-sm sm:leading-7">
                        “{feedback.message || feedback.pesan}”
                      </p>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="inline-flex rounded-full bg-[#f8efe1] px-4 py-2 text-[10px] font-black text-[#06251c] sm:text-xs">
                        {feedback.category || "Review"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#06251c] px-6 py-8 text-center text-xs font-bold text-slate-400">
        © 2026 SAKA On The Road. Prototype sistem informasi pelanggan.
      </footer>
    </div>
  );
}