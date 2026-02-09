import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";

export default function PedidoHistorial({ pedidos, onVerDetalle }) {
  const [filtro, setFiltro] = useState("");

  const pedidosFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase();
    return (pedidos || []).filter(p => {
      const id = String(p.idPedido || "");
      const creador = p.usuarioCreador?.nombreCompleto || "";
      const estado = p.estadoPedido || "";
      return `${id} ${creador} ${estado}`.toLowerCase().includes(texto);
    });
  }, [pedidos, filtro]);

  const columnas = [
    { name: "Id Pedido", selector: fila => fila.idPedido, sortable: true, width: "140px" },
    { name: "Usuario Creador", selector: fila => fila.usuarioCreador?.nombreCompleto || "-", sortable: true, wrap: true },
    { name: "Usuario Aprobador", selector: fila => fila.usuarioAprobador?.nombreCompleto || "-", sortable: true, wrap: true },
    { name: "Estado Pedido", selector: fila => fila.estadoPedido, sortable: true, wrap: true },
    {
      name: "Ver Detalle",
      cell: fila => (
        <button
          className="bg-sky-100 text-sky-700 border border-sky-300 px-3 py-1 rounded hover:bg-sky-200 font-semibold"
          onClick={() => onVerDetalle(fila)}
        >
          Ver
        </button>
      ),
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

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-3">Historial de Pedidos</h2>
      <div className="flex justify-between mb-3">
        <input
          type="text"
          placeholder="Buscar por id, creador o estado"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border rounded px-2 py-1 w-96"
        />
      </div>
      <div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
        <DataTable
          columns={columnas}
          data={pedidosFiltrados}
          defaultSortFieldId={1}
          defaultSortAsc={true}
          pagination
          highlightOnHover
          striped
          customStyles={estilosTabla}
          noDataComponent={<span className="text-gray-500">Sin pedidos</span>}
          responsive
        />
      </div>
    </section>
  );
}
