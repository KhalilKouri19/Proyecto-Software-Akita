"use client";

import { useEffect, useState } from "react";
import DeviceCard from "./DeviceCard";

interface Device {
  ID_Dispositivo: number;
  Marca: string;
  Modelo: string;
  Estado: string;
  Problema: string;
  Cliente: string;
  Email: string;
  Telefono: string;
}

export default function DeviceList({ refresh }: { refresh: number }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchDevices = async () => {
        setLoading(true);
        try {
        const res = await fetch("/api/dispositivos");
        const data = await res.json();

        if (Array.isArray(data)) setDevices(data);
        else {
            console.error("Formato inesperado en /api/dispositivos:", data);
            setDevices([]);
        }
        } catch (error) {
        console.error("Error al cargar dispositivos:", error);
        setDevices([]);
        } finally {
        setLoading(false);
        }
    };

    fetchDevices();
  }, [refresh]);

  return (
    <section className="w-full md:w-2/3 bg-gray-50 p-6 rounded-xl shadow-inner overflow-y-auto max-h-[80vh]">
      <h2 className="text-2xl font-bold mb-4 text-[#2CA3E0]">Lista de Dispositivos</h2>

      {loading ? (
        <p className="text-gray-500">Cargando dispositivos...</p>
      ) : devices.length === 0 ? (
        <p className="text-gray-500">No hay dispositivos registrados.</p>
      ) : (
        devices.map((device) => (
          <DeviceCard
            key={device.ID_Dispositivo}
            device={device}
            onDeleted={() =>
              setDevices((prev) =>
                prev.filter((d) => d.ID_Dispositivo !== device.ID_Dispositivo)
              )
            }
            onUpdated={() => setDevices((prev) => [...prev])}
          />
        ))
      )}
    </section>
  );
}
