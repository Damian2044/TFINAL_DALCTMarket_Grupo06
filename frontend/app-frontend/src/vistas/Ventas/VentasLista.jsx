import DataTable from "react-data-table-component";
import clsx from "clsx";

export default function VentasLista({
  esAdministrador,
  seccion,
  setSeccion,
  setModo,
  filtro,
  setFiltro,
  columnasVentas,
  ventasFiltradas,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <div className="flex justify-between mb-3">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => setModo("nueva")}
        >
          Nueva Venta
        </button>
        <input
          type="text"
          placeholder="Buscar por comprobante, vendedor o estado"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border rounded px-2 py-1 w-96"
        />
      </div>
      {esAdministrador && (
        <div className="flex gap-3 flex-wrap mb-3">
          <button
            className={clsx("px-3 py-1 rounded border-2 font-semibold", {
              "bg-blue-600 text-white border-blue-600": seccion === "hoy",
              "bg-blue-50 text-blue-700 border-blue-300": seccion !== "hoy",
            })}
            onClick={() => setSeccion("hoy")}
          >
            Ventas del día
          </button>
          <button
            className={clsx("px-3 py-1 rounded border-2 font-semibold", {
              "bg-slate-700 text-white border-slate-700": seccion === "historico",
              "bg-slate-100 text-slate-700 border-slate-300": seccion !== "historico",
            })}
            onClick={() => setSeccion("historico")}
          >
            Histórico
          </button>
        </div>
      )}
      <div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
        <DataTable
          columns={columnasVentas}
          data={ventasFiltradas}
          pagination
          highlightOnHover
          striped
          customStyles={{
            headRow: { style: { background: "#f3f4f6", color: "#111", fontWeight: 700 } },
            rows: { style: { color: "#222" } },
            headCells: { style: { whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere" } },
          }}
          noDataComponent={<span className="text-gray-500">Sin ventas</span>}
          responsive
        />
      </div>
    </section>
  );
}
