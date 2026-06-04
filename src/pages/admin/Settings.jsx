import { useEffect, useState } from "react";
import { MdSave, MdSettings, MdRefresh } from "react-icons/md";

const defaultSettings = {
  adminName: "Kelompok 5",
  appName: "SAKA On The Road",
  brandName: "Saka Coffee",
  openTime: "09:00",
  closeTime: "18:00",
  systemStatus: "Aktif",
};

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("saka_settings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("saka_settings", JSON.stringify(settings));
  }, [settings]);

  const showNotice = (text) => {
    setNotice(text);

    setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("saka_settings", JSON.stringify(settings));
    showNotice("Pengaturan berhasil disimpan.");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem("saka_settings", JSON.stringify(defaultSettings));
    showNotice("Pengaturan dikembalikan ke default.");
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#06251c] outline-none transition focus:border-[#06251c]";

  return (
    <div className="min-h-screen px-8 py-8 text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-slate-300">
            Pengaturan sederhana untuk informasi umum sistem.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full bg-[#103c2e] px-5 py-3">
          <MdSettings className="text-xl text-emerald-300" />
          <span className="text-sm font-black">
            Sistem: {settings.systemStatus}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="saka-card max-w-4xl bg-[#f7f0e6] p-8 text-[#06251c]">
        <div className="mb-7">
          <h2 className="text-2xl font-black">Pengaturan Sistem</h2>
          <p className="mt-2 text-sm text-slate-500">
            Data ini digunakan sebagai identitas umum aplikasi admin Kopi Saka.
          </p>
        </div>

        {notice && (
          <div className="mb-5 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-700">
            {notice}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Nama Admin
            </label>
            <input
              type="text"
              name="adminName"
              value={settings.adminName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Nama Aplikasi
            </label>
            <input
              type="text"
              name="appName"
              value={settings.appName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Nama Brand
            </label>
            <input
              type="text"
              name="brandName"
              value={settings.brandName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Jam Buka
              </label>
              <input
                type="time"
                name="openTime"
                value={settings.openTime}
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
                value={settings.closeTime}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Status Sistem
            </label>
            <select
              name="systemStatus"
              value={settings.systemStatus}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Aktif">Aktif</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-3 md:flex-row">
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#06251c] py-4 text-sm font-black text-white transition hover:bg-[#103c2e]"
            >
              <MdSave />
              Simpan Pengaturan
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#06251c] py-4 text-sm font-black text-[#06251c] transition hover:bg-[#06251c] hover:text-white"
            >
              <MdRefresh />
              Reset Default
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}