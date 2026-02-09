import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";

export default function BuscadorProductosModal({
  abierto,
  onCerrar,
  productos,
  onAgregar,
  productosSeleccionados,
  titulo = "Seleccionar Productos",
  placeholder = "Buscar por id, nombre o categoria",
  permitirSinStock = false,
  getId = (p) => p.producto?.idProducto,
  getNombre = (p) => p.producto?.nombreProducto || "-",
  getCategoria = (p) => p.producto?.categoria?.nombreCategoria || "-",
  getPrecio = (p) => p.producto?.precioUnitarioCompra ?? 0,
  getStock = (p) => p.cantidadDisponible ?? 0,
  getMinimo = (p) => p.cantidadMinima ?? 0,
}) {
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return productos || [];
    return (productos || []).filter(p => {
      const id = String(getId(p) || "");
      const nombre = getNombre(p);
      const categoria = getCategoria(p);
      return `${id} ${nombre} ${categoria}`.toLowerCase().includes(texto);
    });
  }, [productos, busqueda, getId, getNombre, getCategoria]);

  const colorStock = (stock, minimo) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock <= minimo) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const yaSeleccionado = (idProducto) => {
    return (productosSeleccionados || []).some(p => String(p.idProducto) === String(idProducto));
  };

  const columnas = [
    { name: "Id", selector: row => getId(row), sortable: true, width: "80px" },
    { name: "Nombre", selector: row => getNombre(row), sortable: true, wrap: true },
    { name: "Categoria", selector: row => getCategoria(row), sortable: true, wrap: true },
    {
      name: "Precio Unitario",
      selector: row => `$${Number(getPrecio(row) || 0).toFixed(2)}`,
      sortable: true,
      width: "140px",
    },
    {
      name: "Stock",
      cell: row => {
        const stock = Number(getStock(row) || 0);
        const minimo = Number(getMinimo(row) || 0);
        return (
          <span className={clsx("font-semibold px-2 py-1 rounded", colorStock(stock, minimo))}>
            {stock}
          </span>
        );
      },
      sortable: true,
      width: "100px",
    },
    {
      name: "Agregar",
      cell: row => {
        const idProducto = getId(row);
        const sinStock = Number(getStock(row) || 0) === 0;
        const deshabilitado = yaSeleccionado(idProducto) || (!permitirSinStock && sinStock);
        return (
          <button
            className={clsx("px-2 py-1 rounded font-semibold", {
              "bg-blue-600 text-white hover:bg-blue-700": !deshabilitado,
              "bg-gray-200 text-gray-400 cursor-not-allowed": deshabilitado,
            })}
            disabled={deshabilitado}
            onClick={() => onAgregar(row)}
          >
            {deshabilitado ? "Agregado" : "Agregar"}
          </button>
        );
      },
      ignoreRowClick: true,
      button: true,
      width: "120px",
    },
  ];

  const estilosTabla = {
    headRow: {
      style: {
        background: "#f3f4f6",
        fontWeight: 700,
        fontSize: "0.9rem",
        color: "#1f2937",
      },
    },
    headCells: {
      style: {
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        lineHeight: "1.2",
        paddingTop: "0.2rem",
        paddingBottom: "0.2rem",
      },
    },
    rows: {
      style: {
        minHeight: "36px",
        borderBottom: "1px solid #e5e7eb",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
        paddingLeft: "0.2rem",
        paddingRight: "0.2rem",
      },
    },
    pagination: {
      style: {
        background: "#f9fafb",
      },
    },
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-lg shadow-2xl p-6 w-full max-w-3xl max-h-[70vh] flex flex-col border border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{titulo}</h3>
          <button className="text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={onCerrar}>&times;</button>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border rounded px-3 py-2 mb-3 focus:ring focus:ring-blue-200"
          autoFocus
        />
        <div className="flex-1 w-full overflow-y-auto border rounded-lg">
          <DataTable
            columns={columnas}
            data={productosFiltrados}
            noDataComponent={<span className="text-gray-500">Sin productos</span>}
            highlightOnHover
            striped
            dense
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            customStyles={estilosTabla}
            fixedHeader
            fixedHeaderScrollHeight="260px"
          />
        </div>
      </div>
    </div>
  );
}
