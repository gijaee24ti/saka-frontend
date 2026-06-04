export default function Register() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f3d2f] px-4 py-10">
            <div className="w-full max-w-4xl rounded-[32px] overflow-hidden bg-white/90 shadow-2xl backdrop-blur-xl border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_0.95fr] min-h-[560px]">
                    <div
                        className="relative hidden md:flex flex-col justify-center px-10 py-12 text-white bg-cover bg-center"
                        style={{ backgroundImage: "url('/img/login-bg.jpeg')" }}
                    >
                        <div className="absolute inset-0 bg-emerald-950/80"></div>
                        <div className="relative z-10 space-y-5">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200 mb-4">
                                    Kopi Saka
                                </p>
                                <h2 className="text-3xl font-bold leading-tight">
                                    Buat Akun Baru
                                </h2>
                            </div>
                            <p className="max-w-sm text-sm text-emerald-100/90">
                                Daftar akun admin Kopi Saka dan mulai atur menu serta pesanan.
                            </p>
                        </div>
                    </div>

                    <div className="px-8 py-10 md:px-12 md:py-14 bg-white">
                        <div className="mb-8">
                            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Daftar Akun</h1>
                            <p className="text-sm text-gray-500">Isi data berikut untuk membuat akun baru.</p>
                        </div>

                        <form className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="********"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="********"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-3xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-900"
                            >
                                Register
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}