"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSideBar";
import DeviceList from "@/components/admin/DeviceList";
import LogoutButton from "@/components/common/LogoutButton";

export default function AdminPage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);

  // 🔵 Verificar sesión con localStorage (igual que tu login)
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(user);
    if (parsed.Rol?.toLowerCase() !== "admin") {
      router.push("/seguimiento"); // cliente no puede entrar
    }
  }, [router]);

  const handleAdded = () => setRefresh((prev) => prev + 1);

  return (
    <main className="min-h-screen bg-gray-100 p-8 pt-24 flex flex-col items-center">
      {/* 🔹 Encabezado */}
      <div className="sticky top-0 bg-gray-100 z-10 flex justify-between items-center w-full max-w-7xl mb-8 p-4 shadow-sm">
        <h1 className="text-3xl font-bold text-[#2CA3E0]">
          Panel de Administración
        </h1>

        <LogoutButton className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition" />
      </div>

      {/* 🔹 Contenido principal */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl">
        <AdminSidebar onAdded={handleAdded} />
        <DeviceList refresh={refresh} />
      </div>
    </main>
  );
}
