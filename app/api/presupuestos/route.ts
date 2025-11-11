import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ POST — Crear presupuesto solo si no existe
export async function POST(req: Request) {
  try {
    const { ID_Dispositivo, Monto } = await req.json();

    // Buscar ID_OrdenReparacion asociado
    const [orden]: any = await db.query(
      "SELECT ID_OrdenReparacion FROM OrdenReparacion WHERE ID_Dispositivo = ? LIMIT 1",
      [ID_Dispositivo]
    );

    if (!orden.length) {
      return NextResponse.json(
        { error: "No se encontró la orden de reparación para este dispositivo" },
        { status: 404 }
      );
    }

    const idOrden = orden[0].ID_OrdenReparacion;

    // Verificar si ya tiene un presupuesto
    const [presupuestoExistente]: any = await db.query(
      "SELECT ID_Presupuesto FROM Presupuesto WHERE ID_OrdenReparacion = ? LIMIT 1",
      [idOrden]
    );

    if (presupuestoExistente.length > 0) {
      return NextResponse.json(
        { error: "Este dispositivo ya tiene un presupuesto asignado." },
        { status: 400 }
      );
    }

    // Crear nuevo presupuesto con fecha automática
    await db.query(
      "INSERT INTO Presupuesto (Monto, Fecha, ID_OrdenReparacion) VALUES (?, CURRENT_DATE, ?)",
      [Monto, idOrden]
    );

    // 🔹 Actualizar estado del dispositivo
    await db.query(
      "UPDATE Dispositivo SET Estado = 'En reparación' WHERE ID_Dispositivo = ?",
      [ID_Dispositivo]
    );

    return NextResponse.json({ message: "Presupuesto asignado correctamente" });
  } catch (error) {
    console.error("Error al asignar presupuesto:", error);
    return NextResponse.json(
      { error: "Error al asignar presupuesto" },
      { status: 500 }
    );
  }
}
