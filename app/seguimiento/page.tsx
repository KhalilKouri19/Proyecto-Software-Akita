// app/seguimiento/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

type Dispositivo = {
  ID_Dispositivo: number;
  NombreDispositivo: string;
  Marca: string;
  Modelo: string;
  Estado: string;
  Problema?: string;
  Presupuesto?: number | null;
  FechaPresupuesto?: string | null;
};

export default async function SeguimientoPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const [rows]: any = await db.query(
    `
    SELECT 
      d.ID_Dispositivo,
      d.Marca,
      d.Modelo,
      d.Estado,
      d.Problema,
      p.Monto AS Presupuesto,
      p.Fecha AS FechaPresupuesto
    FROM Dispositivo d
    LEFT JOIN OrdenReparacion o ON o.ID_Dispositivo = d.ID_Dispositivo
    LEFT JOIN Presupuesto p ON p.ID_OrdenReparacion = o.ID_OrdenReparacion
    WHERE d.ID_Usuario = (SELECT ID_Usuario FROM Usuario WHERE Email = ?)
    ORDER BY d.ID_Dispositivo DESC
    `,
    [session.user.email]
  );

  const dispositivos: Dispositivo[] = rows;

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center pt-32 pb-16">
      {/* 🔹 Encabezado superior */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-10">
        <h1 className="text-3xl font-bold text-[#2CA3E0]">
          Bienvenido, {session.user?.name}
        </h1>
        <Link
          href="/api/auth/signout?callbackUrl=/login"
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Cerrar sesión
        </Link>
      </div>

      {/* 🔹 Contenedor centrado */}
      <div className="flex justify-center w-full">
        {dispositivos.length === 0 ? (
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

                <p className="text-sm text-gray-700"><strong>Marca:</strong> {d.Marca}</p>
                <p className="text-sm text-gray-700"><strong>Modelo:</strong> {d.Modelo}</p>
                <p className="text-sm text-gray-700"><strong>Estado:</strong> {d.Estado}</p>
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
