"use client";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Iniciar sesión
        </h1>


        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500"
          required
        />


        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded mb-3"
        >
          Ingresar
        </button>

        {/* 🔹 Botón para volver al inicio */}
        <Link
          href="/"
          className="block text-center bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded"
        >
          Volver al inicio
        </Link>
      </form>
    </div>
  );
}
