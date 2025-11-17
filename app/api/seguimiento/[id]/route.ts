import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);

    if (!userId || Number.isNaN(userId)) {
      return Response.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // 1) Traemos los dispositivos del usuario
    const dispositivos = await prisma.dispositivo.findMany({
      where: { ID_Usuario: userId },
    });

    // 2) Para cada dispositivo, buscamos la última orden + presupuesto
    const formatted = await Promise.all(
      dispositivos.map(async (d) => {
        const orden = await prisma.ordenreparacion.findFirst({
          where: { ID_Dispositivo: d.ID_Dispositivo },
          orderBy: { ID_OrdenReparacion: "desc" },
          include: {
            presupuesto: true,
          },
        });

        return {
          ID_Dispositivo: d.ID_Dispositivo,
          Marca: d.Marca || "",
          Modelo: d.Modelo || "",
          Estado: d.Estado || "",
          Problema: d.Problema || "",
          Presupuesto: orden?.presupuesto?.Monto ?? null,
          FechaPresupuesto: orden?.presupuesto?.Fecha ?? null,
        };
      })
    );

    return Response.json(formatted);
  } catch (err) {
    console.error("Error en /api/seguimiento/[id]:", err);
    return Response.json(
      { error: "Error al obtener dispositivos" },
      { status: 500 }
    );
  }
}
