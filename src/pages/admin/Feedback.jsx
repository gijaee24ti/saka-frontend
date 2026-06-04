import { useEffect, useState } from "react";
import {
  MdDelete,
  MdFeedback,
  MdSearch,
  MdStar,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

const defaultFeedbacks = [
  {
    id: 1,
    customerName: "Aditra Rahman",
    type: "Review",
    rating: 5,
    message: "Kopinya enak, pelayanan cepat, dan rider ramah.",
    status: "Ditampilkan",
    date: "2026-05-29",
  },
  {
    id: 2,
    customerName: "Isfi Ansyah",
    type: "Keluhan",
    rating: 3,
    message: "Pesanan datang agak lama di cabang Greenwich Station.",
    status: "Pending",
    date: "2026-05-29",
  },
  {
    id: 3,
    customerName: "Raka Dimas",
    type: "Masukan",
    rating: 4,
    message: "Menu creamy butterscotch enak, mungkin bisa tambah ukuran cup besar.",
    status: "Ditampilkan",
    date: "2026-05-28",
  },
  {
    id: 4,
    customerName: "Nabila Putri",
    type: "Keluhan",
    rating: 2,
    message: "Minuman kurang dingin saat diterima.",
    status: "Disembunyikan",
    date: "2026-05-28",
  },
];

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem("saka_feedbacks");
    return saved ? JSON.parse(saved) : defaultFeedbacks;
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  useEffect(() => {
    localStorage.setItem("saka_feedbacks", JSON.stringify(feedbacks));
  }, [feedbacks]);

  const filteredFeedbacks = feedbacks.filter((item) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      item.customerName.toLowerCase().includes(keyword) ||
      item.type.toLowerCase().includes(keyword) ||
      item.message.toLowerCase().includes(keyword) ||
      item.status.toLowerCase().includes(keyword);

    const matchStatus =
      filterStatus === "Semua" ? true : item.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const totalFeedbacks = feedbacks.length;
  const pendingFeedbacks = feedbacks.filter(
    (item) => item.status === "Pending"
  ).length;
  const shownFeedbacks = feedbacks.filter(
    (item) => item.status === "Ditampilkan"
  ).length;
  const hiddenFeedbacks = feedbacks.filter(
    (item) => item.status === "Disembunyikan"
  ).length;

  const handleChangeStatus = (id, status) => {
    setFeedbacks((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            status,
          }
          : item
      )
    );
  };

  const handleDelete = (id) => {
    const confirmDelete = confirm("Yakin mau hapus review/keluhan ini?");

    if (confirmDelete) {
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const statusClass = (status) => {
    if (status === "Ditampilkan") return "bg-green-500/25 text-green-300";
    if (status === "Pending") return "bg-yellow-500/25 text-yellow-300";
    return "bg-red-500/25 text-red-300";
  };

  const typeClass = (type) => {
    if (type === "Review") return "bg-green-100 text-green-700";
    if (type === "Masukan") return "bg-blue-100 text-blue-700";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <div className="min-h-screen px-8 py-8 text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Keluhan & Review</h1>
          <p className="mt-1 text-sm text-slate-300">
            Kelola keluhan, masukan, dan review pelanggan sebelum ditampilkan ke halaman pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-[#103c2e] px-5 py-3">
          <MdFeedback className="text-xl text-emerald-300" />
          <span className="text-sm font-bold text-slate-200">
            Total Feedback: {totalFeedbacks}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Total
          </p>
          <h2 className="mt-3 text-4xl font-black">{totalFeedbacks}</h2>
        </div>

        <div className="rounded-3xl bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Pending
          </p>
          <h2 className="mt-3 text-4xl font-black">{pendingFeedbacks}</h2>
        </div>

        <div className="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            Ditampilkan
          </p>
          <h2 className="mt-3 text-4xl font-black">{shownFeedbacks}</h2>
        </div>

        <div className="rounded-3xl bg: bg-white p-6 text-[#06251c]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
            Disembunyikan
          </p>
          <h2 className="mt-3 text-4xl font-black">{hiddenFeedbacks}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-3xl bg-[#103c2e] p-7 shadow-lg">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black">Daftar Keluhan & Review</h2>
            <p className="mt-1 text-xs text-slate-300">
              Hanya feedback dengan status “Ditampilkan” yang nanti muncul di halaman pelanggan.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white outline-none"
            >
              <option className="text-black" value="Semua">
                Semua Status
              </option>
              <option className="text-black" value="Pending">
                Pending
              </option>
              <option className="text-black" value="Ditampilkan">
                Ditampilkan
              </option>
              <option className="text-black" value="Disembunyikan">
                Disembunyikan
              </option>
            </select>

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <MdSearch className="text-slate-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari feedback..."
                className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredFeedbacks.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400 xl:col-span-2">
              Data feedback tidak ditemukan.
            </div>
          ) : (
            filteredFeedbacks.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-[#06251c] p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${typeClass(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">
                      {item.customerName}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">{item.date}</p>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                      <MdStar
                        key={index}
                        className={
                          index < item.rating
                            ? "text-yellow-400"
                            : "text-slate-600"
                        }
                      />
                    ))}
                  </div>
                </div>

                <p className="min-h-[70px] text-sm leading-6 text-slate-300">
                  {item.message}
                </p>

                <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleChangeStatus(item.id, e.target.value)
                    }
                    className={`rounded-full px-4 py-2 text-xs font-black outline-none ${statusClass(
                      item.status
                    )}`}
                  >
                    <option className="text-black" value="Pending">
                      Pending
                    </option>
                    <option className="text-black" value="Ditampilkan">
                      Ditampilkan
                    </option>
                    <option className="text-black" value="Disembunyikan">
                      Disembunyikan
                    </option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleChangeStatus(item.id, "Ditampilkan")
                      }
                      className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-xs font-black text-green-300 hover:bg-green-500 hover:text-white"
                    >
                      <MdVisibility />
                      Tampilkan
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleChangeStatus(item.id, "Disembunyikan")
                      }
                      className="flex items-center gap-2 rounded-full bg-yellow-500/20 px-4 py-2 text-xs font-black text-yellow-300 hover:bg-yellow-500 hover:text-white"
                    >
                      <MdVisibilityOff />
                      Sembunyikan
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-full bg-red-500/20 p-2 text-red-300 hover:bg-red-500 hover:text-white"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}