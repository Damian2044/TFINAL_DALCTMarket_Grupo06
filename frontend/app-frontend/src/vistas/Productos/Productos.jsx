import React, { useEffect, useRef, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { JwtContext } from "@/context/jwtContext";
import {
  crearProductoServicio,
  actualizarProductoServicio,
  deshabilitarProductoServicio,
} from "@/servicios/serviciosProductos";
import {
  obtenerInventariosServicio,
  actualizarInventarioServicio,
  deshabilitarInventarioServicio,
} from "@/servicios/serviciosInventario";
import { obtenerCategoriasServicio } from "@/servicios/serviciosCategorias";
import { obtenerProveedoresServicio } from "@/servicios/serviciosProveedores";

export default function Productos() {
  const { usuario } = useContext(JwtContext);
  const rol = usuario?.rol || "";
  const esAdministrador = rol === "Administrador";

  const [modo, setModo] = useState("lista");
  const [inventarioSeleccionado, setInventarioSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);
  const mensajeRef = useRef(null);

  const [inventarios, setInventarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();

  const {
    register: registerInv,
    handleSubmit: handleSubmitInv,
    reset: resetInv,
    formState: { errors: errorsInv },
  } = useForm();

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

  const obtenerInventarios = async () => {
    try {
      const resp = await obtenerInventariosServicio();
      if (resp?.success && Array.isArray(resp.data)) setInventarios(resp.data);
      else if (Array.isArray(resp)) setInventarios(resp);
      else setInventarios([]);
    } catch (e) {
      setInventarios([]);
      mostrarMensaje("error", "Error al cargar inventario");
    }
  };

  const obtenerCategorias = async () => {
    try {
      const resp = await obtenerCategoriasServicio();
      const data = resp?.data || [];
      setCategorias(Array.isArray(data) ? data : []);
    } catch {
      setCategorias([]);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const resp = await obtenerProveedoresServicio();
      const data = resp?.data || [];
      setProveedores(Array.isArray(data) ? data : []);
    } catch {
      setProveedores([]);
    }
  };

  useEffect(() => {
    obtenerInventarios();
    obtenerCategorias();
    obtenerProveedores();
    const intervalo = setInterval(() => {
      obtenerInventarios();
      obtenerCategorias();
      obtenerProveedores();
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

  useEffect(() => {
    const cerrarMenu = () => {
      if (menuAbiertoId !== null) setMenuAbiertoId(null);
    };
    window.addEventListener("click", cerrarMenu);
    return () => window.removeEventListener("click", cerrarMenu);
  }, [menuAbiertoId]);

  const categoriasActivas = categorias.filter(c => c.activoCategoria);
  const proveedoresActivos = proveedores.filter(p => p.activoProveedor);
  const categoriasSeleccionables = modo === "actualizar" && inventarioSeleccionado?.producto
    ? [
        ...categoriasActivas,
        ...categorias.filter(c => c.idCategoriaProducto === inventarioSeleccionado.producto.idCategoriaProducto && !c.activoCategoria),
      ]
    : categoriasActivas;
  const proveedoresSeleccionables = modo === "actualizar" && inventarioSeleccionado?.producto
    ? [
        ...proveedoresActivos,
        ...proveedores.filter(p => p.idProveedor === inventarioSeleccionado.producto.idProveedor && !p.activoProveedor),
      ]
    : proveedoresActivos;

  const inventariosFiltrados = (Array.isArray(inventarios) ? inventarios : []).filter(i => {
    const texto = `${i.producto?.nombreProducto || ""} ${i.producto?.categoria?.nombreCategoria || ""} ${i.producto?.proveedor?.razonSocial || ""}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  const abrirCrear = () => {
    setModo("crear");
    setInventarioSeleccionado(null);
    reset({
      idCategoriaProducto: "",
      idProveedor: "",
      nombreProducto: "",
      descripcionProducto: "",
      precioUnitarioVenta: "",
      precioUnitarioCompra: "",
      tieneIva: true,
    });
    clearErrors();
  };

  const abrirActualizarProducto = (inv) => {
    setModo("actualizar");
    setInventarioSeleccionado(inv);
    reset({
      idCategoriaProducto: inv.producto?.idCategoriaProducto,
      idProveedor: inv.producto?.idProveedor,
      nombreProducto: inv.producto?.nombreProducto,
      descripcionProducto: inv.producto?.descripcionProducto || "",
      precioUnitarioVenta: inv.producto?.precioUnitarioVenta,
      precioUnitarioCompra: inv.producto?.precioUnitarioCompra,
      tieneIva: inv.producto?.tieneIva,
      activoProducto: inv.producto?.activoProducto,
    });
  };

  const abrirAjusteInventario = (inv) => {
    setModo("ajuste");
    setInventarioSeleccionado(inv);
    resetInv({
      cantidadDisponible: inv.cantidadDisponible,
      cantidadMinima: inv.cantidadMinima,
      activoInventario: inv.activoInventario,
    });
  };

  const deshabilitarProductoCadena = async (inv) => {
    try {
      await deshabilitarProductoServicio(inv.producto.idProducto);
      await deshabilitarInventarioServicio(inv.idInventario);
      mostrarMensaje("exito", `Producto ${inv.producto.nombreProducto} deshabilitado correctamente`);
      await obtenerInventarios();
      setModo("lista");
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al deshabilitar producto"));
    }
  };

  const onSubmitProducto = async (datos) => {
    try {
      if (modo === "crear") {
        const payload = {
          idCategoriaProducto: Number(datos.idCategoriaProducto),
          idProveedor: Number(datos.idProveedor),
          nombreProducto: datos.nombreProducto,
          descripcionProducto: datos.descripcionProducto || "",
          precioUnitarioVenta: Number(datos.precioUnitarioVenta),
          precioUnitarioCompra: Number(datos.precioUnitarioCompra),
          tieneIva: !!datos.tieneIva,
        };
        const resp = await crearProductoServicio(payload);
        if (!resp?.success) {
          mostrarMensaje("error", resp?.message || "Error al crear producto");
          return;
        }
        mostrarMensaje("exito", `Producto ${payload.nombreProducto} creado correctamente`);
      } else if (modo === "actualizar" && inventarioSeleccionado) {
        const categoriaSeleccionada = categorias.find(c => c.idCategoriaProducto === Number(datos.idCategoriaProducto));
        const proveedorSeleccionado = proveedores.find(p => p.idProveedor === Number(datos.idProveedor));
        if (datos.activoProducto) {
          if (categoriaSeleccionada && !categoriaSeleccionada.activoCategoria) {
            mostrarMensaje("error", "No puedes activar el producto con una categoría desactivada");
            return;
          }
          if (proveedorSeleccionado && !proveedorSeleccionado.activoProveedor) {
            mostrarMensaje("error", "No puedes activar el producto con un proveedor desactivado");
            return;
          }
        }
        const payload = {
          idCategoriaProducto: Number(datos.idCategoriaProducto),
          idProveedor: Number(datos.idProveedor),
          nombreProducto: datos.nombreProducto,
          descripcionProducto: datos.descripcionProducto || "",
          precioUnitarioVenta: Number(datos.precioUnitarioVenta),
          precioUnitarioCompra: Number(datos.precioUnitarioCompra),
          tieneIva: !!datos.tieneIva,
          activoProducto: !!datos.activoProducto,
        };
        const resp = await actualizarProductoServicio(inventarioSeleccionado.producto.idProducto, payload);
        if (!resp?.success) {
          mostrarMensaje("error", resp?.message || "Error al actualizar producto");
          return;
        }
        mostrarMensaje("exito", `Producto ${payload.nombreProducto} actualizado correctamente`);
      }
      await obtenerInventarios();
      setModo("lista");
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al guardar producto"));
    }
  };

  const onSubmitInventario = async (datos) => {
    if (!inventarioSeleccionado?.idInventario) return;
    try {
      const payload = {
        cantidadMinima: Number(datos.cantidadMinima),
      };
      if (esAdministrador) {
        payload.cantidadDisponible = Number(datos.cantidadDisponible);
        payload.activoInventario = !!datos.activoInventario;
      }
      const resp = await actualizarInventarioServicio(inventarioSeleccionado.idInventario, payload);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al actualizar inventario");
        return;
      }
      mostrarMensaje("exito", "Inventario actualizado correctamente");
      await obtenerInventarios();
      setModo("lista");
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al actualizar inventario"));
    }
  };

  const columnas = [
    { name: "ID", selector: fila => fila.producto?.idProducto, sortable: true, width: "60px", wrap: true, center: true },
    { name: "Nombre", selector: fila => fila.producto?.nombreProducto, sortable: true, wrap: true, width: "120px", style: { whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere" } },
    { name: "Categoría", selector: fila => fila.producto?.categoria?.nombreCategoria, sortable: true, wrap: true },
    { name: "Proveedor", selector: fila => fila.producto?.proveedor?.razonSocial, sortable: true, wrap: true },
    { name: "Precio Venta", selector: fila => `$${Number(fila.producto?.precioUnitarioVenta || 0).toFixed(2)}`, sortable: true, wrap: true, center: true, width: "110px" },
    { name: "Precio Compra", selector: fila => `$${Number(fila.producto?.precioUnitarioCompra || 0).toFixed(2)}`, sortable: true, wrap: true, center: true, width: "110px" },
    {
      name: "IVA",
      cell: fila => fila.producto?.tieneIva ? <span className="text-green-700 font-semibold">Sí</span> : <span className="text-gray-500">No</span>,
      sortable: true,
      wrap: true,
      center: true,
      width: "70px",
    },
    {
      name: "Estado",
      cell: fila => fila.producto?.activoProducto ? <span className="text-green-600 font-semibold">Activo</span> : <span className="text-red-600 font-semibold">Inactivo</span>,
      sortable: true,
      wrap: true,
      center: true,
      width: "90px",
    },
    {
      name: "Stock disponible",
      selector: fila => fila.cantidadDisponible,
      sortable: true,
      wrap: true,
      center: true,
      width: "110px",
      cell: fila => {
        const disponible = Number(fila.cantidadDisponible ?? 0);
        const minimo = Number(fila.cantidadMinima ?? 0);
        let clases = "bg-emerald-100 text-emerald-700";
        if (disponible === 0) clases = "bg-red-100 text-red-700";
        else if (disponible <= minimo) clases = "bg-orange-100 text-orange-700";
        return (
          <span className={clsx("px-2 py-1 rounded-full text-xs font-semibold inline-block", clases)}>
            {disponible}
          </span>
        );
      },
    },
    {
      name: "Acciones",
      cell: fila => (
        <div className="relative">
          <button
            type="button"
            className="flex items-center justify-center border rounded-lg w-9 h-7 transition font-semibold shadow-sm bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            title="Acciones"
            onClick={(e) => {
              e.stopPropagation();
              const id = fila.producto?.idProducto;
              setMenuAbiertoId(menuAbiertoId === id ? null : id);
            }}
          >
            ☰
          </button>
          {menuAbiertoId === fila.producto?.idProducto && (
            <div className="fixed right-6 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-1">
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-sky-50 text-sky-700 font-semibold flex items-center gap-2"
                onClick={() => { setInventarioSeleccionado(fila); setModo("ver"); setMenuAbiertoId(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ver
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-yellow-50 text-yellow-800 font-semibold flex items-center gap-2"
                onClick={() => { abrirActualizarProducto(fila); setMenuAbiertoId(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.001 2.938L7.5 19.5 3 21l1.5-4.5 12.362-12.013z" />
                </svg>
                Actualizar producto
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-2"
                onClick={() => { abrirAjusteInventario(fila); setMenuAbiertoId(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.001 2.938L7.5 19.5 3 21l1.5-4.5 12.362-12.013z" />
                </svg>
                Ajuste inventario
              </button>
              <button
                className={clsx(
                  "w-full text-left px-3 py-2 rounded font-semibold flex items-center gap-2",
                  fila.producto?.activoProducto ? "hover:bg-red-50 text-red-700" : "text-gray-400 cursor-not-allowed"
                )}
                onClick={fila.producto?.activoProducto ? () => { deshabilitarProductoCadena(fila); setMenuAbiertoId(null); } : undefined}
                disabled={!fila.producto?.activoProducto}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Deshabilitar
              </button>
            </div>
          )}
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      grow: 2,
    },
  ];

  const estilosTabla = {
    table: {
      style: {
        borderRadius: 0,
        boxShadow: "none",
        border: "none",
        fontSize: "0.85rem",
        width: "100%",
        tableLayout: "fixed",
        background: "white",
        margin: "0 auto",
      },
    },
    tableWrapper: {
      style: {
        overflow: "visible",
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
        minHeight: "44px",
        overflow: "visible",
      },
    },
    headCells: {
      style: {
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "clip",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        lineHeight: "1.2",
        alignItems: "flex-start",
        paddingLeft: "0.1rem",
        paddingRight: "0.1rem",
        paddingTop: "0.05rem",
        paddingBottom: "0.05rem",
      },
    },
    rows: {
      style: {
        minHeight: "36px",
        borderBottom: "1px solid #e5e7eb",
        transition: "background 0.2s",
        wordBreak: "break-word",
        overflow: "visible",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        paddingLeft: "0.1rem",
        paddingRight: "0.1rem",
        paddingTop: "0.05rem",
        paddingBottom: "0.05rem",
        position: "relative",
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
      <h1 className="text-3xl font-bold mb-4 text-center">Catálogo de Productos e Inventario</h1>
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
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={abrirCrear}>Crear producto</button>
            <input type="text" placeholder="Buscar por nombre, categoría o proveedor" value={filtro} onChange={e => setFiltro(e.target.value)} className="border rounded px-2 py-1 w-96" />
          </div>
          <div className="flex-grow">
            {inventariosFiltrados.length === 0 ? (
              <p className="text-center mt-10 font-semibold text-gray-500">No se encontraron productos</p>
            ) : (
              <div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                <DataTable
                  columns={columnas}
                  data={inventariosFiltrados}
                  defaultSortAsc={true}
                  defaultSortFieldId={1}
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 25, 50]}
                  highlightOnHover
                  striped
                  noHeader={false}
                  customStyles={estilosTabla}
                  noDataComponent={<span className="text-gray-500">No hay productos</span>}
                  responsive
                />
              </div>
            )}
          </div>
        </>
      )}

      {(modo === "crear" || modo === "actualizar") && (
        <form onSubmit={handleSubmit(onSubmitProducto)} className="w-full max-w-2xl mx-auto p-8 flex flex-col gap-4" noValidate>
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
            <h2 className="text-2xl font-semibold flex-1">{modo === "crear" ? "Crear producto" : "Actualizar producto"}</h2>
          </div>

          <label className="font-medium">Categoría</label>
          <select
            {...register("idCategoriaProducto", { required: "Categoría requerida" })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.idCategoriaProducto })}
          >
            <option value="">Seleccione...</option>
            {categoriasSeleccionables.map(c => (
              <option key={c.idCategoriaProducto} value={c.idCategoriaProducto}>{c.nombreCategoria}</option>
            ))}
          </select>
          {errors.idCategoriaProducto && <p className="text-red-600 text-sm">{errors.idCategoriaProducto.message}</p>}

          <label className="font-medium">Proveedor</label>
          <select
            {...register("idProveedor", { required: "Proveedor requerido" })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.idProveedor })}
          >
            <option value="">Seleccione...</option>
            {proveedoresSeleccionables.map(p => (
              <option key={p.idProveedor} value={p.idProveedor}>{p.razonSocial}</option>
            ))}
          </select>
          {errors.idProveedor && <p className="text-red-600 text-sm">{errors.idProveedor.message}</p>}

          <label className="font-medium">Nombre producto</label>
          <input
            {...register("nombreProducto", {
              required: "Nombre requerido",
              minLength: { value: 1, message: "Mínimo 1 carácter" },
              maxLength: { value: 100, message: "Máximo 100 caracteres" },
            })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.nombreProducto })}
            type="text"
            autoFocus
          />
          {errors.nombreProducto && <p className="text-red-600 text-sm">{errors.nombreProducto.message}</p>}

          <label className="font-medium">Descripción</label>
          <textarea
            {...register("descripcionProducto", {
              maxLength: { value: 255, message: "Máximo 255 caracteres" },
            })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.descripcionProducto })}
            rows={3}
          />
          {errors.descripcionProducto && <p className="text-red-600 text-sm">{errors.descripcionProducto.message}</p>}

          <label className="font-medium">Precio unitario venta</label>
          <input
            {...register("precioUnitarioVenta", {
              required: "Precio requerido",
              min: { value: 0.01, message: "Debe ser mayor a 0" },
            })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.precioUnitarioVenta })}
            type="number"
            step="0.01"
            min={0.01}
          />
          {errors.precioUnitarioVenta && <p className="text-red-600 text-sm">{errors.precioUnitarioVenta.message}</p>}

          <label className="font-medium">Precio unitario compra</label>
          <input
            {...register("precioUnitarioCompra", {
              required: "Precio requerido",
              min: { value: 0.01, message: "Debe ser mayor a 0" },
            })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.precioUnitarioCompra })}
            type="number"
            step="0.01"
            min={0.01}
          />
          {errors.precioUnitarioCompra && <p className="text-red-600 text-sm">{errors.precioUnitarioCompra.message}</p>}

          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" {...register("tieneIva")} id="tieneIva" className="w-4 h-4" />
            <label htmlFor="tieneIva" className="select-none">Tiene IVA</label>
          </div>

          {modo === "actualizar" && (
            <>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" {...register("activoProducto")} id="activoProducto" className="w-4 h-4" />
                <label htmlFor="activoProducto" className="select-none">Activo</label>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setModo("lista")} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{modo === "crear" ? "Guardar" : "Actualizar"}</button>
          </div>
        </form>
      )}

      {modo === "ajuste" && inventarioSeleccionado && (
        <form onSubmit={handleSubmitInv(onSubmitInventario)} className="w-full max-w-xl mx-auto p-8 flex flex-col gap-4" noValidate>
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
            <h2 className="text-2xl font-semibold flex-1">Ajuste de inventario</h2>
          </div>
          <p className="text-sm text-gray-600">Producto: <span className="font-semibold">{inventarioSeleccionado.producto?.nombreProducto}</span></p>

          {esAdministrador && (
            <>
              <label className="font-medium">Cantidad disponible</label>
              <input
                {...registerInv("cantidadDisponible", { required: true, min: 0 })}
                className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errorsInv.cantidadDisponible })}
                type="number"
                min={0}
              />
            </>
          )}

          <label className="font-medium">Cantidad mínima</label>
          <input
            {...registerInv("cantidadMinima", { required: true, min: 0 })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errorsInv.cantidadMinima })}
            type="number"
            min={0}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setModo("lista")} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Guardar ajustes</button>
          </div>
        </form>
      )}

      {modo === "ver" && inventarioSeleccionado && (
        <section className="w-full max-w-3xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200" style={{ marginTop: 24 }}>
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Resumen de Producto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Producto</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{inventarioSeleccionado.producto?.nombreProducto}</div>
            </div>
            {inventarioSeleccionado.producto?.descripcionProducto && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Descripción</p>
                <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{inventarioSeleccionado.producto?.descripcionProducto}</div>
              </div>
            )}
            <div>
              <p className="text-gray-600 text-sm mb-1">Categoría</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{inventarioSeleccionado.producto?.categoria?.nombreCategoria || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Proveedor</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{inventarioSeleccionado.producto?.proveedor?.razonSocial || "-"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Precio Venta</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">${Number(inventarioSeleccionado.producto?.precioUnitarioVenta || 0).toFixed(2)}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Precio Compra</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">${Number(inventarioSeleccionado.producto?.precioUnitarioCompra || 0).toFixed(2)}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">IVA</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{inventarioSeleccionado.producto?.tieneIva ? "Sí" : "No"}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Estado</p>
              <div className={clsx("text-lg font-semibold rounded px-3 py-2 border border-gray-200", inventarioSeleccionado.producto?.activoProducto ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                {inventarioSeleccionado.producto?.activoProducto ? "Activo" : "Inactivo"}
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Stock disponible</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{inventarioSeleccionado.cantidadDisponible}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Mínimo</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{inventarioSeleccionado.cantidadMinima}</div>
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
