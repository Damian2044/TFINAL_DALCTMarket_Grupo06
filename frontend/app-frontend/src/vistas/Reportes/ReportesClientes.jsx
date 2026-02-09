import { useState } from "react";
import { useForm } from "react-hook-form";
import { DataGrid } from "@mui/x-data-grid";
import { obtenerReporteClientesServicio } from "@/servicios/serviciosReportes";

export default function ReportesClientes() {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { dias: 30, minVentas: 3, minGasto: 100 }
  });
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const alturaTabla = datos.length === 0 ? 320 : (datos.length <= 10 ? 420 : 620);

  const onSubmit = async (filtros) => {
    setLoading(true);
    setError(null);
    setDatos([]);
    try {
      const payload = {
        dias: Math.max(1, Number(filtros.dias)),
        minVentas: Math.max(1, Number(filtros.minVentas)),
        minGasto: Math.max(1, Number(filtros.minGasto))
      };
      const resp = await obtenerReporteClientesServicio(payload);
      let items = [];
      if (resp?.data) {
        if (Array.isArray(resp.data)) items = resp.data;
        else if (Array.isArray(resp.data.items)) items = resp.data.items;
      }
      setDatos(items);
    } catch (e) {
      setError(e?.message || "Error al obtener reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="max-w-4xl mx-auto mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm">
        <strong>Nota:</strong> Este reporte muestra los clientes más frecuentes (por defecto: 3+ ventas, $100+ gastados, últimos 30 días). Puedes ajustar los filtros. 
        <span className="text-red-900 font-semibold">Puedes cambiar los valores mínimos para días, ventas y gasto.</span>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#dc2626' }}>Clientes frecuentes</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-3 items-center max-w-4xl mx-auto">
        <label className="font-semibold">Días:
          <input type="number" min={1} {...register("dias", { required: true, min: 1 })} className="border rounded px-2 py-1 ml-2 w-20" />
        </label>
        <label className="font-semibold">Mín. ventas:
          <input type="number" min={1} {...register("minVentas", { required: true, min: 1 })} className="border rounded px-2 py-1 ml-2 w-20" />
        </label>
        <label className="font-semibold">Mín. gasto:
          <input type="number" min={1} step={0.01} {...register("minGasto", { required: true, min: 1 })} className="border rounded px-2 py-1 ml-2 w-24" />
        </label>
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold">Buscar</button>
      </form>
      {loading && <div className="text-center text-gray-500 font-semibold py-8">Cargando...</div>}
      {error && <div className="text-center text-red-600 font-semibold py-8">{error}</div>}
      <div className="bg-white w-full mb-6 mx-auto shadow rounded-lg px-4 pt-4" style={{ maxWidth: 980, width: "100%" }}>
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            <DataGrid
              experimentalFeatures={{ columnResize: true }}
              hideFooter={false}
              disableColumnMenu
              rows={datos.map((row, idx) => ({
                id: row.cliente.idCliente,
                nombre: row.cliente.nombreCliente,
                cedula: row.cliente.cedulaCliente,
                ventasCount: row.ventasCount,
                totalGastado: row.totalGastado,
                historialVentas: row.historialVentas
              }))}
              columns={[
                { field: "id", headerName: "ID Cliente", resizable: true, flex: 0.6 },
                { field: "nombre", headerName: "Nombre del cliente", resizable: true, flex: 1.2 },
                { field: "cedula", headerName: "Cédula", resizable: true, flex: 1 },
                { field: "ventasCount", headerName: "Cantidad de ventas", resizable: true, flex: 0.8 },
                { field: "totalGastado", headerName: "Total gastado ($)", resizable: true, flex: 1, renderCell: params => (
                  <span style={{ fontWeight: 700 }}>${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ) },
                {
                  field: "historialVentas",
                  headerName: "Historial de compras",
                  resizable: false,
                  flex: 0.7,
                  sortable: false,
                  renderCell: params => (
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 font-semibold text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        setExpandedRow(expandedRow === params.row.id ? null : params.row.id);
                      }}
                    >
                      {expandedRow === params.row.id ? "Cerrar" : "Ver ventas"}
                    </button>
                  )
                }
              ]}
              getRowId={row => row.id}
              getRowHeight={() => "auto"}
              getRowClassName={(params) => (
                params.indexRelativeToCurrentPage % 2 === 0 ? "filaPar" : "filaImpar"
              )}
              pageSize={25}
              columnBuffer={8}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              autoHeight={false}
              disableSelectionOnClick={false}
              sx={{
                height: alturaTabla,
                maxHeight: 680,
                width: "100%",
                overflowX: "auto",
                fontFamily: "'NunitoSans', 'Segoe UI', sans-serif",
                fontSize: "0.93rem",
                color: "#0f172a",
                "& .MuiDataGrid-cell": {
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: "1.2",
                  py: 0.75,
                  alignItems: "flex-start",
                  borderBottom: "1px solid #e5e7eb",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#e2e8f0",
                  color: "#0f172a",
                  fontWeight: 700,
                  borderBottom: "2px solid #cbd5e1",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  whiteSpace: "normal",
                  lineHeight: "1.2",
                },
                "& .MuiDataGrid-columnHeaderTitleContainer": {
                  overflow: "visible",
                },
                ".MuiDataGrid-filler": {
                  display: "none",
                },
                "& .MuiDataGrid-row.filaPar": {
                  backgroundColor: "#f8fafc",
                },
                "& .MuiDataGrid-row.filaImpar": {
                  backgroundColor: "#ffffff",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#e0f2fe",
                },
              }}
              localeText={{
                noRowsLabel: "No hay datos para mostrar",
                footerRowSelected: count => `${count} fila(s) seleccionada(s)`
              }}
            />
            {/* Modal historial ventas */}
            {expandedRow && (() => {
              const row = datos.find(r => r.cliente.idCliente === expandedRow);
              if (!row) return null;
              return (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.15)" }}>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" onClick={() => setExpandedRow(null)} aria-label="Cerrar modal">×</button>
                    <h3 className="text-lg font-bold mb-2 text-red-700">Historial de ventas de {row.cliente.nombreCliente}</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 border">ID Venta</th>
                            <th className="px-2 py-1 border">Fecha</th>
                            <th className="px-2 py-1 border">Subtotal</th>
                            <th className="px-2 py-1 border">Descuento</th>
                            <th className="px-2 py-1 border">IVA</th>
                            <th className="px-2 py-1 border">Total</th>
                            <th className="px-2 py-1 border">Método</th>
                            <th className="px-2 py-1 border">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.historialVentas.map(v => (
                            <tr key={v.idVenta} className="border-b">
                              <td className="px-2 py-1 border text-center">{v.idVenta}</td>
                              <td className="px-2 py-1 border text-center">{new Date(v.fechaVenta).toLocaleString()}</td>
                              <td className="px-2 py-1 border text-center">${Number(v.subtotalVenta).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-2 py-1 border text-center">${Number(v.totalDescuento).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-2 py-1 border text-center">${Number(v.totalIVA).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-2 py-1 border text-center font-bold">${Number(v.totalPagar).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-2 py-1 border text-center">{v.metodoPago}</td>
                              <td className="px-2 py-1 border text-center">{v.estadoVenta}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
