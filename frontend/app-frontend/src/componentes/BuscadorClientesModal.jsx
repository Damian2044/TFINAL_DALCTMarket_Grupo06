import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";

export default function BuscadorClientesModal({
  abierto,
  onCerrar,
  clientes,
  onSeleccionar,
  titulo = "Seleccionar Cliente",
  placeholder = "Buscar por cedula o nombre",
}) {
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return clientes || [];
    return (clientes || []).filter(c => {
      const cedula = c.cedulaCliente || "";
      const nombre = c.nombreCliente || "";
      return `${cedula} ${nombre}`.toLowerCase().includes(texto);
    });
  }, [clientes, busqueda]);

  const columnas = [
    { name: "Id", selector: row => row.idCliente, sortable: true, width: "80px" },
    { name: "Cedula", selector: row => row.cedulaCliente || "-", sortable: true, wrap: true },
    { name: "Nombre", selector: row => row.nombreCliente || "-", sortable: true, wrap: true },
    {
      name: "Seleccionar",
      cell: row => (
        <button
          className={clsx("px-2 py-1 rounded font-semibold bg-blue-600 text-white hover:bg-blue-700")}
          onClick={() => onSeleccionar(row)}
        >
          Seleccionar
        </button>
      ),
      ignoreRowClick: true,
      button: true,
      width: "130px",
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
            data={clientesFiltrados}
            noDataComponent={<span className="text-gray-500">Sin clientes</span>}
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
