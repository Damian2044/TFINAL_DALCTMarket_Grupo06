import DataTable from "react-data-table-component";
import BuscadorProductosModal from "@/componentes/BuscadorProductosModal.jsx";

export default function VentasNueva({
  setModo,
  mostrarListaClientes,
  setMostrarListaClientes,
  clienteSeleccionado,
  setClienteSeleccionado,
  busquedaCliente,
  setBusquedaCliente,
  clientes,
  metodoPago,
  setMetodoPago,
  modalProductos,
  setModalProductos,
  columnasDetalle,
  productosSeleccionados,
  subtotalVenta,
  descuentoGeneral,
  setDescuentoGeneral,
  totalDescuentoGeneral,
  totalDescuento,
  porcentajeIva,
  totalIVA,
  totalPagar,
  crearVenta,
  resetearVenta,
  inventariosActivos,
  agregarProducto,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <div className="flex items-center mb-3">
        <button
          type="button"
          onClick={() => {
            resetearVenta();
            setModo("lista");
          }}
          className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow focus:outline-none"
          title="Regresar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold flex-1">Nueva Venta</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">Cliente</label>
          <div className="relative">
            <button
              type="button"
              className="border rounded px-2 py-1 w-full text-left bg-white"
              onClick={() => setMostrarListaClientes(prev => !prev)}
            >
              {clienteSeleccionado ? `${clienteSeleccionado.nombreCliente} (${clienteSeleccionado.cedulaCliente})` : "Seleccionar cliente"}
            </button>
            {mostrarListaClientes && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    value={busquedaCliente}
                    placeholder="Buscar por cédula o nombre"
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {(clientes.filter(c => c.activoCliente).filter(c => {
                    const texto = busquedaCliente.toLowerCase();
                    const cedula = c.cedulaCliente || "";
                    const nombre = c.nombreCliente || "";
                    return `${cedula} ${nombre}`.toLowerCase().includes(texto);
                  })).map(c => (
                    <button
                      key={c.idCliente}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-sky-50"
                      onClick={() => {
                        setClienteSeleccionado(c);
                        setMostrarListaClientes(false);
                      }}
                    >
                      {c.nombreCliente} ({c.cedulaCliente})
                    </button>
                  ))}
                  {(clientes.filter(c => c.activoCliente).filter(c => {
                    const texto = busquedaCliente.toLowerCase();
                    const cedula = c.cedulaCliente || "";
                    const nombre = c.nombreCliente || "";
                    return `${cedula} ${nombre}`.toLowerCase().includes(texto);
                  })).length === 0 && (
                    <div className="px-3 py-2 text-gray-500">Sin resultados</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Metodo de Pago</label>
          <select
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Detalle de Productos</h3>
        <button
          type="button"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
          onClick={() => setModalProductos(true)}
          title="Buscar productos"
        >
          Buscar Productos
        </button>
      </div>
      <div className="mb-2">
        <DataTable
          columns={columnasDetalle}
          data={productosSeleccionados}
          noDataComponent={<span className="text-gray-400">No hay productos añadidos</span>}
          highlightOnHover
          striped
          dense
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 20, 50]}
          customStyles={{
            headRow: { style: { background: "#f3f4f6", color: "#111", fontWeight: 700, minHeight: 36, maxHeight: 40 } },
            rows: { style: { color: "#222", minHeight: 32, maxHeight: 36, paddingTop: 2, paddingBottom: 2 } },
            headCells: { style: { whiteSpace: "nowrap" } },
            cells: { style: { whiteSpace: "nowrap", paddingLeft: 6, paddingRight: 6 } },
          }}
          fixedHeader
          fixedHeaderScrollHeight="220px"
        />
      </div>
      <div className="flex justify-end mt-4">
        <div className="text-right min-w-[280px]">
          <div className="text-sm text-gray-500">Subtotal: ${subtotalVenta.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-2">
            Descuento General (%):
            <input
              type="number"
              min={0}
              step="0.01"
              value={descuentoGeneral}
              onChange={e => setDescuentoGeneral(e.target.value)}
              className="border rounded px-2 py-1 w-20 ml-2 text-right"
            />
            <span className="ml-2">(${totalDescuentoGeneral.toFixed(2)})</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Descuento: ${totalDescuento.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-1">IVA ({Number(porcentajeIva || 0).toFixed(0)}%): ${totalIVA.toFixed(2)}</div>
          <div className="text-lg font-semibold mt-1">Total a Pagar: ${totalPagar.toFixed(2)}</div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              onClick={crearVenta}
            >
              Confirmar Venta
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={resetearVenta}
            >
              Vaciar Venta
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              onClick={() => {
                resetearVenta();
                setModo("lista");
              }}
            >
              Volver
            </button>
          </div>
        </div>
      </div>

      <BuscadorProductosModal
        abierto={modalProductos}
        onCerrar={() => setModalProductos(false)}
        productos={inventariosActivos}
        onAgregar={agregarProducto}
        productosSeleccionados={productosSeleccionados}
        titulo="Seleccionar Productos"
        placeholder="Buscar por id, nombre o categoria"
        permitirSinStock={false}
        getPrecio={(p) => p.producto?.precioUnitarioVenta ?? 0}
        getStock={(p) => p.cantidadDisponible ?? 0}
        getMinimo={(p) => p.cantidadMinima ?? 0}
      />
    </section>
  );
}
