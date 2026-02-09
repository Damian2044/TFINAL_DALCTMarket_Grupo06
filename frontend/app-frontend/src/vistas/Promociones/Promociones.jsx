import React, { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import {
  obtenerPromocionesServicio,
  crearPromocionServicio,
  deshabilitarPromocionServicio,
} from "@/servicios/serviciosPromociones";
import { obtenerProductosServicio } from "@/servicios/serviciosProductos";

export default function Promociones() {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [modo, setModo] = useState("lista");
  const [promocionSeleccionada, setPromocionSeleccionada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalProducto, setModalProducto] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const mensajeRef = useRef(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
  };

  const extraerMensajeError = (e, porDefecto) => {
    if (e?.response?.data) {
      const data = e.response.data;
      if (typeof data === "string") return data;
      if (data?.message) return data.message;
      if (data?.detail) return data.detail;
      if (Array.isArray(data)) return data.map(d => d.msg || JSON.stringify(d)).join(" | ");
      if (typeof data === "object" && data?.msg) return data.msg;
      return JSON.stringify(data);
    }
    return porDefecto;
  };

  const obtenerPromociones = async () => {
    try {
      const resp = await obtenerPromocionesServicio();
      const lista = resp?.success && Array.isArray(resp.data) ? resp.data : Array.isArray(resp) ? resp : [];
      if (lista.length > 0) {
        const ahora = new Date();
        const vencidas = lista.filter(p => {
          const fin = new Date(p.fechaFinPromocion);
          return p.activoPromocion && !isNaN(fin.getTime()) && fin < ahora;
        });
        if (vencidas.length > 0) {
          await Promise.all(vencidas.map(p => deshabilitarPromocionServicio(p.idPromocion).catch(() => null)));
          const listaActualizada = lista.map(p =>
            vencidas.some(v => v.idPromocion === p.idPromocion) ? { ...p, activoPromocion: false } : p
          );
          setPromociones(listaActualizada);
          return;
        }
      }
      setPromociones(lista);
    } catch (e) {
      setPromociones([]);
      mostrarMensaje("error", "Error al cargar promociones");
    }
  };

  const obtenerProductos = async () => {
    try {
      const resp = await obtenerProductosServicio();
      if (resp?.success && Array.isArray(resp.data)) setProductos(resp.data);
      else if (Array.isArray(resp)) setProductos(resp);
      else setProductos([]);
    } catch (e) {
      setProductos([]);
    }
  };

  useEffect(() => {
    obtenerPromociones();
    obtenerProductos();
    const intervalo = setInterval(() => {
      obtenerPromociones();
      obtenerProductos();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (mensaje && mensajeRef.current) mensajeRef.current.focus();
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const promocionesFiltradas = (Array.isArray(promociones) ? promociones : []).filter(p => {
    const texto = `${p.nombrePromocion} ${p.producto?.nombreProducto || ""}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  const productosActivos = (Array.isArray(productos) ? productos : []).filter(p => p.activoProducto);

  const abrirCrear = () => {
    setModo("crear");
    setPromocionSeleccionada(null);
    setProductoSeleccionado(null);
    setModalProducto(false);
    reset({
      idProducto: "",
      nombrePromocion: "",
      porcentajePromocion: "",
      fechaInicioPromocion: "",
      fechaFinPromocion: "",
    });
  };

  const abrirVer = (promo) => {
    setPromocionSeleccionada(promo);
    setModo("ver");
  };

  const deshabilitarPromocion = async (promo) => {
    try {
      const resp = await deshabilitarPromocionServicio(promo.idPromocion);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al deshabilitar promoción");
        return;
      }
      mostrarMensaje("exito", `Promoción ${promo.nombrePromocion} deshabilitada correctamente`);
      await obtenerPromociones();
      setModo("lista");
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al deshabilitar promoción"));
    }
  };

  const onSubmit = async (datos) => {
    try {
      if (!datos.idProducto) {
        mostrarMensaje("error", "Debe seleccionar un producto activo");
        return;
      }
      const hoy = new Date();
      const hoyStr = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString().slice(0, 10);
      if (datos.fechaInicioPromocion < hoyStr) {
        mostrarMensaje("error", "La fecha de inicio debe ser hoy o posterior");
        return;
      }
      if (datos.fechaFinPromocion < datos.fechaInicioPromocion) {
        mostrarMensaje("error", "La fecha fin debe ser igual o posterior a la fecha inicio");
        return;
      }

      const payload = {
        idProducto: Number(datos.idProducto),
        nombrePromocion: datos.nombrePromocion,
        porcentajePromocion: Number(datos.porcentajePromocion),
        fechaInicioPromocion: datos.fechaInicioPromocion,
        fechaFinPromocion: datos.fechaFinPromocion,
      };
      const resp = await crearPromocionServicio(payload);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al crear promoción");
        return;
      }
      mostrarMensaje("exito", `Promoción ${payload.nombrePromocion} creada correctamente`);
      await obtenerPromociones();
      setModo("lista");
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al crear promoción"));
    }
  };

  const columnas = [
    { name: "ID", selector: fila => fila.idPromocion, sortable: true, width: "80px", center: true },
    { name: "Nombre", selector: fila => fila.nombrePromocion, sortable: true, wrap: true },
    { name: "%", selector: fila => fila.porcentajePromocion, sortable: true, center: true, width: "80px" },
    {
      name: "Inicio",
      selector: fila => fila.fechaInicioPromocion,
      sortable: true,
      cell: fila => new Date(fila.fechaInicioPromocion).toLocaleDateString(),
      center: true,
      width: "120px",
    },
    {
      name: "Fin",
      selector: fila => fila.fechaFinPromocion,
      sortable: true,
      cell: fila => new Date(fila.fechaFinPromocion).toLocaleDateString(),
      center: true,
      width: "120px",
    },
    {
      name: "Activo",
      cell: fila => fila.activoPromocion ? <span className="text-green-600 font-semibold">Activo</span> : <span className="text-red-600 font-semibold">Inactivo</span>,
      sortable: true,
      center: true,
      width: "100px",
    },
    { name: "Producto", selector: fila => fila.producto?.nombreProducto, sortable: true, wrap: true },
    {
      name: "Acciones",
      cell: fila => (
        <div className="flex gap-2 justify-center">
          <button
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200 transition font-semibold shadow-sm"
            title="Ver promoción"
            onClick={() => abrirVer(fila)}
            style={{ minWidth: 36, minHeight: 28, height: 28, fontSize: "0.9rem", padding: "0.25rem 0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            className={clsx(
              "flex items-center gap-1 px-3 py-1 rounded-lg border transition font-semibold shadow-sm",
              fila.activoPromocion ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
            )}
            title="Deshabilitar promoción"
            onClick={fila.activoPromocion ? () => deshabilitarPromocion(fila) : undefined}
            disabled={!fila.activoPromocion}
            style={{ minWidth: 36, minHeight: 28, height: 28, fontSize: "0.9rem", padding: "0.25rem 0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      grow: 1.5,
    },
  ];

  const estilosTabla = {
    table: {
      style: {
        borderRadius: 0,
        boxShadow: "none",
        border: "none",
        fontSize: "0.92rem",
        width: "100%",
        tableLayout: "fixed",
        background: "white",
        margin: "0 auto",
      },
    },
    headRow: {
      style: {
        background: "#f3f4f6",
        fontWeight: 700,
        fontSize: "0.9rem",
        color: "#1f2937",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      },
    },
    headCells: {
      style: {
        whiteSpace: "normal",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
        paddingLeft: "0.2rem",
        paddingRight: "0.2rem",
        paddingTop: "0.1rem",
        paddingBottom: "0.1rem",
      },
    },
    rows: {
      style: {
        minHeight: "36px",
        borderBottom: "1px solid #e5e7eb",
        transition: "background 0.2s",
        wordBreak: "break-word",
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
        paddingTop: "0.05rem",
        paddingBottom: "0.05rem",
      },
    },
    pagination: {
      style: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        background: "#f9fafb",
      },
    },
  };

  return (
    <main className="flex flex-col h-full w-full p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Promociones</h1>
      {mensaje && (
        <div
          ref={mensajeRef}
          tabIndex={-1}
          className={clsx("p-3 mb-4 rounded text-white text-center font-semibold outline-none", {
            "bg-green-600": mensaje.tipo === "exito",
            "bg-red-600": mensaje.tipo === "error",
          })}
          role="alert"
          aria-live="assertive"
        >
          {mensaje.texto}
        </div>
      )}

      {modo === "lista" && (
        <>
          <div className="flex justify-between mb-3">
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={abrirCrear}>Crear promoción</button>
            <input type="text" placeholder="Buscar por nombre o producto" value={filtro} onChange={e => setFiltro(e.target.value)} className="border rounded px-2 py-1 w-96" />
          </div>
          <div className="flex-grow">
            {promocionesFiltradas.length === 0 ? (
              <p className="text-center mt-10 font-semibold text-gray-500">No se encontraron promociones</p>
            ) : (
              <div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                <DataTable
                  columns={columnas}
                  data={promocionesFiltradas}
                  defaultSortAsc={true}
                  defaultSortFieldId={1}
                  pagination
                  highlightOnHover
                  striped
                  noHeader={false}
                  customStyles={estilosTabla}
                  noDataComponent={<span className="text-gray-500">No hay promociones</span>}
                  responsive
                />
              </div>
            )}
          </div>
        </>
      )}

      {modo === "crear" && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto p-8 flex flex-col gap-4" noValidate>
          <div className="flex items-center mb-3">
            <button
              type="button"
              onClick={() => setModo("lista")}
              className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow focus:outline-none"
              title="Regresar a la tabla"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-semibold flex-1">Crear promoción</h2>
          </div>

          <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => {
            setBusquedaProducto("");
            setModalProducto(true);
          }}>
            Buscar producto
          </button>
          {productoSeleccionado && (
            <span className="text-blue-700 font-semibold">
              {productoSeleccionado.nombreProducto} (ID: {productoSeleccionado.idProducto})
              <button type="button" className="ml-2 text-red-600 font-bold text-lg" onClick={() => {
                setProductoSeleccionado(null);
                setValue("idProducto", "");
              }} title="Borrar selección">×</button>
            </span>
          )}

          <label className="font-medium">Nombre promoción</label>
          <input
            {...register("nombrePromocion", { required: "Nombre requerido", maxLength: { value: 100, message: "Máximo 100 caracteres" } })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.nombrePromocion })}
            type="text"
            placeholder="Ej: Promo Verano"
            autoFocus
          />
          {errors.nombrePromocion && <p className="text-red-600 text-sm">{errors.nombrePromocion.message}</p>}

          <label className="font-medium">Porcentaje</label>
          <input
            {...register("porcentajePromocion", { required: "Porcentaje requerido", min: { value: 1, message: "Debe ser mayor a 0" }, max: { value: 100, message: "Máximo 100" } })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.porcentajePromocion })}
            type="number"
            step="0.01"
            min={1}
            max={100}
            placeholder="Ej: 20"
          />
          {errors.porcentajePromocion && <p className="text-red-600 text-sm">{errors.porcentajePromocion.message}</p>}

          <label className="font-medium">Fecha inicio</label>
          <input
            {...register("fechaInicioPromocion", { required: "Fecha inicio requerida" })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.fechaInicioPromocion })}
            type="date"
            placeholder="YYYY-MM-DD"
          />
          {errors.fechaInicioPromocion && <p className="text-red-600 text-sm">{errors.fechaInicioPromocion.message}</p>}

          <label className="font-medium">Fecha fin</label>
          <input
            {...register("fechaFinPromocion", { required: "Fecha fin requerida" })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.fechaFinPromocion })}
            type="date"
            placeholder="YYYY-MM-DD"
          />
          {errors.fechaFinPromocion && <p className="text-red-600 text-sm">{errors.fechaFinPromocion.message}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setModo("lista")} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Guardar</button>
          </div>

          {modalProducto && (
            <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.1)" }}>
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" onClick={() => setModalProducto(false)} aria-label="Cerrar modal">×</button>
                <h2 className="text-xl font-bold mb-2">Seleccionar producto</h2>
                <p className="text-sm text-gray-500 mb-3">Seleccione un producto activo para la promoción.</p>
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={e => setBusquedaProducto(e.target.value)}
                  onFocus={() => setBusquedaProducto("")}
                  placeholder="Filtrar por nombre o ID"
                  className="border rounded px-2 py-1 w-full mb-3"
                />
                <div className="max-h-60 overflow-y-auto">
                  {productosActivos.filter(p =>
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
        </form>
      )}

      {modo === "ver" && promocionSeleccionada && (
        <section className="w-full max-w-3xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200" style={{ marginTop: 24 }}>
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Resumen de Promoción</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Nombre promoción</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{promocionSeleccionada.nombrePromocion}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Porcentaje</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{promocionSeleccionada.porcentajePromocion}%</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Fecha inicio</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{new Date(promocionSeleccionada.fechaInicioPromocion).toLocaleString()}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Fecha fin</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{new Date(promocionSeleccionada.fechaFinPromocion).toLocaleString()}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Producto</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{promocionSeleccionada.producto?.nombreProducto}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Categoría</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{promocionSeleccionada.producto?.categoria?.nombreCategoria || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Proveedor</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{promocionSeleccionada.producto?.proveedor?.razonSocial || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Estado</p>
              <div className={clsx("text-lg font-semibold rounded px-3 py-2 border border-gray-200", promocionSeleccionada.activoPromocion ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                {promocionSeleccionada.activoPromocion ? "Activo" : "Inactivo"}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setModo("lista")} className="bg-gray-500 text-white px-5 py-2 rounded shadow hover:bg-gray-600 transition-colors duration-150">Volver</button>
          </div>
        </section>
      )}
    </main>
  );
}
