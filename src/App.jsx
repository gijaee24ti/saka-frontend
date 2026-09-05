import { Suspense } from "react";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./assets/tailwind.css";

import Loading from "./components/Loading";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import RiderProtectedRoute from "./components/RiderProtectedRoute";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import NotFound from "./pages/NotFound";

// =========================
// AUTH PAGES
// =========================
const Login = React.lazy(() => import("./pages/Auth/Login"));
const Forgot = React.lazy(() => import("./pages/Auth/Forgot"));
const RiderLogin = React.lazy(() => import("./pages/Auth/RiderLogin"));

// =========================
// ADMIN PAGES
// =========================
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Riders = React.lazy(() => import("./pages/admin/Riders"));
const Products = React.lazy(() => import("./pages/admin/Products"));
const Locations = React.lazy(() => import("./pages/admin/Locations"));
const Feedback = React.lazy(() => import("./pages/admin/Feedback"));
const MonitoringStok = React.lazy(
  () => import("./pages/admin/MonitoringStok")
);
const ManajemenLiteran = React.lazy(
  () => import("./pages/admin/ManajemenLiteran")
);
const Settings = React.lazy(() => import("./pages/admin/Settings"));

// =========================
// RIDER PAGES
// =========================
const RiderDashboard = React.lazy(
  () => import("./pages/rider/RiderDashboard")
);

// =========================
// LANDING PAGE
// =========================
const CustomerPage = React.lazy(
  () => import("./pages/customer/CustomerPage")
);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>

        {/* ========================================
            LANDING PAGE
            Domain utama langsung menampilkan
            halaman pelanggan
        ======================================== */}
        <Route
          path="/"
          element={<CustomerPage />}
        />

        {/* ========================================
            ADMIN AUTH
        ======================================== */}
        <Route element={<AuthLayout />}>
          <Route
            path="/admin/login"
            element={<Login />}
          />

          <Route
            path="/admin/forgot"
            element={<Forgot />}
          />
        </Route>

        {/* ========================================
            RIDER AUTH
        ======================================== */}
        <Route
          path="/rider/login"
          element={<RiderLogin />}
        />

        {/* ========================================
            ADMIN PANEL
        ======================================== */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/riders"
              element={<Riders />}
            />

            <Route
              path="/admin/products"
              element={<Products />}
            />

            <Route
              path="/admin/locations"
              element={<Locations />}
            />

            <Route
              path="/admin/feedback"
              element={<Feedback />}
            />

            <Route
              path="/admin/stocks"
              element={<MonitoringStok />}
            />

            <Route
              path="/admin/literan"
              element={<ManajemenLiteran />}
            />

            <Route
              path="/admin/settings"
              element={<Settings />}
            />

          </Route>
        </Route>

        {/* ========================================
            RIDER PANEL
        ======================================== */}
        <Route element={<RiderProtectedRoute />}>
          <Route
            path="/rider/dashboard"
            element={<RiderDashboard />}
          />
        </Route>

        {/* ========================================
            REDIRECT OLD ROUTES
        ======================================== */}

        {/* Old Admin Login */}
        <Route
          path="/login"
          element={
            <Navigate
              to="/admin/login"
              replace
            />
          }
        />

        {/* Old Admin Forgot Password */}
        <Route
          path="/forgot"
          element={
            <Navigate
              to="/admin/forgot"
              replace
            />
          }
        />

        {/* Old Rider Route */}
        <Route
          path="/rider"
          element={
            <Navigate
              to="/rider/dashboard"
              replace
            />
          }
        />

        {/* Old Rider Login */}
        <Route
          path="/rider-login"
          element={
            <Navigate
              to="/rider/login"
              replace
            />
          }
        />

        {/* Old Rider Dashboard */}
        <Route
          path="/rider-dashboard"
          element={
            <Navigate
              to="/rider/dashboard"
              replace
            />
          }
        />

        {/* Pelanggan */}
        <Route
          path="/pelanggan"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

        {/* ========================================
            404
        ======================================== */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Suspense>
  );
}

export default App;