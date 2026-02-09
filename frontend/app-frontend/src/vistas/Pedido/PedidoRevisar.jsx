import { useMemo, useState } from "react";
import clsx from "clsx";

export default function PedidoRevisar({ pedidosPendientes, onRevisarPedido, onVerDetalle }) {
  const [filtro, setFiltro] = useState("");
  const pedirObservaciones = (accion) => {
    const texto = window.prompt(`Observaciones para ${accion} (opcional):`, "");
    return texto === null ? null : texto;
  };

  const pedidosFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase();
    return (pedidosPendientes || []).filter(p => {
      const id = String(p.idPedido || "");
      const creador = p.usuarioCreador?.nombreCompleto || "";
      const estado = p.estadoPedido || "";
      return `${id} ${creador} ${estado}`.toLowerCase().includes(texto);
    });
  }, [pedidosPendientes, filtro]);

  const formatoFecha = (fecha) => (fecha ? new Date(fecha).toLocaleString() : "-");

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-3">Revisar Pedido</h2>
      <div className="flex justify-between mb-3">
        <input
          type="text"
          placeholder="Buscar por id, creador o estado"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border rounded px-2 py-1 w-96"
        />
      </div>
      {pedidosFiltrados.length === 0 && (
        <p className="text-center text-gray-500">Sin pedidos pendientes</p>
      )}
      <div className="grid grid-cols-1 gap-4">
        {pedidosFiltrados.map(pedido => (
          <div key={pedido.idPedido} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
              <div className="flex flex-col gap-1">
                <div className="text-sm text-gray-500">Pedido</div>
                <div className="text-lg font-semibold">#{pedido.idPedido}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm text-gray-500">Usuario Creador</div>
                <div className="font-semibold">
                  {pedido.usuarioCreador?.nombreCompleto || "-"}
                  {pedido.usuarioCreador?.rol?.nombreRol ? ` (${pedido.usuarioCreador.rol.nombreRol})` : ""}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm text-gray-500">Fecha Creacion</div>
                <div className="font-semibold">{formatoFecha(pedido.fechaCreacion)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm text-gray-500">Total Costo</div>
                <div className="font-semibold">${Number(pedido.totalCostoPedido || 0).toFixed(2)}</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <button
                className="bg-sky-100 text-sky-700 border border-sky-300 px-3 py-1 rounded hover:bg-sky-200 font-semibold"
                onClick={() => onVerDetalle(pedido)}
              >
                Ver Detalle
              </button>
              <div className="flex gap-2">
                <button
                  className={clsx("bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded hover:bg-green-200 font-semibold")}
                  onClick={() => {
                    const obs = pedirObservaciones("aprobar");
                    if (obs === null) return;
                    onRevisarPedido(pedido.idPedido, "APROBADO", obs);
                  }}
                >
                  Aprobar
                </button>
                <button
                  className={clsx("bg-red-100 text-red-700 border border-red-300 px-3 py-1 rounded hover:bg-red-200 font-semibold")}
                  onClick={() => {
                    const obs = pedirObservaciones("rechazar");
                    if (obs === null) return;
                    onRevisarPedido(pedido.idPedido, "RECHAZADO", obs);
                  }}
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
