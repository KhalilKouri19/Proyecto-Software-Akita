import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deviceId = Number(id);

    if (!deviceId || Number.isNaN(deviceId)) {
      return NextResponse.json(
        { error: "ID de dispositivo inválido" },
        { status: 400 }
      );
    }

    const dispositivo = await prisma.dispositivo.findUnique({
      where: { ID_Dispositivo: deviceId },
      include: {
        usuario: true,
      },
    });

    if (!dispositivo) {
      return NextResponse.json(
        { error: "Dispositivo no encontrado" },
        { status: 404 }
      );
    }

    const orden = await prisma.ordenreparacion.findFirst({
      where: { ID_Dispositivo: deviceId },
      orderBy: { ID_OrdenReparacion: "desc" },
      include: { presupuesto: true },
    });

    if (!orden || !orden.presupuesto) {
      return NextResponse.json(
        { error: "No hay presupuesto definido para este dispositivo" },
        { status: 400 }
      );
    }

    // 👉 Armamos el PDF con pdfkit
    const doc = new PDFDocument({ margin: 50 });

    const chunks: Buffer[] = [];

    // 🔹 Tipamos chunk como Buffer
    doc.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
    });

    // 🔹 Hacemos que la promesa devuelva un Uint8Array (BodyInit lo acepta)
    const endPromise = new Promise<Uint8Array>((resolve) => {
    doc.on("end", () => {
        const merged = Buffer.concat(chunks); // merged es un Buffer (subclase de Uint8Array)
        resolve(merged);
    });
    });

    // Encabezado
    doc
      .fontSize(18)
      .text("Akita - Servicio Técnico", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text("Comprobante de Presupuesto y Orden de Reparación", {
        align: "center",
      })
      .moveDown(1);

    // Datos generales
    doc
      .fontSize(10)
      .text(`Fecha de emisión: ${new Date().toLocaleString("es-AR")}`)
      .text(`N° de Orden: ${orden.ID_OrdenReparacion}`)
      .moveDown(1);

    // Datos del cliente
    doc
      .fontSize(12)
      .text("Datos del Cliente", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .text(`Nombre: ${dispositivo.Cliente ?? dispositivo.usuario?.Nombre ?? ""}`)
      .text(`Email: ${dispositivo.Email ?? dispositivo.usuario?.Email ?? ""}`)
      .text(`Teléfono: ${dispositivo.Telefono ?? dispositivo.usuario?.Telefono ?? ""}`)
      .moveDown(1);

    // Datos del dispositivo
    doc
      .fontSize(12)
      .text("Datos del Dispositivo", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .text(`Marca: ${dispositivo.Marca}`)
      .text(`Modelo: ${dispositivo.Modelo}`)
      .text(`Problema: ${dispositivo.Problema || "No especificado"}`)
      .text(`Estado actual: ${dispositivo.Estado}`)
      .moveDown(1);

    // Datos del presupuesto
    doc
      .fontSize(12)
      .text("Presupuesto", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .text(
        `Monto: $${Number(orden.presupuesto.Monto).toFixed(2).replace(".", ",")}`
      )
      .text(
        `Fecha de presupuesto: ${orden.presupuesto.Fecha.toLocaleDateString(
          "es-AR"
        )}`
      )
      .moveDown(1);

    // Observaciones / detalle
    doc
      .fontSize(12)
      .text("Detalle / Observaciones", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .text(
        orden.Detalle && orden.Detalle.trim().length > 0
          ? orden.Detalle
          : dispositivo.Problema || "Sin detalle adicional."
      )
      .moveDown(2);

    doc
      .fontSize(10)
      .text(
        "Este comprobante no es una factura. El monto indicado corresponde al presupuesto de reparación.",
        { align: "center" }
      );

   doc.end();

  const pdfBuffer = await endPromise; // Buffer o Uint8Array

  return new Response(pdfBuffer as any, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="ticket-dispositivo-${deviceId}.pdf"`,
    },
  });






  } catch (error) {
    console.error("Error al generar ticket:", error);
    return NextResponse.json(
      { error: "Error al generar el ticket" },
      { status: 500 }
    );
  }
}
