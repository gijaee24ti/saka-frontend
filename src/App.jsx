import { Suspense } from "react";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./assets/tailwind.css";

import Loading from "./components/Loading";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import NotFound from "./pages/NotFound";

const Login = React.lazy(() => import("./pages/Auth/Login"));
const Forgot = React.lazy(() => import("./pages/Auth/Forgot"));

const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Riders = React.lazy(() => import("./pages/admin/Riders"));
const Products = React.lazy(() => import("./pages/admin/Products"));
const Locations = React.lazy(() => import("./pages/admin/Locations"));
const Feedback = React.lazy(() => import("./pages/admin/Feedback"));
const MonitoringStok = React.lazy(() => import("./pages/admin/MonitoringStok"));
const ManajemenLiteran = React.lazy(() => import("./pages/admin/ManajemenLiteran"));
const Settings = React.lazy(() => import("./pages/admin/Settings"));

const RiderDashboard = React.lazy(() => import("./pages/rider/RiderDashboard"));
const CustomerPage = React.lazy(() => import("./pages/customer/CustomerPage"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<Forgot />} />
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/riders" element={<Riders />} />
            <Route path="/menu-harga" element={<Products />} />
            <Route path="/lokasi" element={<Locations />} />
            <Route path="/keluhan" element={<Feedback />} />
            <Route path="/monitoring-stok" element={<MonitoringStok />} />
            <Route path="/manajemen-literan" element={<ManajemenLiteran />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="/rider-login" element={<Navigate to="/rider" replace />} />
        <Route path="/rider-dashboard" element={<Navigate to="/rider" replace />} />
        <Route path="/rider" element={<RiderDashboard />} />

        <Route path="/pelanggan" element={<CustomerPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;