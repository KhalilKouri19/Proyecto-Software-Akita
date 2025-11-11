import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [rows]: any = await db.query(
      `
      SELECT 
        d.ID_Dispositivo,
        d.NombreDispositivo,
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

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener dispositivos del cliente:", error);
    return NextResponse.json({ error: "Error al obtener dispositivos" }, { status: 500 });
  }
}
