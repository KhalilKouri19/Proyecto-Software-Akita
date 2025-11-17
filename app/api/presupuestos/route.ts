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

    // 1) Traer el dispositivo para saber a qué usuario pertenece
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { ID_Dispositivo: deviceId },
    });

    if (!dispositivo) {
      return NextResponse.json(
        { error: "Dispositivo no encontrado" },
        { status: 404 }
      );
    }

    // 2) Crear la orden de reparación
    const orden = await prisma.ordenreparacion.create({
      data: {
        Fecha_orden: new Date(),
        Fecha_entrada: null,
        Fecha_salida: null,
        Detalle: Detalle || dispositivo.Problema || "",
        ID_Dispositivo: dispositivo.ID_Dispositivo,
        ID_Usuario: dispositivo.ID_Usuario,
      },
    });

    // 3) Crear el presupuesto asociado a esa orden
    const presupuesto = await prisma.presupuesto.create({
      data: {
        Monto: amount,
        Fecha: new Date(),
        ID_OrdenReparacion: orden.ID_OrdenReparacion,
      },
    });

    // 4) Actualizar estado del dispositivo a "En reparación"
    const updatedDevice = await prisma.dispositivo.update({
      where: { ID_Dispositivo: deviceId },
      data: {
        Estado: "En reparación",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Presupuesto definido, orden de reparación creada y estado actualizado.",
      dispositivo: updatedDevice,
      orden,
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
