import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DataGrid } from "@mui/x-data-grid";
import { obtenerUsuariosServicio } from "@/servicios/serviciosUsuarios";
import { obtenerReporteCajaServicio } from "@/servicios/serviciosReportes";

export default function ReportesCaja() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, setValue } = useForm();
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    obtenerUsuariosServicio().then(r => {
      setUsuarios(r.data || []);
    });
  }, []);

  const onSubmit = async (filtros) => {
    setLoading(true);
    setError(null);
    setDatos([]);
    try {
      if (!filtros.idUsuario) throw new Error("Seleccione un usuario");
      if (!fecha) throw new Error("Seleccione una fecha");
      const usuario = usuarios.find(u => u.idUsuario === Number(filtros.idUsuario));
      setUsuarioSeleccionado(usuario);
      const resp = await obtenerReporteCajaServicio({ idUsuarioCaja: filtros.idUsuario, fecha });
      let items = [];
      if (resp?.data) {
        if (Array.isArray(resp.data)) items = resp.data;
        else if (Array.isArray(resp.data.items)) items = resp.data.items;
      }
      setDatos(items);
    } catch (e) {
      setError(e?.message || "Error al obtener resumen de caja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="max-w-4xl mx-auto mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm">
        <strong>Nota:</strong> Este reporte permite consultar el resumen de caja por usuario.
        <span className="text-green-900 font-semibold">Debe seleccionar un usuario válido.</span>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#059669' }}>Caja</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <button type="button" className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => setModalUsuario(true)}>
            Buscar usuario
          </button>
          {usuarioSeleccionado && (
            <span className="text-green-700 font-semibold text-sm">
              {usuarioSeleccionado.nombreCompleto} - {usuarioSeleccionado.cedulaUsuario}
              <button type="button" className="ml-2 text-red-600 font-bold text-lg" onClick={() => {
                setUsuarioSeleccionado(null);
                setValue("idUsuario", "");
              }} title="Borrar selección">×</button>
            </span>
          )}
        </div>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="border rounded px-2 py-1 w-full md:w-60" required />
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">Buscar</button>
        </div>
        {modalUsuario && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "transparent" }}>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" onClick={() => setModalUsuario(false)} aria-label="Cerrar modal">×</button>
              <h2 className="text-xl font-bold mb-4">Buscar usuario</h2>
              <input type="text" value={busquedaUsuario} onChange={e => setBusquedaUsuario(e.target.value)} placeholder="Filtrar por nombre o cédula" className="border rounded px-2 py-1 w-full mb-3" />
              <div className="max-h-60 overflow-y-auto">
                {usuarios.filter(u =>
                  ["Administrador", "Cajero"].includes(u.rol?.nombreRol) &&
                  (!busquedaUsuario || u.nombreCompleto.toLowerCase().includes(busquedaUsuario.toLowerCase()) || u.cedulaUsuario.includes(busquedaUsuario))
                ).map(u => (
                  <div key={u.idUsuario} className="py-1 px-2 hover:bg-green-100 cursor-pointer rounded" onClick={() => {
                    setUsuarioSeleccionado(u);
                    setValue("idUsuario", u.idUsuario);
                    setModalUsuario(false);
                  }}>
                    {u.nombreCompleto} - {u.cedulaUsuario}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
                id: row.idCaja + "-" + idx,
                idCaja: row.idCaja,
                fechaAperturaCaja: row.fechaAperturaCaja,
                fechaCierreCaja: row.fechaCierreCaja,
                montoInicialDeclarado: row.montoInicialDeclarado,
                montoCierreDeclarado: row.montoCierreDeclarado,
                montoCierreSistema: row.montoCierreSistema,
                diferenciaCaja: row.diferenciaCaja,
                estadoCaja: row.estadoCaja
              }))}
              columns={[
                { field: "idCaja", headerName: "ID Caja", resizable: true, flex: 0.7 },
                { field: "fechaAperturaCaja", headerName: "Apertura", resizable: true, flex: 1, renderCell: params => (
                  <span>{new Date(params.value).toLocaleString()}</span>
                ) },
                { field: "fechaCierreCaja", headerName: "Cierre", resizable: true, flex: 1, renderCell: params => (
                  params.value ? <span>{new Date(params.value).toLocaleString()}</span> : <span className="text-gray-400">-</span>
                ) },
                { field: "montoInicialDeclarado", headerName: "Monto inicial", resizable: true, flex: 1, renderCell: params => (
                  <span style={{ fontWeight: 700 }}>${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ) },
                { field: "montoCierreDeclarado", headerName: "Monto cierre declarado", resizable: true, flex: 1, renderCell: params => (
                  params.value !== null ? <span style={{ fontWeight: 700 }}>${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : <span className="text-gray-400">-</span>
                ) },
                { field: "montoCierreSistema", headerName: "Monto cierre sistema", resizable: true, flex: 1, renderCell: params => (
                  params.value !== null ? <span style={{ fontWeight: 700 }}>${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : <span className="text-gray-400">-</span>
                ) },
                { field: "diferenciaCaja", headerName: "Diferencia", resizable: true, flex: 1, renderCell: params => (
                  params.value !== null ? <span style={{ fontWeight: 700, color: params.value === 0 ? '#059669' : '#dc2626' }}>{Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : <span className="text-gray-400">-</span>
                ) },
                { field: "estadoCaja", headerName: "Estado", resizable: true, flex: 1, renderCell: params => (
                  <span style={{ fontWeight: 700, color: params.value === "ABIERTA" ? '#059669' : '#dc2626' }}>{params.value}</span>
                ) }
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
                height: 420,
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
