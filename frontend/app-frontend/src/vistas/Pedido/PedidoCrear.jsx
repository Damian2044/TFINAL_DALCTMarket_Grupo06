import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import BuscadorProductosModal from "@/componentes/BuscadorProductosModal.jsx";

export default function PedidoCrear({ productosActivos, onCrearPedido }) {
  const [mensajeLocal, setMensajeLocal] = useState(null);
  const [modalProductos, setModalProductos] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  const validarDetalles = () => {
    const errores = (productosSeleccionados || [])
      .map(d => ({
        idProducto: Number(d.idProducto),
        cantidadSolicitada: Number(d.cantidadSolicitada),
      }))
      .filter(d => !d.idProducto || d.cantidadSolicitada <= 0);
    return productosSeleccionados.length > 0 && errores.length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validarDetalles()) {
      setMensajeLocal("Revisa productos y cantidades");
      return;
    }
    setMensajeLocal(null);
    await onCrearPedido(productosSeleccionados, () => {
      setProductosSeleccionados([]);
    });
  };

  const agregarProducto = (inv) => {
    const idProducto = inv?.producto?.idProducto;
    if (!idProducto) return;
    const yaExiste = productosSeleccionados.some(p => String(p.idProducto) === String(idProducto));
    if (yaExiste) return;
    setProductosSeleccionados(prev => [
      ...prev,
      {
        idProducto,
        nombreProducto: inv.producto?.nombreProducto || "-",
        categoria: inv.producto?.categoria?.nombreCategoria || "-",
        precioUnitario: Number(inv.producto?.precioUnitarioCompra ?? 0),
        stock: Number(inv.cantidadDisponible ?? 0),
        minimo: Number(inv.cantidadMinima ?? 0),
        cantidadSolicitada: 1,
      },
    ]);
  };

  const eliminarProducto = (idProducto) => {
    setProductosSeleccionados(prev => prev.filter(p => String(p.idProducto) !== String(idProducto)));
  };

  const cambiarCantidad = (idProducto, nuevaCantidad) => {
    if (!nuevaCantidad || nuevaCantidad < 1) return;
    setProductosSeleccionados(prev =>
      prev.map(p => String(p.idProducto) === String(idProducto) ? { ...p, cantidadSolicitada: nuevaCantidad } : p)
    );
  };

  const colorStock = (stock, minimo) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock <= minimo) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const columnasSeleccion = [
    { name: "Id", selector: row => row.idProducto, sortable: true, width: "80px" },
    { name: "Nombre", selector: row => row.nombreProducto, sortable: true, wrap: true },
    { name: "Categoria", selector: row => row.categoria, sortable: true, wrap: true },
    { name: "Precio Unitario", selector: row => `$${Number(row.precioUnitario || 0).toFixed(2)}`, sortable: true, width: "140px" },
    {
      name: "Stock",
      cell: row => (
        <span className={clsx("font-semibold px-2 py-1 rounded", colorStock(row.stock, row.minimo))}>
          {row.stock}
        </span>
      ),
      sortable: true,
      width: "100px",
    },
    {
      name: "Cantidad",
      cell: row => (
        <input
          type="number"
          min={1}
          value={row.cantidadSolicitada}
          onChange={e => cambiarCantidad(row.idProducto, Number(e.target.value))}
          className="border rounded px-2 py-1 w-20 text-black bg-gray-50 focus:ring focus:ring-blue-200"
          style={{ textAlign: "center" }}
        />
      ),
      sortable: false,
      width: "130px",
    },
    {
      name: "Acciones",
      cell: row => (
        <button
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          onClick={() => eliminarProducto(row.idProducto)}
        >
          Eliminar
        </button>
      ),
      ignoreRowClick: true,
      button: true,
      width: "120px",
    },
  ];

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-3">Crear Pedido</h2>
      {mensajeLocal && (
        <div className="p-2 mb-3 rounded text-white bg-red-600 text-center font-semibold">
          {mensajeLocal}
        </div>
      )}
      <form onSubmit={onSubmit}>
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
        <div className="mb-2" style={{ minHeight: 0 }}>
          <DataTable
            columns={columnasSeleccion}
            data={productosSeleccionados}
            noDataComponent={<span className="text-gray-400">No hay productos agregados</span>}
            highlightOnHover
            striped
            dense
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            customStyles={{
              headRow: { style: { background: "#f3f4f6", color: "#111", fontWeight: 700, minHeight: 36, maxHeight: 40 } },
              headCells: { style: { whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere", lineHeight: "1.2", paddingTop: "0.2rem", paddingBottom: "0.2rem" } },
              rows: { style: { color: "#222", minHeight: 32, maxHeight: 36, paddingTop: 2, paddingBottom: 2 } },
              table: { style: { marginBottom: 0 } },
            }}
            fixedHeader
            fixedHeaderScrollHeight="220px"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Crear Pedido
          </button>
        </div>
      </form>

      <BuscadorProductosModal
        abierto={modalProductos}
        onCerrar={() => setModalProductos(false)}
        productos={productosActivos}
        onAgregar={agregarProducto}
        productosSeleccionados={productosSeleccionados}
        titulo="Seleccionar Productos"
        placeholder="Buscar por id, nombre o categoria"
        permitirSinStock={true}
        getPrecio={(p) => p.producto?.precioUnitarioCompra ?? 0}
      />
    </section>
  );
}
