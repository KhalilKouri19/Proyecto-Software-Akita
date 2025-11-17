import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 👇 Desarmamos la Promise de params
    const { id } = await context.params;
    const userId = Number(id);

    if (!userId || Number.isNaN(userId)) {
      return Response.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // 🔹 Traemos SOLO los dispositivos del usuario
    const dispositivos = await prisma.dispositivo.findMany({
      where: { ID_Usuario: userId },
    });

    // 🔹 Formateamos al shape que espera el frontend
    const formatted = dispositivos.map((d) => ({
      ID_Dispositivo: d.ID_Dispositivo,
      Marca: d.Marca || "",
      Modelo: d.Modelo || "",
      Estado: d.Estado || "",
      Problema: d.Problema || "",
      Presupuesto: null,
      FechaPresupuesto: null,
    }));

    return Response.json(formatted);
  } catch (err) {
    console.error("Error en /api/seguimiento/[id]:", err);
    return Response.json(
      { error: "Error al obtener dispositivos" },
      { status: 500 }
    );
  }
}
