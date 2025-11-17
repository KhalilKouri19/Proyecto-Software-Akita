"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/common/LogoutButton";

type Dispositivo = {
  ID_Dispositivo: number;
  Marca: string;
  Modelo: string;
  Estado: string;
  Problema?: string;
  Presupuesto?: number | null;
  FechaPresupuesto?: string | null;
};

export default function SeguimientoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(u);
    setUser(parsed);

    const loadDispositivos = async () => {
      try {
        const res = await fetch(`/api/seguimiento/${parsed.ID_Usuario}`);

        if (!res.ok) {
          console.error("Error en /api/seguimiento:", res.status, res.statusText);
          setError("No se pudieron cargar los dispositivos.");
          setDispositivos([]);
          return;
        }

        const text = await res.text();

        if (!text) {
          // Respuesta vacía: la tratamos como “sin dispositivos”
          setDispositivos([]);
          return;
        }

        const data = JSON.parse(text);
        setDispositivos(data);
      } catch (err) {
        console.error("Error cargando dispositivos:", err);
        setError("Ocurrió un error al cargar los dispositivos.");
        setDispositivos([]);
      }
    };

    loadDispositivos();
  }, [router]);

  if (!user)
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Cargando...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center pt-32 pb-16">
      {/* 🔹 Encabezado superior */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-10">
        <h1 className="text-3xl font-bold text-[#2CA3E0]">
          Bienvenido, {user.Nombre}
        </h1>

        <LogoutButton className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition" />
      </div>

      {/* 🔹 Contenedor centrado */}
      <div className="flex justify-center w-full">
        {error ? (
          <p className="text-red-500 text-center mt-10">{error}</p>
        ) : dispositivos.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No hay dispositivos registrados a tu cuenta.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {dispositivos.map((d) => (
              <div
                key={d.ID_Dispositivo}
                className="bg-white p-6 w-[340px] rounded-xl shadow-md border border-gray-200 text-center"
              >
                <h2 className="text-xl font-semibold text-[#2CA3E0] mb-2">
                  {d.Marca} {d.Modelo}
                </h2>

                <p className="text-sm text-gray-700">
                  <strong>Marca:</strong> {d.Marca}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Modelo:</strong> {d.Modelo}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Estado:</strong> {d.Estado}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Problema:</strong> {d.Problema || "No especificado"}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Presupuesto:</strong>{" "}
                  {d.Presupuesto ? `$${Number(d.Presupuesto).toFixed(2)}` : "A definir"}
                </p>
                {d.FechaPresupuesto && (
                  <p className="text-sm text-gray-700">
                    <strong>Fecha de Presupuesto:</strong>{" "}
                    {new Date(d.FechaPresupuesto).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
