import { useEffect, useState } from "react";
import { MdRefresh, MdSave, MdStorefront } from "react-icons/md";
import api from "../../services/api";
import OutletUtamaPreview from "../../components/OutletUtamaPreview";
import {
  buildOutletUtamaApiPayload,
  defaultOutletUtamaForm,
  findOutletUtama,
  formatMapsLink,
  jenisOutletOptions,
  normalizeOutletUtamaFromApi,
} from "../../utils/outletUtama";

export default function Settings() {
  const [form, setForm] = useState(defaultOutletUtamaForm);
  const [outletId, setOutletId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const showNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice({ type: "", text: "" }), 3500);
  };

  const getErrorMessage = (error, fallback) => {
    const message = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;

    if (message) return message;

    if (errors) {
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError)) return firstError[0];
    }

    return fallback;
  };

  const toArray = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const fetchOutletUtama = async () => {
    try {
      setLoading(true);
      const response = await api.get("/public/outlets");
      const outlets = toArray(response);
      const outletUtama = findOutletUtama(outlets);

      if (outletUtama) {
        setOutletId(outletUtama.id);
        setForm(normalizeOutletUtamaFromApi(outletUtama));
      } else {
        setOutletId(null);
        setForm(defaultOutletUtamaForm);
      }
    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Gagal mengambil data outlet utama.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutletUtama();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = () => {
    setForm(defaultOutletUtamaForm);
    showNotice("info", "Form dikembalikan ke nilai default.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.branch || !form.openTime || !form.closeTime) {
      showNotice("error", "Nama outlet, jam buka, dan jam tutup wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildOutletUtamaApiPayload(form);

      if (outletId) {
        await api.put(`/admin/outlets/${outletId}`, payload);
        showNotice("success", "Data Outlet Utama SAKA Dahlia berhasil diperbarui.");
      } else {
        const response = await api.post("/admin/outlets", payload);
        const created = response.data?.data || response.data;
        setOutletId(created?.id || null);
        showNotice("success", "Outlet Utama SAKA Dahlia berhasil disimpan.");
      }

      fetchOutletUtama();
    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Gagal menyimpan data outlet utama.")
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "min-h-[44px] w-full max-w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#06251c] outline-none transition-all duration-300 focus:border-[#06251c]";

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-6 text-white sm:px-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-full">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
            SAKA ADMIN PANEL
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Kelola Outlet Utama
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Kelola informasi Outlet Utama SAKA Dahlia yang akan ditampilkan kepada
            pelanggan.
          </p>
        </div>

        <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-[#103c2e] px-4 py-3 sm:px-5">
          <MdStorefront className="shrink-0 text-xl text-emerald-300" />
          <span className="truncate text-sm font-black">
            {form.branch || "SAKA Dahlia"}
          </span>
        </div>
      </div>

      {notice.text && (
        <div
          className={`mb-6 max-w-full rounded-2xl px-4 py-3 text-sm font-bold ${
            notice.type === "success"
              ? "bg-emerald-500/20 text-emerald-200"
              : notice.type === "error"
                ? "bg-red-500/20 text-red-200"
                : "bg-blue-500/20 text-blue-200"
          }`}
        >
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white/5 p-8 text-center text-sm font-bold text-slate-300">
          Mengambil data outlet utama...
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="saka-card max-w-full bg-[#f7f0e6] p-4 text-[#06251c] sm:p-5 md:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black sm:text-2xl">Informasi Outlet</h2>
              <p className="mt-2 text-sm text-slate-500">
                Data ini digunakan pada halaman pelanggan, lokasi, dan card outlet
                SAKA Dahlia.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Nama Outlet
                </label>
                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="SAKA Dahlia"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Jenis Outlet
                </label>
                <select
                  name="vehicle"
                  value={form.vehicle}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {jenisOutletOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Alamat Outlet
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Jl. Dahlia No. XX Pekanbaru"
                  className={`${inputClass} min-h-[88px] resize-y`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Link Google Maps
                </label>
                <input
                  type="text"
                  name="mapsLink"
                  value={form.mapsLink}
                  onChange={handleChange}
                  onBlur={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      mapsLink: formatMapsLink(e.target.value),
                    }))
                  }
                  placeholder="Opsional: tempel link Google Maps atau share link di sini"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Nomor WhatsApp Outlet
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Deskripsi Outlet
                </label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Outlet utama SAKA yang menyediakan seluruh varian minuman dan produk literan."
                  className={`${inputClass} min-h-[110px] resize-y`}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Jam Buka
                </label>
                <input
                  type="time"
                  name="openTime"
                  value={form.openTime}
                  onChange={handleChange}
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Status Operasional
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Beroperasi">Beroperasi</option>
                  <option value="Tidak Beroperasi">Tidak Beroperasi</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Status ini akan tampil di halaman pelanggan.
                </p>
              </div>

              <div className="md:col-span-2 rounded-3xl bg-[#06251c]/5 p-4 sm:p-5">
                <h3 className="text-sm font-black text-[#06251c]">
                  Produk Khusus Outlet Utama
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Hanya outlet tertentu yang memiliki produk khusus berikut.
                </p>

                <div className="mt-4 space-y-3">
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      name="produkLiteranTersedia"
                      checked={form.produkLiteranTersedia}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#06251c]"
                    />
                    <span className="text-sm font-bold">Produk Literan Tersedia</span>
                  </label>

                  <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      name="donatTersedia"
                      checked={form.donatTersedia}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#06251c]"
                    />
                    <span className="text-sm font-bold">Donat Tersedia</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 md:col-span-2 md:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[#06251c] py-4 text-sm font-black text-white transition-all duration-300 hover:bg-[#103c2e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <MdSave />
                  {saving ? "Menyimpan..." : "Simpan Outlet Utama"}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#06251c] py-4 text-sm font-black text-[#06251c] transition-all duration-300 hover:bg-[#06251c] hover:text-white"
                >
                  <MdRefresh />
                  Reset Default
                </button>
              </div>
            </form>
          </div>

          <OutletUtamaPreview data={form} />
        </div>
      )}
    </div>
  );
}
