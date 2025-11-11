"use client";

import Header from "@/components/Header";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    await new Promise((r) => setTimeout(r, 700));

    const sessionRes = await fetch("/api/session");
    const session = await sessionRes.json();
    const role = session?.user?.role?.toLowerCase();

    if (role === "admin") router.push("/admin");
    else if (role === "cliente") router.push("/seguimiento");
    else router.push("/");
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <Header />

      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
        Seguimiento de Reparaciones
      </h1>

      <div className="relative z-10 bg-white bg-opacity-90 p-10 rounded-2xl shadow-lg w-[400px] min-h-[360px] flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Iniciar sesión
        </h2>

        {/* ✅ FORMULARIO CORRECTO */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-3 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#2CA3E0] hover:bg-[#1b7fb5] text-white font-semibold py-2 rounded-lg transition"
          >
            Ingresar
          </button>

        </form>
        
      </div>
    </div>
  );
}
