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

  const [presupuesto, setPresupuesto] = useState<string>("");
  const [settingBudget, setSettingBudget] = useState(false);

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

  // 🔹 Guardar edición de datos del dispositivo
  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/dispositivos/${device.ID_Dispositivo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Marca: marca,
          Modelo: modelo,
          Estado: estado,
          Problema: problema,
        }),
      });

      if (!res.ok) throw new Error("Error al editar");

      try {
        await res.json();
      } catch {
        console.warn("Respuesta sin JSON del servidor al editar");
      }

      alert("✅ Dispositivo actualizado correctamente");
      setEditing(false);
      onUpdated();
    } catch (error) {
      console.error("Error al editar dispositivo:", error);
      alert("❌ Error al editar el dispositivo");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Definir presupuesto (crea orden + presupuesto + cambia estado)
  const handleSetPresupuesto = async () => {
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

      alert("✅ Presupuesto definido y orden de reparación generada");
      setEstado("En reparación");
      onUpdated();
    } catch (error) {
      console.error("Error al definir presupuesto:", error);
      alert("❌ Error al definir el presupuesto");
    } finally {
      setSettingBudget(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#2CA3E0]">
            {marca} {modelo}
          </h3>
          <p className="text-sm text-gray-500">
            Cliente: <span className="font-medium">{device.Cliente}</span>
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

                <label className="font-medium">Estado:</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900"
                >
                  <option value="A presupuestar">A presupuestar</option>
                  <option value="En reparación">En reparación</option>
                  <option value="Listo para retirar">Listo para retirar</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setEditing(false)}
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
                <strong>Correo:</strong> {device.Email}
              </p>
              <p>
                <strong>Teléfono:</strong> {device.Telefono}
              </p>
              <p>
                <strong>Estado:</strong> {estado}</p>

              {/* 🔹 Bloque para definir presupuesto */}
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
                  />
                  <button
                    onClick={handleSetPresupuesto}
                    disabled={settingBudget}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    {settingBudget ? "Guardando..." : "Definir presupuesto"}
                  </button>
                </div>
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
