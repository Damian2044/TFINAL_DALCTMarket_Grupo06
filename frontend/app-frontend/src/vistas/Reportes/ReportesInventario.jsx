import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { obtenerProductosServicio } from "@/servicios/serviciosProductos";
import { obtenerCategoriasServicio } from "@/servicios/serviciosCategorias";
import { obtenerReporteInventarioServicio } from "@/servicios/serviciosReportes";
import { DataGrid } from "@mui/x-data-grid";

export default function ReportesInventario() {
  const [modalProducto, setModalProducto] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

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
    setResumen(null);
    try {
      let payload = {};
      if (filtros.idProducto) payload.idProducto = filtros.idProducto;
      if (filtros.idCategoria) payload.idCategoria = filtros.idCategoria;
      if (filtros.nombreProducto) payload.nombreProducto = filtros.nombreProducto;
      const resp = await obtenerReporteInventarioServicio(payload);
      if (resp?.data) {
        if (Array.isArray(resp.data)) setDatos(resp.data);
        else if (Array.isArray(resp.data.items)) setDatos(resp.data.items);
        else setDatos([]);
      }
      if (resp?.resumen) setResumen(resp.resumen);
    } catch (e) {
      setError(e?.message || "Error al obtener reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="max-w-4xl mx-auto mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 text-sm">
        <strong>Nota:</strong> Este reporte permite obtener el inventario actual. Puedes filtrar por <b>producto</b> o <b>categoría</b>, o mezclar ambos si coinciden.
        <br />
        <span className="text-blue-900 font-semibold">Si no pones ningún filtro, se mostrará todo el inventario.</span>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: "#2563eb" }}>Inventario</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <button type="button" className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setModalProducto(true)}>
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
          <button type="button" className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setModalCategoria(true)}>
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">Buscar</button>
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
      {resumen && (
        <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex items-center gap-4 max-w-md mx-auto mb-8">
          <span className="font-semibold text-gray-700">{resumen.titulo}</span>
          <span className="text-2xl font-bold text-blue-700">{resumen.valor}</span>
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
            id: row.id || idx,
            idProducto: row.producto?.idProducto ?? "",
            nombreProducto: row.producto?.nombreProducto ?? "",
            categoria: row.producto?.categoria?.nombreCategoria ?? "",
            proveedor: row.producto?.proveedor?.razonSocial ?? "",
            estado: row.producto?.activoProducto,
            cantidadDisponible: row.cantidadDisponible,
            cantidadMinima: row.cantidadMinima,
            precioCompra: row.producto ? `$${Number(row.producto.precioUnitarioCompra).toFixed(2)}` : "",
            precioVenta: row.producto ? `$${Number(row.producto.precioUnitarioVenta).toFixed(2)}` : "",
            raw: row
          }))}
          columns={[
            { field: "idProducto", headerName: "ID", resizable: true, flex: 0.6 },
            { field: "nombreProducto", headerName: "Nombre producto", resizable: true, flex: 1.2 },
            { field: "categoria", headerName: "Categoría", resizable: true, flex: 0.9 },
            { field: "proveedor", headerName: "Proveedor", resizable: true, flex: 2 },
            { field: "estado", headerName: "Estado", resizable: true, flex: 1, renderCell: params => (
              params.row.raw?.producto?.activoProducto
                ? <span style={{ color: "#059669", fontWeight: 600 }}>Activo</span>
                : <span style={{ color: "#dc2626", fontWeight: 600 }}>Inactivo</span>
            ) },
            { field: "cantidadDisponible", headerName: "Cantidad disponible", resizable: true, flex: 1.2, renderCell: params => {
              const cant = params.row.cantidadDisponible ?? 0;
              const min = params.row.cantidadMinima ?? 0;
              let color = "#15803d";
              if (cant === 0) color = "#dc2626";
              else if (cant <= min) color = "#ea580c";
              return <span style={{ color, fontWeight: 700 }}>{cant}</span>;
            } },
            { field: "cantidadMinima", headerName: "Cantidad mínima", resizable: true, flex: 1 },
            { field: "precioCompra", headerName: "Precio compra", resizable: true, flex: 1 },
            { field: "precioVenta", headerName: "Precio venta", resizable: true, flex: 1 }
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
          </div>
        </div>
      </div>
    </section>
  );
}
