import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ PATCH — editar un dispositivo
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { error: "No se enviaron datos para actualizar" },
        { status: 400 }
      );
    }

    const { Marca, Modelo, Estado, Problema } = body;

    const [result]: any = await db.query(
      `
      UPDATE Dispositivo 
      SET Marca = ?, Modelo = ?, Estado = ?, Problema = ?
      WHERE ID_Dispositivo = ?
      `,
      [Marca, Modelo, Estado, Problema, id]
    );

    // ✅ Devolver siempre JSON con mensaje
    return NextResponse.json({
      success: true,
      message: "Dispositivo actualizado correctamente",
      result,
    });
  } catch (error) {
    console.error("Error al actualizar dispositivo:", error);
    return NextResponse.json(
      { error: "Error al actualizar dispositivo" },
      { status: 500 }
    );
  }
}
