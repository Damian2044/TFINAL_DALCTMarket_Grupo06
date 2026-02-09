export default function PedidoDetalle({ pedido, onCerrar }) {
  if (!pedido) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onCerrar}></div>
      <section className="relative bg-white border border-gray-200 rounded shadow-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">Detalle del Pedido</h2>
            <p className="text-sm text-gray-500">Pedido #{pedido.idPedido}</p>
          </div>
          <button
            className="text-gray-500 hover:text-red-600 text-2xl font-bold"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">Usuario Creador</div>
            <div className="font-semibold">
              {pedido.usuarioCreador?.nombreCompleto || "-"}
              {pedido.usuarioCreador?.rol?.nombreRol ? ` (${pedido.usuarioCreador.rol.nombreRol})` : ""}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Usuario Aprobador</div>
            <div className="font-semibold">
              {pedido.usuarioAprobador?.nombreCompleto || "-"}
              {pedido.usuarioAprobador?.rol?.nombreRol ? ` (${pedido.usuarioAprobador.rol.nombreRol})` : ""}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Fecha Creacion</div>
            <div className="font-semibold">
              {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleString() : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Estado Pedido</div>
            <div className="font-semibold">{pedido.estadoPedido || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Costo Pedido</div>
            <div className="font-semibold">${Number(pedido.totalCostoPedido || 0).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Observaciones</div>
            <div className="font-semibold">{pedido.observaciones || "-"}</div>
          </div>
        </div>
        <div className="mb-2 text-sm font-semibold text-gray-700">Detalles del Pedido</div>
        <div className="overflow-x-auto bg-white border border-gray-200 rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Producto</th>
                <th className="text-left px-3 py-2">Cantidad Solicitada</th>
                <th className="text-left px-3 py-2">Precio Unitario Compra</th>
                <th className="text-left px-3 py-2">Fecha Recepcion</th>
                <th className="text-left px-3 py-2">Estado Detalle</th>
                <th className="text-left px-3 py-2">Usuario Receptor</th>
              </tr>
            </thead>
            <tbody>
              {(pedido.detalles || []).map(d => (
                <tr key={d.idDetallePedido} className="border-t">
                  <td className="px-3 py-2">{d.producto?.nombreProducto || "-"}</td>
                  <td className="px-3 py-2">{d.cantidadSolicitada}</td>
                  <td className="px-3 py-2">${Number(d.precioUnitarioCompra || 0).toFixed(2)}</td>
                  <td className="px-3 py-2">{d.fechaRecepcion ? new Date(d.fechaRecepcion).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2">{d.estadoDetalle}</td>
                  <td className="px-3 py-2">
                    {d.usuarioReceptor?.nombreCompleto || "-"}
                    {d.usuarioReceptor?.rol?.nombreRol ? ` (${d.usuarioReceptor.rol.nombreRol})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
