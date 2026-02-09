import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { obtenerProductosServicio } from "@/servicios/serviciosProductos";
import { obtenerCategoriasServicio } from "@/servicios/serviciosCategorias";
import { DataGrid } from "@mui/x-data-grid";
import { obtenerReporteVentasServicio } from "@/servicios/serviciosReportes";

export default function ReportesVentas() {
  const [modalProducto, setModalProducto] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [totalVentas, setTotalVentas] = useState(0);
  const { register, handleSubmit, setValue, reset } = useForm();
  const alturaTabla = datos.length === 0 ? 320 : (datos.length <= 10 ? 420 : 620);

  useEffect(() => {
    obtenerProductosServicio().then(r => setProductos(r.data || []));
    obtenerCategoriasServicio().then(r => setCategorias(r.data || []));
  }, []);

  const onSubmit = async (filtros) => {
    setLoading(true);
    setError(null);
    setDatos([]);
    setTotalVentas(0);
    try {
      if (!filtros.fechaInicio || !filtros.fechaFin) throw new Error("Debe ingresar ambas fechas");
      if (filtros.fechaFin < filtros.fechaInicio) throw new Error("La fecha final no puede ser menor a la inicial");
      if (!filtros.idProducto && !filtros.idCategoria) throw new Error("Seleccione producto o categoría");
      const resp = await obtenerReporteVentasServicio({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        idProducto: filtros.idProducto || undefined,
        idCategoria: filtros.idCategoria || undefined,
      });
      let items = [];
      if (resp?.data) {
        if (Array.isArray(resp.data)) items = resp.data;
        else if (Array.isArray(resp.data.items)) items = resp.data.items;
      }
      setDatos(items);
      setTotalVentas(items.reduce((acc, curr) => acc + (Number(curr.ingresos) || 0), 0));
    } catch (e) {
      setError(e?.message || "Error al obtener reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="max-w-4xl mx-auto mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-amber-700 text-sm">
        <strong>Nota:</strong> Este reporte muestra las ventas por producto o categoría en el rango de fechas seleccionado.
        <span className="text-amber-900 font-semibold">Debe seleccionar al menos un producto o una categoría.</span>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: "#f59e42" }}>Ventas</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 items-center max-w-4xl mx-auto">
        <label className="font-semibold">Fecha inicio:
          <input type="date" {...register("fechaInicio", { required: true })} className="border rounded px-2 py-1 ml-2" />
        </label>
        <label className="font-semibold">Fecha fin:
          <input type="date" {...register("fechaFin", { required: true })} className="border rounded px-2 py-1 ml-2" />
        </label>
        <div className="flex items-center gap-2">
          <button type="button" className="bg-amber-500 text-white px-3 py-1 rounded" onClick={() => setModalProducto(true)}>
            Buscar producto
          </button>
          {productoSeleccionado && (
            <span className="text-blue-700 font-semibold text-sm">
              {productoSeleccionado.nombreProducto} (ID: {productoSeleccionado.idProducto})
              <button type="button" className="ml-2 text-red-600 font-bold text-lg" onClick={() => {
                setProductoSeleccionado(null);
                setValue("idProducto", "");
              }} title="Borrar selección">×</button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="bg-amber-600 text-white px-3 py-1 rounded" onClick={() => setModalCategoria(true)}>
            Buscar categoría
          </button>
          {categoriaSeleccionada && (
            <span className="text-green-700 font-semibold text-sm">
              {categoriaSeleccionada.nombreCategoria} (ID: {categoriaSeleccionada.idCategoriaProducto})
              <button type="button" className="ml-2 text-red-600 font-bold text-lg" onClick={() => {
                setCategoriaSeleccionada(null);
                setValue("idCategoria", "");
              }} title="Borrar selección">×</button>
            </span>
          )}
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 font-semibold">Buscar</button>
        </div>
        {modalProducto && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "transparent" }}>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" onClick={() => setModalProducto(false)} aria-label="Cerrar modal">×</button>
              <h2 className="text-xl font-bold mb-4">Buscar producto</h2>
              <input type="text" value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)} placeholder="Filtrar por nombre o ID" className="border rounded px-2 py-1 w-full mb-3" />
              <div className="max-h-60 overflow-y-auto">
                {productos.filter(p =>
                  (!busquedaProducto || p.nombreProducto.toLowerCase().includes(busquedaProducto.toLowerCase()) || String(p.idProducto) === busquedaProducto)
                ).map(p => (
                  <div key={p.idProducto} className="py-1 px-2 hover:bg-blue-100 cursor-pointer rounded" onClick={() => {
                    setProductoSeleccionado(p);
                    setValue("idProducto", p.idProducto);
                    setModalProducto(false);
                  }}>
                    {p.nombreProducto} (ID: {p.idProducto})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {modalCategoria && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "transparent" }}>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" onClick={() => setModalCategoria(false)} aria-label="Cerrar modal">×</button>
              <h2 className="text-xl font-bold mb-4">Buscar categoría</h2>
              <input type="text" value={busquedaCategoria} onChange={e => setBusquedaCategoria(e.target.value)} placeholder="Filtrar por nombre o ID" className="border rounded px-2 py-1 w-full mb-3" />
              <div className="max-h-60 overflow-y-auto">
                {categorias.filter(c =>
                  (!busquedaCategoria || c.nombreCategoria.toLowerCase().includes(busquedaCategoria.toLowerCase()) || String(c.idCategoriaProducto) === busquedaCategoria)
                ).map(c => (
                  <div key={c.idCategoriaProducto} className="py-1 px-2 hover:bg-green-100 cursor-pointer rounded" onClick={() => {
                    setCategoriaSeleccionada(c);
                    setValue("idCategoria", c.idCategoriaProducto);
                    setModalCategoria(false);
                  }}>
                    {c.nombreCategoria} (ID: {c.idCategoriaProducto})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
      {loading && <div className="text-center text-gray-500 font-semibold py-8">Cargando...</div>}
      {error && <div className="text-center text-red-600 font-semibold py-8">{error}</div>}
      {datos.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 shadow-md rounded-xl p-5 border border-amber-200 flex items-center justify-between gap-4 max-w-md mx-auto mb-8">
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700 font-semibold">Ventas totales</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">${totalVentas.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-amber-600 text-white rounded-full px-3 py-1 text-xs font-semibold">USD</div>
        </div>
      )}
      <div className="bg-white w-full mb-6 mx-auto shadow rounded-lg px-4 pt-4" style={{ maxWidth: 980, width: "100%" }}>
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            <DataGrid
              experimentalFeatures={{ columnResize: true }}
              hideFooter={false}
              disableColumnMenu
              rows={datos.map((row, idx) => ({
                id: row.idProducto + "-" + row.idCategoria + "-" + idx,
                idProducto: row.idProducto,
                nombreProducto: row.nombreProducto,
                nombreCategoria: row.nombreCategoria,
                cantidadVendida: row.cantidadVendida,
                ingresos: row.ingresos
              }))}
              columns={[
                { field: "idProducto", headerName: "ID", resizable: true, flex: 0.6 },
                { field: "nombreProducto", headerName: "Nombre producto", resizable: true, flex: 1.2 },
                { field: "nombreCategoria", headerName: "Categoría", resizable: true, flex: 0.9 },
                { field: "cantidadVendida", headerName: "Cantidad vendida", resizable: true, flex: 1 },
                { field: "ingresos", headerName: "Ingresos", resizable: true, flex: 1, renderCell: params => (
                  <span style={{ fontWeight: 700 }}>${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ) }
              ]}
              getRowId={row => row.id}
              getRowHeight={() => "auto"}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 25 } }
              }}
              getRowClassName={(params) => (
                params.indexRelativeToCurrentPage % 2 === 0 ? "filaPar" : "filaImpar"
              )}
              pageSize={25}
              columnBuffer={8}
              pageSizeOptions={[10, 25, 50]}
              rowsPerPageOptions={[10, 25, 50]}
              pagination
              autoHeight={false}
              disableSelectionOnClick={false}
              sx={{
                height: alturaTabla,
                maxHeight: 680,
                width: "100%",
                overflowX: "auto",
                fontFamily: "'Poppins', 'Segoe UI', sans-serif",
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
          </div>
        </div>
      </div>
    </section>
  );
}
