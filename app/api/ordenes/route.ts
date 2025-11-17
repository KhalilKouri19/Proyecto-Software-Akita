import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const orden = await prisma.ordenreparacion.create({
      data: {
        Fecha_orden: new Date(data.Fecha_orden),
        Fecha_entrada: data.Fecha_entrada ? new Date(data.Fecha_entrada) : null,
        Fecha_salida: data.Fecha_salida ? new Date(data.Fecha_salida) : null,
        Detalle: data.Detalle,
        ID_Dispositivo: data.ID_Dispositivo,
        ID_Usuario: data.ID_Usuario,
      },
    });

    return Response.json(orden);
  } catch (err) {
    return Response.json({ error: "Error creando orden" }, { status: 500 });
  }
}