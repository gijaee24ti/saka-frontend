import { useEffect, useState } from "react";
import {
  MdDelete,
  MdFeedback,
  MdSearch,
  MdStar,
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import api from "../../services/api";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import ResponsiveGrid from "../../components/ResponsiveGrid";
import { showAlert, showToast } from "../../utils/notification";
export default function Feedback() {
  const [feedback, setfeedback] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
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


  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 10);
  };

  const normalizefeedbackFromApi = (item) => ({
    id: item.id,
    customerName:
      item.customer_name ||
      item.customerName ||
      item.name ||
      item.nama ||
      "Pelanggan",
    type: item.type || item.category || item.jenis || "Review",
    rating: Number(item.rating || 0),
    message: item.message || item.content || item.isi || item.feedback || "",
    status: item.status || "Pending",
    date: formatDate(item.feedback_date || item.created_at),
  });

  const fetchfeedback = async () => {
  try {
    setLoading(true);

    const response = await api.get("/admin/feedback?all=1");
    const data = response.data.data ?? response.data;
    setfeedback(data.map(normalizefeedbackFromApi));

  } catch (error) {
    showAlert.error(getErrorMessage(error, "Gagal mengambil data feedback."));
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchfeedback();
  }, []);

  const filteredfeedback = feedback.filter((item) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      (item.customerName || "").toLowerCase().includes(keyword) ||
      (item.type || "").toLowerCase().includes(keyword) ||
      (item.message || "").toLowerCase().includes(keyword) ||
      (item.status || "").toLowerCase().includes(keyword);

    const matchStatus =
      filterStatus === "Semua" ? true : item.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentData: paginatedFeedback,
  } = usePagination(filteredfeedback, 8);

  const totalfeedback = feedback.length;
  const pendingfeedback = feedback.filter(
    (item) => item.status === "Pending"
  ).length;
  const shownfeedback = feedback.filter(
    (item) => item.status === "Ditampilkan"
  ).length;
  const hiddenfeedback = feedback.filter(
    (item) => item.status === "Disembunyikan"
  ).length;

  const createPayload = (item, status) => ({
  customer_name: item.customerName,
  type: item.type,
  rating: item.rating,
  message: item.message,
  status: status,
});

  const handleChangeStatus = async (id, status) => {
    const selectedfeedback = feedback.find((item) => item.id === id);

    if (!selectedfeedback) return;

    try {
    const payload = createPayload(selectedfeedback,status);

    await api.put(`/admin/feedback/${id}`,payload);

     fetchfeedback();
     showToast.success("Status feedback berhasil diperbarui.");
} catch(error){
      showAlert.error(getErrorMessage(error, "Gagal mengubah status feedback."));
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await showAlert.confirm("Apakah Anda yakin ingin menghapus review/keluhan ini?", "Konfirmasi Hapus");

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/feedback/${id}`);
      fetchfeedback();

      setfeedback((prev) => prev.filter((item) => item.id !== id));
      showToast.success("Feedback berhasil dihapus.");
    } catch (error) {
      showAlert.error(getErrorMessage(error, "Gagal menghapus feedback."));
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
            Total feedback: {totalfeedback}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="mb-6">
        <ResponsiveGrid>
          <StatCard
            icon={<MdFeedback />}
            iconClass="bg-slate-100 text-slate-900"
            label="Total"
            value={totalfeedback}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<MdAccessTime />}
            iconClass="bg-yellow-100 text-yellow-700"
            label="Pending"
            value={pendingfeedback}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<MdCheckCircle />}
            iconClass="bg-emerald-100 text-emerald-700"
            label="Ditampilkan"
            value={shownfeedback}
            className="bg-white text-[#06251c]"
          />

          <StatCard
            icon={<MdCancel />}
            iconClass="bg-red-100 text-red-600"
            label="Disembunyikan"
            value={hiddenfeedback}
            className="bg-white text-[#06251c]"
          />
        </ResponsiveGrid>
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
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400 xl:col-span-2">
              Mengambil data feedback dari backend...
            </div>
          ) : filteredfeedback.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400 xl:col-span-2">
              Data feedback tidak ditemukan.
            </div>
          ) : (
            paginatedFeedback.map((item) => (
              <div
                key={item.id}
                className="saka-card rounded-3xl border border-white/10 bg-[#06251c] p-6 shadow-sm"
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

                <p className="text-sm leading-7 text-slate-300">
                  {item.message}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleChangeStatus(item.id, e.target.value)
                    }
                    className={`cursor-pointer rounded-full px-4 py-2 text-xs font-black outline-none transition-colors ${statusClass(
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

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full bg-red-500/20 p-2.5 text-red-300 transition hover:bg-red-500 hover:text-white"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredfeedback.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}