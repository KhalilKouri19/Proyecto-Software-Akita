import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const hashed = await bcrypt.hash(data.Contraseña, 10);

    const user = await prisma.usuario.create({
      data: {
        Usuario: data.Usuario,
        Nombre: data.Nombre,
        Email: data.Email,
        Telefono: data.Telefono,
        Contraseña: hashed,
        Rol: data.Rol || "cliente",
      },
    });

    return Response.json(user);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error creando usuario" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany();
    return Response.json(usuarios);
  } catch (err) {
    return Response.json({ error: "Error obteniendo usuarios" }, { status: 500 });
  }
}