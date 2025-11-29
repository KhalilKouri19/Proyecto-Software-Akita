import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// LISTAR todos los dispositivos (con info de usuario)
export async function GET() {
  try {
    const dispositivos = await prisma.dispositivo.findMany({
      include: {
        usuario: true,
      },
      orderBy: {
        ID_Dispositivo: "desc",
      },
    });

    const formatted = dispositivos.map((d) => ({
      ID_Dispositivo: d.ID_Dispositivo,
      Marca: d.Marca || "",
      Modelo: d.Modelo || "",
      Estado: d.Estado || "",
      Problema: d.Problema || "",
      Cliente: d.Cliente || "",
      Email: d.Email || "",
      Telefono: d.Telefono || "",
      UsuarioAcceso: d.usuario?.Usuario || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error al obtener dispositivos:", error);
    return NextResponse.json(
      { error: "Error al obtener dispositivos" },
      { status: 500 }
    );
  }
}

// ⬇️ Mantener aquí tu POST como ya lo teníamos (crear usuario + dispositivo)


// ✅ CREAR un dispositivo nuevo + usuario cliente si no existe
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      Marca,
      Modelo,
      Problema,
      Estado,
      Cliente,
      Email,
      Telefono,
      Usuario,
      Password,
    } = data;

    // 🔎 Validar datos mínimos
    if (
      !Cliente ||
      !Email ||
      !Telefono ||
      !Usuario ||
      !Password
    ) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios del cliente o usuario" },
        { status: 400 }
      );
    }

    // 1) Buscar usuario existente por nombre de usuario
    let user = await prisma.usuario.findUnique({
      where: { Usuario },
    });

    // 2) Si no existe, crearlo como cliente
    if (!user) {
      const hashed = await bcrypt.hash(Password, 10);

      user = await prisma.usuario.create({
        data: {
          Usuario,
          Nombre: Cliente,
          Email,
          Telefono,
          Contraseña: hashed,
          Rol: "cliente",
        },
      });
    }

    // 3) Crear el dispositivo asociado a ese usuario
    const dispositivo = await prisma.dispositivo.create({
      data: {
        Estado: Estado || "A presupuestar",
        Modelo: Modelo || "",
        Marca: Marca || "",
        Problema: Problema || "",
        Cliente,
        Email,
        Telefono,
        ID_Usuario: user.ID_Usuario,
      },
    });

    return NextResponse.json(dispositivo, { status: 201 });
  } catch (error) {
    console.error("Error al crear dispositivo:", error);
    return NextResponse.json(
      { error: "Error al crear dispositivo" },
      { status: 500 }
    );
  }
}
