import React, { useRef, useState } from "react";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { generarComprobanteVentaServicio } from "@/servicios/serviciosVentas";
import { mostrarComprobantePdf } from "@/componentes/comprobantePdf";

export default function Ventas() {
  const [modo, setModo] = useState("buscar");
  const [comprobante, setComprobante] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const mensajeRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
  };

  const extraerMensajeError = (e, porDefecto) => {
    if (e?.response?.data) {
      const data = e.response.data;
      if (typeof data === "string") return data;
      if (data?.message) return data.message;
      if (data?.detail) return data.detail;
      if (Array.isArray(data)) return data.map(d => d.msg || JSON.stringify(d)).join(" | ");
      if (typeof data === "object" && data?.msg) return data.msg;
      return JSON.stringify(data);
    }
    return porDefecto;
  };

  const onSubmit = async (datos) => {
    try {
      const idVenta = Number(datos.idVenta);
      if (!idVenta || idVenta < 1) {
        mostrarMensaje("error", "Debe ingresar un ID de venta válido");
        return;
      }
      const resp = await generarComprobanteVentaServicio(idVenta);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al generar comprobante");
        return;
      }
      setComprobante(resp.data);
      setModo("comprobante");
      setMensaje(null);
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al generar comprobante"));
    }
  };

  const parametros = comprobante?.parametros || [];
  const parametrosMap = parametros.reduce((acc, p) => {
    acc[p.claveParametro] = p.valorParametro;
    return acc;
  }, {});

  const venta = comprobante?.venta;

  return (
    <main className="flex flex-col h-full w-full p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Ventas</h1>
      {mensaje && (
        <div
          ref={mensajeRef}
          tabIndex={-1}
          className={clsx("p-3 mb-4 rounded text-white text-center font-semibold outline-none", {
            "bg-green-600": mensaje.tipo === "exito",
            "bg-red-600": mensaje.tipo === "error",
          })}
          role="alert"
          aria-live="assertive"
        >
          {mensaje.texto}
        </div>
      )}

      {modo === "buscar" && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-4 mb-6 flex flex-col gap-4 items-start max-w-md mx-auto">
          <label className="font-semibold">ID Venta:</label>
          <input
            {...register("idVenta", { required: "ID requerido", min: { value: 1, message: "Debe ser mayor a 0" } })}
            type="number"
            min={1}
            className={clsx("border rounded px-3 py-2 w-full", { "border-red-600 bg-red-50": errors.idVenta })}
            placeholder="Ej: 1"
          />
          {errors.idVenta && <p className="text-red-600 text-sm">{errors.idVenta.message}</p>}
          <div className="flex justify-end w-full">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">
              Generar comprobante
            </button>
          </div>
        </form>
      )}

      {modo === "comprobante" && comprobante && (
        <section className="w-full max-w-4xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200">
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => { setModo("buscar"); setComprobante(null); reset({ idVenta: "" }); }}
              className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow focus:outline-none"
              title="Regresar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-semibold flex-1 text-center">Generar comprobante</h2>
            <button
              type="button"
              onClick={() => mostrarComprobantePdf(comprobante)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Ver PDF
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Negocio</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{parametrosMap.nombreNegocio || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Dirección</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{parametrosMap.direccionNegocio || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Teléfono</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{parametrosMap.telefonoNegocio || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Correo</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{parametrosMap.correoNegocio || "-"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">ID Venta</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{venta?.idVenta}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Fecha</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{venta?.fechaVenta ? new Date(venta.fechaVenta).toLocaleString() : "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Cliente</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{venta?.cliente?.nombreCliente || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Cédula</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{venta?.cliente?.cedulaCliente || "-"}</div>
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Producto</th>
                  <th className="px-2 py-1 border">Cantidad</th>
                  <th className="px-2 py-1 border">P. Unitario</th>
                  <th className="px-2 py-1 border">Descuento</th>
                  <th className="px-2 py-1 border">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(venta?.detalles || []).map(d => (
                  <tr key={d.idDetalleVenta} className="border-b">
                    <td className="px-2 py-1 border">{d.producto?.nombreProducto}</td>
                    <td className="px-2 py-1 border text-center">{d.cantidadVendida}</td>
                    <td className="px-2 py-1 border text-center">${Number(d.precioUnitarioVendido || 0).toFixed(2)}</td>
                    <td className="px-2 py-1 border text-center">${Number(d.valorDescuentoProducto || 0).toFixed(2)}</td>
                    <td className="px-2 py-1 border text-center">${Number(d.subtotalProducto || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
              <p className="text-gray-600 text-sm mb-1">Subtotal</p>
              <div className="text-lg font-semibold">${Number(venta?.subtotalVenta || 0).toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
              <p className="text-gray-600 text-sm mb-1">IVA</p>
              <div className="text-lg font-semibold">${Number(venta?.totalIVA || 0).toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
              <p className="text-gray-600 text-sm mb-1">Total</p>
              <div className="text-lg font-semibold">${Number(venta?.totalPagar || 0).toFixed(2)}</div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
