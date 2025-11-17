import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ID_Dispositivo, Monto, Detalle } = body;

    const deviceId = Number(ID_Dispositivo);
    const amount = Number(Monto);

    if (!deviceId || Number.isNaN(deviceId)) {
      return NextResponse.json(
        { error: "ID de dispositivo inválido" },
        { status: 400 }
      );
    }

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Monto de presupuesto inválido" },
        { status: 400 }
      );
    }

    const dispositivo = await prisma.dispositivo.findUnique({
      where: { ID_Dispositivo: deviceId },
    });

    if (!dispositivo) {
      return NextResponse.json(
        { error: "Dispositivo no encontrado" },
        { status: 404 }
      );
    }

    // 🚫 No permitir modificar presupuesto si ya está listo para retirar o entregado
    if (
      dispositivo.Estado === "Listo para retirar" ||
      dispositivo.Estado === "Entregado"
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede modificar el presupuesto cuando el dispositivo está 'Listo para retirar' o 'Entregado'.",
        },
        { status: 400 }
      );
    }

    // Buscar última orden (por si ya tiene una)
    let orden = await prisma.ordenreparacion.findFirst({
      where: { ID_Dispositivo: deviceId },
      orderBy: { ID_OrdenReparacion: "desc" },
      include: { presupuesto: true },
    });

    // Si no hay orden, crearla
    if (!orden) {
      orden = await prisma.ordenreparacion.create({
        data: {
          Fecha_orden: new Date(),
          Fecha_entrada: null,
          Fecha_salida: null,
          Detalle: Detalle || dispositivo.Problema || "",
          ID_Dispositivo: dispositivo.ID_Dispositivo,
          ID_Usuario: dispositivo.ID_Usuario,
        },
        include: { presupuesto: true },
      });
    }

    // Si ya tenía un presupuesto, lo actualizamos (solo si aún NO está listo para retirar)
    let presupuesto;
    if (orden.presupuesto) {
      presupuesto = await prisma.presupuesto.update({
        where: { ID_Presupuesto: orden.presupuesto.ID_Presupuesto },
        data: {
          Monto: amount,
          Fecha: new Date(),
        },
      });
    } else {
      // Si no tenía presupuesto, lo creamos
      presupuesto = await prisma.presupuesto.create({
        data: {
          Monto: amount,
          Fecha: new Date(),
          ID_OrdenReparacion: orden.ID_OrdenReparacion,
        },
      });
    }

    // Actualizar estado del dispositivo a "En reparación"
    const updatedDevice = await prisma.dispositivo.update({
      where: { ID_Dispositivo: deviceId },
      data: {
        Estado: "En reparación",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Presupuesto definido/actualizado, orden de reparación creada o actualizada y estado cambiado a 'En reparación'.",
      dispositivo: updatedDevice,
      orden: { ...orden, presupuesto },
      presupuesto,
    });
  } catch (error) {
    console.error("Error al definir presupuesto:", error);
    return NextResponse.json(
      { error: "Error al definir presupuesto" },
      { status: 500 }
    );
  }
}
