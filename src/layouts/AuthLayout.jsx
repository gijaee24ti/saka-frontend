import { Outlet } from "react-router-dom";
export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d3528] text-gray-900">
            <div className="w-full max-w-7xl px-4 py-10">
                <Outlet />
            </div>
        </div>
    );
}