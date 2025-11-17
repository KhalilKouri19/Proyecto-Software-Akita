"use client";

import { useState } from "react";

export default function AdminSidebar({ onAdded }: { onAdded: () => void }) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [problema, setProblema] = useState("");
  const [cliente, setCliente] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/dispositivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Marca: marca,
          Modelo: modelo,
          Problema: problema,
          Estado: "A presupuestar", // 👈 siempre inicia así
          Cliente: cliente,
          Email: email,
          Telefono: telefono,
          Usuario: usuario,
          Password: password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "⚠️ Error al agregar dispositivo");
        return;
      }

      alert("✅ Dispositivo agregado correctamente");

      // Limpiar formulario
      setMarca("");
      setModelo("");
      setProblema("");
      setCliente("");
      setEmail("");
      setTelefono("");
      setUsuario("");
      setPassword("");

      onAdded();
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión al agregar dispositivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-[#2CA3E0]">Agregar Dispositivo</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          required
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Modelo"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          required
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <textarea
          placeholder="Problema"
          value={problema}
          onChange={(e) => setProblema(e.target.value)}
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          required
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="tel"
          placeholder="Teléfono de contacto"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Usuario de acceso"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Contraseña de acceso"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-[#2CA3E0] hover:bg-[#1b7fb5] text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? "Agregando..." : "Agregar Dispositivo"}
        </button>
      </form>
    </aside>
  );
}
