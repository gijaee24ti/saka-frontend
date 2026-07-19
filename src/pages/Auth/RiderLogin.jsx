import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdLogin,
  MdPerson,
  MdLock,
  MdWarningAmber,
} from "react-icons/md";
import api from "../../services/api";

export default function RiderLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  const [loginForm, setLoginForm] = useState({
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

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginForm.username || !loginForm.password) {
      showNotice("error", "Username dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/rider/login", {
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      const riderData =
        response.data?.rider ||
        response.data?.user ||
        response.data?.data ||
        {};

      if (riderData.account_status === "Nonaktif") {
        showNotice("error", "Akun rider ini sedang nonaktif.");
        return;
      }

      localStorage.setItem("saka_current_rider_id", String(riderData.id));

      localStorage.setItem(
        "saka_rider_session",
        JSON.stringify({
          id: riderData.id,
          name: riderData.name,
          username: riderData.username || loginForm.username.trim(),
          role: "Rider",
          token: response.data?.token || null,
          isLoggedIn: true,
          loginAt: new Date().toISOString(),
        })
      );

      showNotice("success", "Login rider berhasil.");
      setTimeout(() => {
        navigate("/rider/dashboard");
      }, 500);
    } catch (error) {
      showNotice(
        "error",
        getErrorMessage(error, "Username atau password rider salah.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saka-bubble-bg min-h-screen overflow-x-hidden text-white">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 h-4 saka-checker-strip" />

      <div className="saka-bubble-content mx-auto max-w-7xl p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 max-w-full">
            <div className="mb-4">
              <h1 className="text-3xl font-black tracking-[0.25em] text-white sm:text-4xl sm:tracking-[0.35em]">
                SAKA<span className="text-emerald-400">.</span>
              </h1>

              <div className="mt-3 inline-block rounded-lg bg-black px-4 py-2">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-white">
                  On The Road
                </p>
              </div>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
              Rider Panel
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Login Rider</h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Masuk menggunakan akun rider untuk mengakses dashboard stok dan status
              operasional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center lg:gap-8">
          <div className="saka-panel max-w-full bg-[#103c2e] p-4 sm:p-6 lg:p-8">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
              Akses Khusus Rider
            </p>

            <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
              Update stok dan status hanya melalui akun rider.
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Setelah login, rider hanya bisa melihat data miliknya sendiri,
              termasuk stand tugas, stok produk, catatan admin, dan status
              operasional.
            </p>

            <div className="mt-6 rounded-3xl bg-white/5 p-4 sm:p-5">
              <p className="text-sm font-black text-white">Catatan</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Username dan password dibuat oleh admin pada halaman Data
                Rider. Data login rider sekarang diperiksa melalui backend
                Laravel.
              </p>
            </div>
          </div>

          <div className="saka-panel max-w-full bg-[#f7f0e6] p-4 text-[#06251c] sm:p-6 md:p-8 lg:p-10">
            <div className="mb-6 flex items-center gap-3 md:mb-7">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#06251c] text-xl text-white">
                <MdLogin />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-black sm:text-2xl">Masuk Rider</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Gunakan username dan password dari admin.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Username
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <MdPerson className="shrink-0 text-xl text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    placeholder="Contoh: rider_rumbai"
                    className="w-full min-w-0 bg-transparent text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <MdLock className="shrink-0 text-xl text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Masukkan password"
                    className="w-full min-w-0 bg-transparent text-sm font-bold outline-none"
                  />
                </div>
              </div>

              {notice.text && (
                <div
                  className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-bold leading-6 md:col-span-2 ${
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
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600 md:col-span-2">
                  Memproses login rider...
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-4 text-sm font-black text-white transition-all duration-300 hover:bg-[#103c2e] disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
              >
                <MdLogin />
                Login Rider
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
