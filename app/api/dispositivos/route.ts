import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

// ✅ GET — Listar dispositivos
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.ID_Dispositivo,
        d.Marca,
        d.Modelo,
        d.Estado,
        d.Problema,
        d.Cliente,
        d.Email,
        d.Telefono
      FROM Dispositivo d
      ORDER BY d.ID_Dispositivo DESC
    `);

    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error al obtener dispositivos:", error);
    return NextResponse.json(
      { error: "Error al obtener dispositivos" },
      { status: 500 }
    );
  }
}

// ✅ POST — Agregar dispositivo y crear orden de reparación
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      Marca,
      Modelo,
      Estado,
      Problema,
      Cliente,
      Email,
      Telefono,
      Usuario,
      Password,
    } = data;

    // 🔹 1) Verificar si el usuario ya existe
    const [existingUser]: any = await db.query(
      "SELECT ID_Usuario FROM Usuario WHERE Usuario = ? LIMIT 1",
      [Usuario]
    );

    let userId: number;

    if (existingUser.length > 0) {
      userId = existingUser[0].ID_Usuario;
    } else {
      // 🔹 2) Crear nuevo usuario con contraseña hasheada
      const hashedPass = await bcrypt.hash(Password, 10);

      const [result]: any = await db.query(
        "INSERT INTO Usuario (Usuario, Nombre, Email, Telefono, Contraseña, Rol) VALUES (?, ?, ?, ?, ?, 'cliente')",
        [Usuario, Cliente, Email, Telefono, hashedPass]
      );
      userId = result.insertId;
    }

    // 🔹 3) Insertar dispositivo asociado al usuario
    const [deviceResult]: any = await db.query(
      "INSERT INTO Dispositivo (Marca, Modelo, Estado, Problema, Cliente, Email, Telefono, ID_Usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [Marca, Modelo, Estado, Problema, Cliente, Email, Telefono, userId]
    );

    const deviceId = deviceResult.insertId;

    // 🔹 4) Crear orden de reparación automáticamente
    await db.query(
      "INSERT INTO OrdenReparacion (Fecha_orden, ID_Dispositivo, ID_Usuario) VALUES (CURRENT_DATE, ?, ?)",
      [deviceId, userId]
    );

    return NextResponse.json({
      message: "✅ Dispositivo agregado y orden de reparación creada correctamente",
    });
  } catch (error) {
    console.error("Error al agregar dispositivo:", error);
    return NextResponse.json(
      { error: "Error al agregar dispositivo" },
      { status: 500 }
    );
  }
}
