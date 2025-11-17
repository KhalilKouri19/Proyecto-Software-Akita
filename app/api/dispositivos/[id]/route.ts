import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ OBTENER un dispositivo por ID (por si lo usás en algún lado)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deviceId = Number(id);

    if (!deviceId || Number.isNaN(deviceId)) {
      return NextResponse.json(
        { error: "ID inválido" },
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

    return NextResponse.json(dispositivo);
  } catch (error) {
    console.error("Error al obtener dispositivo:", error);
    return NextResponse.json(
      { error: "Error al obtener dispositivo" },
      { status: 500 }
    );
  }
}

// ✅ PATCH — editar un dispositivo
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deviceId = Number(id);

    if (!deviceId || Number.isNaN(deviceId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { error: "No se enviaron datos para actualizar" },
        { status: 400 }
      );
    }

    const { Marca, Modelo, Estado, Problema } = body;

    const updated = await prisma.dispositivo.update({
      where: { ID_Dispositivo: deviceId },
      data: {
        Marca,
        Modelo,
        Estado,
        Problema,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dispositivo actualizado correctamente",
      dispositivo: updated,
    });
  } catch (error) {
    console.error("Error al actualizar dispositivo:", error);
    return NextResponse.json(
      { error: "Error al actualizar dispositivo" },
      { status: 500 }
    );
  }
}

// ✅ DELETE — eliminar dispositivo
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deviceId = Number(id);

    if (!deviceId || Number.isNaN(deviceId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    await prisma.dispositivo.delete({
      where: { ID_Dispositivo: deviceId },
    });

    return NextResponse.json({
      success: true,
      message: "Dispositivo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar dispositivo:", error);
    return NextResponse.json(
      { error: "Error al eliminar dispositivo" },
      { status: 500 }
    );
  }
}
