"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import AdminSidebar from "@/components/admin/AdminSideBar";
import DeviceList from "@/components/admin/DeviceList";

export default function AdminPage() {
  const [refresh, setRefresh] = useState(0);

  const handleAdded = () => setRefresh((prev) => prev + 1);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 pt-24 flex flex-col items-center">
      {/* 🔹 Encabezado */}
      <div className="sticky top-0 bg-gray-100 z-10 flex justify-between items-center w-full max-w-7xl mb-8 p-4 shadow-sm">
        <h1 className="text-3xl font-bold text-[#2CA3E0]">
          Panel de Administración
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* 🔹 Contenido principal */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl">
        <AdminSidebar onAdded={handleAdded} />
        <DeviceList refresh={refresh} />
      </div>
    </main>
  );
}
