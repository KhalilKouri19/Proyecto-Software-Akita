import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Accion = "en_reparacion" | "listo_para_retirar" | "entregado";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ID_Dispositivo, accion } = body as {
      ID_Dispositivo?: number;
      accion?: Accion;
    };

    const deviceId = Number(ID_Dispositivo);

    if (!deviceId || Number.isNaN(deviceId)) {
      return NextResponse.json(
        { error: "ID de dispositivo inválido" },
        { status: 400 }
      );
    }

    if (!accion) {
      return NextResponse.json(
        { error: "Acción requerida" },
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

    // Última orden asociada
    let orden = await prisma.ordenreparacion.findFirst({
      where: { ID_Dispositivo: deviceId },
      orderBy: { ID_OrdenReparacion: "desc" },
      include: { presupuesto: true },
    });

    if (accion === "en_reparacion") {
      // Si no hay orden, la creamos
      if (!orden) {
        orden = await prisma.ordenreparacion.create({
          data: {
            Fecha_orden: new Date(),
            Fecha_entrada: new Date(),
            Fecha_salida: null,
            Detalle: dispositivo.Problema || "",
            ID_Dispositivo: dispositivo.ID_Dispositivo,
            ID_Usuario: dispositivo.ID_Usuario,
          },
          include: { presupuesto: true },
        });
      } else if (!orden.Fecha_entrada) {
        // Si hay orden pero sin fecha de entrada, la seteamos
        orden = await prisma.ordenreparacion.update({
          where: { ID_OrdenReparacion: orden.ID_OrdenReparacion },
          data: { Fecha_entrada: new Date() },
          include: { presupuesto: true },
        });
      }

      const updatedDevice = await prisma.dispositivo.update({
        where: { ID_Dispositivo: deviceId },
        data: { Estado: "En reparación" },
      });

      return NextResponse.json({
        success: true,
        message: "Estado actualizado a 'En reparación'",
        dispositivo: updatedDevice,
        orden,
      });
    }

    if (accion === "listo_para_retirar") {
      // 🚫 Debe tener presupuesto antes de marcar listo para retirar
      if (!orden || !orden.presupuesto) {
        return NextResponse.json(
          {
            error:
              "No se puede marcar como 'Listo para retirar' sin un presupuesto definido.",
          },
          { status: 400 }
        );
      }

      const updatedDevice = await prisma.dispositivo.update({
        where: { ID_Dispositivo: deviceId },
        data: { Estado: "Listo para retirar" },
      });

      return NextResponse.json({
        success: true,
        message: "Estado actualizado a 'Listo para retirar'",
        dispositivo: updatedDevice,
        orden,
      });
    }

    if (accion === "entregado") {
      // Si hay orden, cerramos con fecha de salida
      if (orden) {
        orden = await prisma.ordenreparacion.update({
          where: { ID_OrdenReparacion: orden.ID_OrdenReparacion },
          data: {
            Fecha_salida: new Date(),
          },
          include: { presupuesto: true },
        });
      }

      const updatedDevice = await prisma.dispositivo.update({
        where: { ID_Dispositivo: deviceId },
        data: { Estado: "Entregado" },
      });

      return NextResponse.json({
        success: true,
        message: "Reparación marcada como 'Entregado'",
        dispositivo: updatedDevice,
        orden,
      });
    }

    return NextResponse.json(
      { error: "Acción no reconocida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error al actualizar estado de orden:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado" },
      { status: 500 }
    );
  }
}
