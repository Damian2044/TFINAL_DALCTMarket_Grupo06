import { useMemo, useState } from "react";
import clsx from "clsx";

export default function PedidoRecepcionar({ detallesRecepcion, onRecepcionarDetalle, onVerDetalle }) {
  const [filtro, setFiltro] = useState("");
  const [abiertos, setAbiertos] = useState({});

  const detallesFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase();
    return (detallesRecepcion || []).filter(d => {
      const pedidoId = String(d.idPedido || d.pedido?.idPedido || "");
      const creador = d.pedido?.usuarioCreador?.nombreCompleto || "";
      const prod = d.producto?.nombreProducto || "";
      return `${pedidoId} ${creador} ${prod}`.toLowerCase().includes(texto);
    });
  }, [detallesRecepcion, filtro]);

  const pedidosAgrupados = useMemo(() => {
    const mapa = new Map();
    detallesFiltrados.forEach(d => {
      const pedido = d.pedido || {};
      const idPedido = d.idPedido || pedido.idPedido;
      if (!mapa.has(idPedido)) {
        mapa.set(idPedido, {
          pedido,
          detalles: [],
        });
      }
      mapa.get(idPedido).detalles.push(d);
    });
    return Array.from(mapa.values());
  }, [detallesFiltrados]);

  const formatoFecha = (fecha) => (fecha ? new Date(fecha).toLocaleString() : "-");
  const togglePedido = (idPedido) => {
    setAbiertos(prev => ({ ...prev, [idPedido]: !prev[idPedido] }));
  };

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-3">Recepcionar Pedido</h2>
      <div className="flex justify-between mb-3">
        <input
          type="text"
          placeholder="Buscar por id pedido, usuario creador o producto"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border rounded px-2 py-1 w-96"
        />
      </div>
      {pedidosAgrupados.length === 0 && (
        <p className="text-center text-gray-500">Sin recepciones pendientes</p>
      )}
      <div className="grid grid-cols-1 gap-4">
        {pedidosAgrupados.map(({ pedido, detalles }) => (
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
              <div className="flex flex-col gap-1">
                <div className="text-sm text-gray-500">Estado Pedido</div>
                <div className="font-semibold">{pedido.estadoPedido || "-"}</div>
              </div>
              <button
                className="ml-auto flex items-center gap-2 text-slate-700 border border-slate-300 px-3 py-1 rounded hover:bg-slate-100 font-semibold"
                onClick={() => togglePedido(pedido.idPedido)}
                aria-expanded={!!abiertos[pedido.idPedido]}
              >
                <span className={clsx("transition-transform", { "rotate-90": abiertos[pedido.idPedido] })}>&gt;</span>
                Detalle
              </button>
            </div>

            {abiertos[pedido.idPedido] && (
              <div className="overflow-x-auto border border-gray-200 rounded mb-3 max-h-[55vh] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2">Producto</th>
                      <th className="text-left px-3 py-2">Cantidad Solicitada</th>
                      <th className="text-left px-3 py-2">Precio Unitario Compra</th>
                      <th className="text-left px-3 py-2">Estado Detalle</th>
                      <th className="text-left px-3 py-2">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map(d => (
                      <tr key={d.idDetallePedido} className="border-t">
                        <td className="px-3 py-2">{d.producto?.nombreProducto || "-"}</td>
                        <td className="px-3 py-2">{d.cantidadSolicitada}</td>
                        <td className="px-3 py-2">${Number(d.precioUnitarioCompra || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{d.estadoDetalle}</td>
                        <td className="px-3 py-2">
                          <button
                            className="bg-emerald-100 text-emerald-700 border border-emerald-300 px-3 py-1 rounded hover:bg-emerald-200 font-semibold"
                          onClick={() => onRecepcionarDetalle(d)}
                          >
                            Confirmar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
