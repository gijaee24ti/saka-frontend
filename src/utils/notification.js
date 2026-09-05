import Swal from "sweetalert2";

const defaultOptions = {
  background: "#F7F0E6",
  color: "#06251C",
  confirmButtonColor: "#06251C",
  cancelButtonColor: "#94a3b8",
  customClass: {
    popup: "rounded-[2rem] border border-[#06251c]/10 shadow-xl font-sans",
    title: "text-[#06251c] font-black",
    htmlContainer: "text-[#06251c]/80 text-sm font-semibold",
    confirmButton: "rounded-full px-6 py-2.5 font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#3ECF8E] outline-none mx-2",
    cancelButton: "rounded-full px-6 py-2.5 font-bold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-300 outline-none mx-2"
  },
  buttonsStyling: true,
};

export const showAlert = {
  success: (message, title = "Berhasil") => {
    return Swal.fire({
      ...defaultOptions,
      title,
      text: message,
      icon: "success",
      iconColor: "#3ECF8E",
      confirmButtonText: "OK",
    });
  },
  error: (message, title = "Terjadi Kesalahan") => {
    return Swal.fire({
      ...defaultOptions,
      title,
      text: message,
      icon: "error",
      iconColor: "#ef4444",
      confirmButtonText: "OK",
    });
  },
  warning: (message, title = "Peringatan") => {
    return Swal.fire({
      ...defaultOptions,
      title,
      text: message,
      icon: "warning",
      iconColor: "#f59e0b",
      confirmButtonText: "OK",
    });
  },
  confirm: (message, title = "Konfirmasi") => {
    return Swal.fire({
      ...defaultOptions,
      title,
      text: message,
      icon: "question",
      iconColor: "#06251C",
      showCancelButton: true,
      confirmButtonText: "Ya, Lanjutkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#06251C",
      cancelButtonColor: "#94a3b8",
    }).then((result) => result.isConfirmed);
  }
};

export const showToast = {
  success: (message) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "#F7F0E6",
      color: "#06251C",
      iconColor: "#3ECF8E",
      customClass: {
        popup: "rounded-2xl border border-[#06251c]/10 shadow-lg font-sans text-sm font-semibold",
      },
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      }
    });
    return Toast.fire({
      icon: "success",
      title: message
    });
  },
  error: (message) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "#F7F0E6",
      color: "#06251C",
      iconColor: "#ef4444",
      customClass: {
        popup: "rounded-2xl border border-[#06251c]/10 shadow-lg font-sans text-sm font-semibold",
      },
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      }
    });
    return Toast.fire({
      icon: "error",
      title: message
    });
  },
  warning: (message) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "#F7F0E6",
      color: "#06251C",
      iconColor: "#f59e0b",
      customClass: {
        popup: "rounded-2xl border border-[#06251c]/10 shadow-lg font-sans text-sm font-semibold",
      },
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      }
    });
    return Toast.fire({
      icon: "warning",
      title: message
    });
  }
};
