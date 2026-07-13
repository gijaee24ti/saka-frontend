import { MdAccessTime, MdLocationOn, MdStorefront } from "react-icons/md";
import { getStatusBadge } from "../utils/outletUtama";

export default function OutletUtamaPreview({ data }) {
  const status = getStatusBadge(data.status);

  return (
    <div className="saka-card max-w-full bg-[#06251c] p-4 text-white transition-all duration-300 sm:p-5 md:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">
        Preview Customer View
      </p>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8efe1] text-xl text-[#06251c]">
            <MdStorefront />
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-black ${status.badgeClass}`}
          >
            {status.emoji} {status.label}
          </span>
        </div>

        <h3 className="text-xl font-black uppercase tracking-wide">
          {data.branch || "SAKA Dahlia"}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
          <MdAccessTime className="shrink-0" />
          <span>
            {data.openTime || "10:00"} - {data.closeTime || "23:00"}
          </span>
        </div>

        {data.address ? (
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Alamat Outlet
            </p>
            <p className="mt-2 break-words text-sm leading-6 text-slate-300">
              {data.address}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Alamat belum diisi</p>
        )}

        {data.mapsLink ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f8efe1] px-4 py-2 text-xs font-black text-[#06251c]">
            <MdLocationOn />
            Buka Maps
          </div>
        ) : (
          <div className="mt-4 rounded-full bg-white/5 px-4 py-2 text-center text-xs font-bold text-slate-500">
            Link maps belum tersedia
          </div>
        )}

        {data.deskripsi && (
          <p className="mt-4 text-sm leading-6 text-slate-400">{data.deskripsi}</p>
        )}

        <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
          <p className="font-black text-[#f8efe1]">☕ Menu Tersedia</p>
          {data.produkLiteranTersedia && (
            <p className="text-slate-300">🥤 Produk Literan</p>
          )}
          {data.donatTersedia && <p className="text-slate-300">🍩 Donat</p>}
          {!data.produkLiteranTersedia && !data.donatTersedia && (
            <p className="text-slate-500">Belum ada produk khusus dipilih</p>
          )}
        </div>

        {data.whatsapp && (
          <p className="mt-4 text-xs text-slate-400">WhatsApp: {data.whatsapp}</p>
        )}
      </div>
    </div>
  );
}
