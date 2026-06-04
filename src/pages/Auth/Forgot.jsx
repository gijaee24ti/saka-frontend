import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdEmail,
  MdLockReset,
  MdWarningAmber,
  MdSend,
} from "react-icons/md";
import { ImSpinner2 } from "react-icons/im";

export default function Forgot() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  const showNotice = (type, text) => {
    setNotice({ type, text });

    setTimeout(() => {
      setNotice({ type: "", text: "" });
    }, 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      showNotice("error", "Email wajib diisi.");
      return;
    }

    if (!email.includes("@")) {
      showNotice("error", "Format email belum valid.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showNotice(
        "success",
        "Link reset password berhasil dikirim. Untuk prototype, fitur ini belum tersambung ke email asli."
      );
      setEmail("");
    }, 700);
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
              Reset Kata Sandi
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Masukkan email admin yang terdaftar untuk melakukan permintaan
              reset kata sandi akun pengelola Kopi Saka.
            </p>

            <div className="mt-7 rounded-3xl bg-white/5 p-5">
              <p className="text-sm font-black text-white">Catatan prototype</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Fitur lupa password ini masih berupa tampilan simulasi. Nanti
                saat sistem memakai backend, bagian ini bisa disambungkan ke
                email reset password asli.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="saka-panel bg-[#f7f0e6] p-8 text-[#06251c] md:p-10">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-7 flex items-center gap-2 rounded-full bg-[#06251c]/10 px-4 py-2 text-xs font-black text-[#06251c] transition hover:bg-[#06251c] hover:text-white"
            >
              <MdArrowBack />
              Kembali ke Login
            </button>

            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06251c] text-xl text-white">
                <MdLockReset />
              </div>

              <div>
                <h2 className="text-2xl font-black">Lupa Password</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Masukkan email admin untuk reset kata sandi.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Email Admin
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <MdEmail className="text-xl text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    className="w-full bg-transparent text-sm font-bold outline-none"
                  />
                </div>
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
                  Mengirim permintaan reset...
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06251c] py-4 text-sm font-black text-white transition hover:bg-[#103c2e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <MdSend />
                Kirim Link Reset
              </button>
            </form>

            <div className="mt-6 rounded-3xl bg-[#06251c]/10 p-5">
              <p className="text-xs font-bold leading-6 text-slate-600">
                Setelah backend dibuat, email yang dimasukkan akan dicek ke
                database admin lalu sistem mengirim tautan reset password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}