import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link"; // 👈 Importamos Link

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/seguimiento");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <p>Bienvenido, {session.user?.name}</p>

      {/* 🔹 Botón de cerrar sesión */}
      <Link
        href="/api/auth/signout"
        className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Cerrar sesión
      </Link>
    </div>
  );
}
