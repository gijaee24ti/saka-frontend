import React from "react";

export default function StatCard({ icon, label, value, note, children, className = "", iconClass = "bg-slate-100 text-slate-900" }) {
  return (
    <div className={`saka-card h-full ${className} min-h-[170px] flex flex-col justify-between rounded-3xl border border-slate-200/10 bg-white/95 px-4 py-4 shadow-sm transition-all duration-200 sm:px-6 sm:py-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-3xl text-xl ${iconClass}`}>
          {icon}
        </div>
        {note && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            {note}
          </span>
        )}
      </div>

      <div>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          {label}
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">{value}</h2>
        {children}
      </div>
    </div>
  );
}
