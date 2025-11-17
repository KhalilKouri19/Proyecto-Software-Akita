import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// ✅ OBTENER un dispositivo por ID
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

// ✅ PATCH — editar dispositivo + datos del usuario
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

    const {
      Marca,
      Modelo,
      Problema,
      Cliente,
      Email,
      Telefono,
      UsuarioAcceso,
      NuevaPassword,
    } = body;

    const dispositivo = await prisma.dispositivo.findUnique({
      where: { ID_Dispositivo: deviceId },
      include: { usuario: true },
    });

    if (!dispositivo) {
      return NextResponse.json(
        { error: "Dispositivo no encontrado" },
        { status: 404 }
      );
    }

    let hashedPassword: string | undefined;
    if (NuevaPassword && NuevaPassword.trim().length > 0) {
      hashedPassword = await bcrypt.hash(NuevaPassword, 10);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) Actualizar dispositivo
      const updatedDevice = await tx.dispositivo.update({
        where: { ID_Dispositivo: deviceId },
        data: {
          Marca,
          Modelo,
          Problema,
          Cliente,
          Email,
          Telefono,
        },
      });

      // 2) Actualizar usuario relacionado (si existe)
      if (dispositivo.ID_Usuario) {
        const userUpdateData: any = {
          Nombre: Cliente,
          Email,
          Telefono,
        };

        if (UsuarioAcceso && UsuarioAcceso.trim().length > 0) {
          userUpdateData.Usuario = UsuarioAcceso;
        }

        if (hashedPassword) {
          userUpdateData.Contraseña = hashedPassword;
        }

        await tx.usuario.update({
          where: { ID_Usuario: dispositivo.ID_Usuario },
          data: userUpdateData,
        });
      }

      return updatedDevice;
    });

    return NextResponse.json({
      success: true,
      message: "Dispositivo y datos del cliente actualizados correctamente",
      dispositivo: result,
    });
  } catch (error) {
    console.error("Error al actualizar dispositivo:", error);
    return NextResponse.json(
      { error: "Error al actualizar dispositivo" },
      { status: 500 }
    );
  }
}

// ✅ DELETE — eliminar dispositivo + órdenes + presupuestos asociados
// y, si el usuario queda sin dispositivos, borrar también el usuario
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

    // Obtenemos el dispositivo para conocer el ID_Usuario
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { ID_Dispositivo: deviceId },
    });

    if (!dispositivo) {
      return NextResponse.json(
        { error: "Dispositivo no encontrado" },
        { status: 404 }
      );
    }

    const userId = dispositivo.ID_Usuario;

    await prisma.$transaction(async (tx) => {
      // 1) Buscar órdenes del dispositivo
      const ordenes = await tx.ordenreparacion.findMany({
        where: { ID_Dispositivo: deviceId },
      });

      const ordenIds = ordenes.map((o) => o.ID_OrdenReparacion);

      // 2) Borrar presupuestos y órdenes relacionadas
      if (ordenIds.length > 0) {
        await tx.presupuesto.deleteMany({
          where: { ID_OrdenReparacion: { in: ordenIds } },
        });

        await tx.ordenreparacion.deleteMany({
          where: { ID_OrdenReparacion: { in: ordenIds } },
        });
      }

      // 3) Borrar el dispositivo
      await tx.dispositivo.delete({
        where: { ID_Dispositivo: deviceId },
      });

      // 4) Si ese usuario ya no tiene más dispositivos, borrar también el usuario
      if (userId) {
        const remaining = await tx.dispositivo.count({
          where: { ID_Usuario: userId },
        });

        if (remaining === 0) {
          await tx.usuario.delete({
            where: { ID_Usuario: userId },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message:
        "Dispositivo, datos asociados y usuario (si quedó sin dispositivos) eliminados correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar dispositivo:", error);
    return NextResponse.json(
      { error: "Error al eliminar dispositivo" },
      { status: 500 }
    );
  }
}
