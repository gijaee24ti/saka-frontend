export const OUTLET_UTAMA_VEHICLE = "Outlet Utama";

export const defaultOutletUtamaForm = {
  branch: "SAKA Dahlia",
  vehicle: OUTLET_UTAMA_VEHICLE,
  address: "",
  mapsLink: "",
  whatsapp: "",
  deskripsi:
    "Outlet utama SAKA yang menyediakan seluruh varian minuman dan produk literan.",
  openTime: "10:00",
  closeTime: "23:00",
  status: "Beroperasi",
  produkLiteranTersedia: true,
  donatTersedia: true,
};

export const jenisOutletOptions = [
  "Outlet Utama",
  "Cabang Tetap",
  "Tenda",
  "Bajaj",
  "Sepeda",
];

const formatTime = (time) => {
  if (!time) return "";
  const text = String(time);
  if (text.includes("T")) return text.split("T")[1]?.slice(0, 5) || "";
  if (text.includes(" ")) return text.split(" ")[1]?.slice(0, 5) || "";
  return text.slice(0, 5);
};

export const parseOutletNote = (note) => {
  if (!note || note === "-") return {};

  try {
    const parsed = JSON.parse(note);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    return { deskripsi: note };
  }

  return {};
};

export const buildOutletNote = (form) =>
  JSON.stringify({
    whatsapp: form.whatsapp || "",
    deskripsi: form.deskripsi || "",
    produkLiteranTersedia: !!form.produkLiteranTersedia,
    donatTersedia: !!form.donatTersedia,
  });

export const isOutletUtama = (outlet) => {
  if (!outlet) return false;

  const vehicle = String(outlet.vehicle || "").toLowerCase();
  const branch = String(outlet.branch || "").toLowerCase();

  return vehicle === "outlet utama" || branch.includes("dahlia");
};

export const findOutletUtama = (outlets = []) =>
  outlets.find(isOutletUtama) || null;

export const mapStatusFromApi = (status) => {
  if (status === "Aktif" || status === "Beroperasi") return "Beroperasi";
  return "Tidak Beroperasi";
};

export const normalizeOutletUtamaFromApi = (item) => {
  if (!item) {
    return { ...defaultOutletUtamaForm, id: null };
  }

  const meta = parseOutletNote(item.note);

  return {
    id: item.id,
    branch: item.branch || defaultOutletUtamaForm.branch,
    vehicle: item.vehicle || OUTLET_UTAMA_VEHICLE,
    address: item.address && item.address !== "-" ? item.address : "",
    mapsLink: item.maps_link || item.mapsLink || "",
    openTime: formatTime(item.open_time || item.openTime) || defaultOutletUtamaForm.openTime,
    closeTime: formatTime(item.close_time || item.closeTime) || defaultOutletUtamaForm.closeTime,
    status: mapStatusFromApi(item.status),
    whatsapp: meta.whatsapp || "",
    deskripsi: meta.deskripsi || defaultOutletUtamaForm.deskripsi,
    produkLiteranTersedia: meta.produkLiteranTersedia !== false,
    donatTersedia: meta.donatTersedia !== false,
  };
};

export const buildOutletUtamaApiPayload = (form) => ({
  branch: form.branch,
  vehicle: form.vehicle || OUTLET_UTAMA_VEHICLE,
  open_time: form.openTime,
  close_time: form.closeTime,
  address: form.address || "",
  maps_link: form.mapsLink || "",
  status: form.status === "Beroperasi" ? "Beroperasi" : "Tidak Beroperasi",
  note: buildOutletNote(form),
});

export const getStatusBadge = (status) => {
  const isOpen = status === "Beroperasi" || status === "Aktif";

  return {
    label: isOpen ? "Beroperasi" : "Tidak Beroperasi",
    emoji: isOpen ? "🟢" : "🔴",
    badgeClass: isOpen
      ? "bg-emerald-500/20 text-emerald-300"
      : "bg-red-500/20 text-red-300",
  };
};

export const enrichOutletWithMeta = (outlet) => {
  if (!outlet) return null;

  const meta = parseOutletNote(outlet.note);

  return {
    ...outlet,
    whatsapp: meta.whatsapp || "",
    deskripsi: meta.deskripsi || "",
    produkLiteranTersedia: meta.produkLiteranTersedia !== false,
    donatTersedia: meta.donatTersedia !== false,
    isUtama: isOutletUtama(outlet),
    displayStatus: isOutletUtama(outlet)
      ? mapStatusFromApi(outlet.status)
      : outlet.display_status || outlet.status || "Tidak Beroperasi",
  };
};
