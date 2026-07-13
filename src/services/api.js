import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const adminSession = JSON.parse(
    localStorage.getItem("saka_admin_session") || "{}"
  );
  const riderSession = JSON.parse(
    localStorage.getItem("saka_rider_session") || "{}"
  );

  // Select token based on endpoint context:
  // - /rider/* endpoints → must use rider token
  // - /admin/* endpoints → must use admin token
  // - other (public, etc.) → use whichever is available
  const url = config.url || "";
  let token = null;

  if (url.startsWith("/rider/") || url.startsWith("/rider")) {
    token = riderSession.token || null;
  } else if (url.startsWith("/admin/") || url.startsWith("/admin")) {
    token = adminSession.token || null;
  } else {
    token = adminSession.token || riderSession.token || null;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto-clear stale sessions on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error?.config?.url || "";

      if (url.startsWith("/rider/") || url.startsWith("/rider")) {
        localStorage.removeItem("saka_rider_session");
        localStorage.removeItem("saka_current_rider_id");
      } else if (url.startsWith("/admin/") || url.startsWith("/admin")) {
        localStorage.removeItem("saka_admin_session");
      }
    }

    return Promise.reject(error);
  }
);

export default api;