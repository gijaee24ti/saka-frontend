import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdLogin,
  MdPerson,
  MdLock,
  MdWarningAmber,
  MdAdminPanelSettings,
} from "react-icons/md";
import { ImSpinner2 } from "react-icons/im";
import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  const [form, setForm] = useState({
    username: "",
    password: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      showNotice("error", "Email/username dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/admin/login", {
        email: form.username.trim(),
        username: form.username.trim(),
        password: form.password,
      });

      const adminData =
        response.data?.admin ||
        response.data?.user ||
        response.data?.data ||
        {};

      localStorage.setItem(
        "saka_admin_session",
        JSON.stringify({
          id: adminData.id || null,
          name: adminData.name || "Admin Saka",
          username: adminData.username || form.username.trim(),
          email: adminData.email || form.username.trim(),
          role: "Admin",
          token: response.data?.token || null,
          isLoggedIn: true,
          loginAt: new Date().toISOString(),
        })
      );

      showNotice("success", "Login admin berhasil.");

      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Email/username atau password admin salah.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saka-bubble-bg min-h-screen text-white">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 h-4 saka-checker-strip" />

      <div className="saka-bubble-content flex min-h-screen items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          {/* Branding */}
          <div>
            <h1 className="text-5xl font-black tracking-[0.35em] text-white md:text-6xl">
              SAKA<span className="text-emerald-400">.</span>
            </h1>

            <div className="mt-4 inline-block rounded-xl bg-black px-5 py-3">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white">
                On The Road
              </p>
            </div>

            <p className="mt-10 text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
              Admin Access
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Login Pengelola
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Masuk sebagai admin untuk mengelola data rider, lokasi cabang,
              menu, keluhan, dan inventory Kopi Saka.
            </p>

            <div className="mt-7 rounded-3xl bg-white/5 p-5">
              <p className="text-sm font-black text-white">Akun backend</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Email: <b>admin@saka.com</b>
                <br />
                Password: <b>admin123</b>
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="saka-panel bg-[#f7f0e6] p-8 text-[#06251c] md:p-10">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06251c] text-xl text-white">
                <MdAdminPanelSettings />
              </div>

              <div>
                <h2 className="text-2xl font-black">Masuk Admin</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Gunakan akun pengelola Kopi Saka.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Email / Username
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <MdPerson className="text-xl text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Contoh: admin@saka.com"
                    className="w-full bg-transparent text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <MdLock className="text-xl text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    className="w-full bg-transparent text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot")}
                  className="text-sm font-bold text-emerald-700 hover:text-emerald-900"
                >
                  Lupa kata sandi?
                </button>
              </div>

              {notice.text && (
                <div
                  className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-bold leading-6 ${
                    notice.type === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <MdWarningAmber className="mt-1 shrink-0" />
                  <span>{notice.text}</span>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600">
                  <ImSpinner2 className="animate-spin" />
                  Memproses login...
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-4 text-sm font-black text-white transition hover:bg-[#103c2e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <MdLogin />
                Login Admin
              </button>
            </form>

            <div className="mt-6 rounded-3xl bg-[#06251c]/10 p-5">
              <p className="text-xs font-bold leading-6 text-slate-600">
                Login admin sekarang sudah tersambung ke backend Laravel.
                Gunakan akun admin yang ada di database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}