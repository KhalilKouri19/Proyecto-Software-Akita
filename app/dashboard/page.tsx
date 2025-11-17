"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      router.push("/login");
    } else {
      setUser(JSON.parse(u));
    }
  }, []);

  if (!user) return <p className="text-white">Cargando...</p>;

  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-bold">Bienvenido, {user.Nombre}</h1>
      <p className="opacity-70">Rol: {user.Rol}</p>

      {/* Acá luego agregamos tarjetas, listas, accesos, etc */}
    </main>
  );
}