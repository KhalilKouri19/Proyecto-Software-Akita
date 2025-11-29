// app/api/login/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { Usuario, Contraseña } = await req.json();

    const user = await prisma.usuario.findUnique({
      where: { Usuario },
    });

    if (!user) {
      return Response.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(Contraseña, user.Contraseña);
    if (!valid) {
      return Response.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const userForClient = {
      ID_Usuario: user.ID_Usuario,
      Usuario: user.Usuario,
      Nombre: user.Nombre,
      Email: user.Email,
      Rol: user.Rol, // "admin" | "cliente"
    };

    return Response.json({
      message: "Login correcto",
      user: userForClient,
    });
  } catch (error) {
    console.error("Error en /api/login:", error);
    return Response.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
