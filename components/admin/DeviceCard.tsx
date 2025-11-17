"use client";

import { useState } from "react";

interface Device {
  ID_Dispositivo: number;
  Marca: string;
  Modelo: string;
  Estado: string;
  Problema: string;
  Cliente: string;
  Email: string;
  Telefono: string;
  UsuarioAcceso: string;
}

export default function DeviceCard({
  device,
  onDeleted,
  onUpdated,
}: {
  device: Device;
  onDeleted: () => void;
  onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [marca, setMarca] = useState(device.Marca);
  const [modelo, setModelo] = useState(device.Modelo);
  const [estado, setEstado] = useState(device.Estado);
  const [problema, setProblema] = useState(device.Problema || "");

  const [clienteNombre, setClienteNombre] = useState(device.Cliente);
  const [email, setEmail] = useState(device.Email);
  const [telefono, setTelefono] = useState(device.Telefono);
  const [usuarioAcceso, setUsuarioAcceso] = useState(device.UsuarioAcceso || "");
  const [nuevaPassword, setNuevaPassword] = useState("");

  const [presupuesto, setPresupuesto] = useState<string>("");
  const [settingBudget, setSettingBudget] = useState(false);
  const [changingFlow, setChangingFlow] = useState(false);

  const isBudgetLocked =
    estado === "Listo para retirar" || estado === "Entregado";

  // 🔹 Eliminar dispositivo
  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el dispositivo ${marca} ${modelo}?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/dispositivos/${device.ID_Dispositivo}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      try {
        await res.json();
      } catch {
        console.warn("Respuesta sin JSON del servidor al eliminar");
      }

      alert("🗑️ Dispositivo eliminado correctamente");
      onDeleted();
    } catch (error) {
      console.error("Error al eliminar dispositivo:", error);
      alert("❌ Error al eliminar el dispositivo");
    } finally {
      setDeleting(false);
    }
  };

  // 🔹 Guardar edición de datos del dispositivo + usuario
  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/dispositivos/${device.ID_Dispositivo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Marca: marca,
          Modelo: modelo,
          Problema: problema,
          Cliente: clienteNombre,
          Email: email,
          Telefono: telefono,
          UsuarioAcceso: usuarioAcceso,
          NuevaPassword: nuevaPassword || null,
        }),
      });

      if (!res.ok) throw new Error("Error al editar");

      try {
        await res.json();
      } catch {
        console.warn("Respuesta sin JSON del servidor al editar");
      }

      alert("✅ Dispositivo y datos del cliente actualizados correctamente");
      setEditing(false);
      setNuevaPassword("");
      onUpdated();
    } catch (error) {
      console.error("Error al editar dispositivo:", error);
      alert("❌ Error al editar el dispositivo");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Definir presupuesto (crea/actualiza orden + presupuesto + cambia estado a En reparación)
  const handleSetPresupuesto = async () => {
    if (isBudgetLocked) {
      alert(
        "El presupuesto no puede modificarse porque el dispositivo está 'Listo para retirar' o 'Entregado'."
      );
      return;
    }

    if (!presupuesto) {
      alert("Ingresá un monto de presupuesto");
      return;
    }

    const montoNumber = Number(presupuesto);
    if (Number.isNaN(montoNumber) || montoNumber <= 0) {
      alert("El monto de presupuesto debe ser un número mayor a 0");
      return;
    }

    setSettingBudget(true);
    try {
      const res = await fetch("/api/presupuestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID_Dispositivo: device.ID_Dispositivo,
          Monto: montoNumber,
          Detalle: problema,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Error al definir presupuesto");
        return;
      }

      alert("✅ Presupuesto definido y orden de reparación generada/actualizada");
      setEstado("En reparación");
      onUpdated();
    } catch (error) {
      console.error("Error al definir presupuesto:", error);
      alert("❌ Error al definir el presupuesto");
    } finally {
      setSettingBudget(false);
    }
  };

  // 🔹 Cambiar estado de flujo
  const handleFlowAction = async (
    accion: "en_reparacion" | "listo_para_retirar" | "entregado"
  ) => {
    setChangingFlow(true);
    try {
      const res = await fetch("/api/ordenes/estado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID_Dispositivo: device.ID_Dispositivo,
          accion,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Error al actualizar estado");
        return;
      }

      if (accion === "en_reparacion") setEstado("En reparación");
      if (accion === "listo_para_retirar") setEstado("Listo para retirar");
      if (accion === "entregado") setEstado("Entregado");

      alert(data?.message || "Estado actualizado");
      onUpdated();
    } catch (error) {
      console.error("Error al cambiar estado de flujo:", error);
      alert("❌ Error al actualizar el estado");
    } finally {
      setChangingFlow(false);
    }
  };

  // 🔹 Descargar comprobante PDF
  const handleDownloadTicket = () => {
    window.open(`/api/ticket/${device.ID_Dispositivo}`, "_blank");
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#2CA3E0]">
            {marca} {modelo}
          </h3>
          <p className="text-sm text-gray-500">
            Cliente: <span className="font-medium">{clienteNombre}</span>
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-[#2CA3E0] font-medium hover:underline"
        >
          {expanded ? "Ocultar" : "Ver más"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 border-t pt-3 text-sm text-gray-700 space-y-2">
          {editing ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Marca:</label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                />

                <label className="font-medium">Modelo:</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                />

                <label className="font-medium">Problema:</label>
                <textarea
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                />

                <label className="font-medium">Nombre del cliente:</label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                />

                <label className="font-medium">Correo:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                />

                <label className="font-medium">Teléfono:</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                />

                <label className="font-medium">Usuario de acceso:</label>
                <input
                  type="text"
                  value={usuarioAcceso}
                  onChange={(e) => setUsuarioAcceso(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                />

                <label className="font-medium">Nueva contraseña (opcional):</label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditing(false);
                    setNuevaPassword("");
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>Problema:</strong> {problema || "No especificado"}
              </p>
              <p>
                <strong>Correo:</strong> {email}
              </p>
              <p>
                <strong>Teléfono:</strong> {telefono}
              </p>
              <p>
                <strong>Usuario de acceso:</strong>{" "}
                {usuarioAcceso || "No asignado"}
              </p>
              <p>
                <strong>Estado:</strong> {estado}
              </p>

              {/* Presupuesto */}
              <div className="mt-3 border-t pt-3">
                <p className="font-medium">Presupuesto</p>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(e.target.value)}
                    className="border rounded px-2 py-1 text-gray-900 w-32"
                    placeholder="Monto"
                    disabled={isBudgetLocked || settingBudget}
                  />
                  <button
                    onClick={handleSetPresupuesto}
                    disabled={settingBudget || isBudgetLocked}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {settingBudget ? "Guardando..." : "Definir presupuesto"}
                  </button>
                </div>
              </div>

              {/* Botón para descargar comprobante */}
              <div className="mt-3">
                <button
                  onClick={handleDownloadTicket}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Descargar comprobante
                </button>
              </div>

              {/* Botones de flujo de reparación */}
              <div className="mt-3 flex flex-wrap gap-2">
                {estado === "A presupuestar" && (
                  <button
                    onClick={() => handleFlowAction("en_reparacion")}
                    disabled={changingFlow}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {changingFlow ? "Actualizando..." : "Marcar en reparación"}
                  </button>
                )}
                {estado === "En reparación" && (
                  <button
                    onClick={() => handleFlowAction("listo_para_retirar")}
                    disabled={changingFlow}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {changingFlow ? "Actualizando..." : "Listo para retirar"}
                  </button>
                )}
                {estado === "Listo para retirar" && (
                  <button
                    onClick={() => handleFlowAction("entregado")}
                    disabled={changingFlow}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {changingFlow ? "Actualizando..." : "Marcar entregado"}
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
