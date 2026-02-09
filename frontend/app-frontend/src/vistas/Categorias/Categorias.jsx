import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
    obtenerCategoriasServicio,
    crearCategoriaServicio,
    actualizarCategoriaServicio,
    deshabilitarCategoriaServicio
} from "../../servicios/serviciosCategorias";

export default function Categorias() {
    // Estados principales
    const [mensaje, setMensaje] = useState(null);
    const mensajeRef = useRef(null);
    const [modo, setModo] = useState("lista");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [filtro, setFiltro] = useState("");

    // Formulario
    const { register, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm();

    // Filtrado de categorías
    const categoriasFiltradas = categorias.filter(c =>
        c.nombreCategoria?.toLowerCase().includes(filtro.toLowerCase())
    );

    // Cargar categorías al montar y actualizar cada 10 segundos
    useEffect(() => {
        obtenerCategorias();
        const intervalo = setInterval(() => {
            obtenerCategorias();
        }, 5000); // 5 segundos
        return () => clearInterval(intervalo);
    }, []);

    // Enfocar y ocultar mensaje automáticamente
    useEffect(() => {
        if (mensaje) {
            if (mensajeRef.current) mensajeRef.current.focus();
            const timer = setTimeout(() => setMensaje(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    async function obtenerCategorias() {
        try {
            const resp = await obtenerCategoriasServicio();
            if (resp && Array.isArray(resp.data)) {
                setCategorias(resp.data);
            } else if (Array.isArray(resp)) {
                setCategorias(resp);
            } else {
                setCategorias([]);
            }
        } catch (error) {
            setCategorias([]);
            setMensaje({ tipo: "error", texto: "Error al cargar categorías" });
        }
    }

    function abrirCrear() {
        setModo("crear");
        setCategoriaSeleccionada(null);
        reset({ nombreCategoria: "" });
        clearErrors();
        setMensaje(null);
    }

    function abrirActualizar(categoria) {
        setModo("actualizar");
        setCategoriaSeleccionada(categoria);
        reset({
            nombreCategoria: categoria.nombreCategoria,
            activoCategoria: categoria.activoCategoria,
        });
    }

    const abrirVer = categoria => {
        setModo("ver");
        setCategoriaSeleccionada(categoria);
    };

    const columnas = [
        {
            name: "ID",
            selector: fila => fila.idCategoriaProducto,
            sortable: true,
            width: "80px",
        },
        {
            name: "Nombre",
            selector: fila => fila.nombreCategoria,
            sortable: true,
        },
        {
            name: "Estado",
            cell: fila => fila.activoCategoria
                ? <span className="text-green-600 font-semibold">Activo</span>
                : <span className="text-red-600 font-semibold">Inactivo</span>,
            sortable: true,
        },
        {
            name: "Ver",
            cell: fila => (
                <button
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200 transition font-semibold shadow-sm mx-auto"
                    title="Ver categoría"
                    onClick={() => abrirVer(fila)}
                    style={{ minWidth: 36, minHeight: 28, height: 28, fontSize: '0.93rem', padding: '0.25rem 0.5rem' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
            ),
            ignoreRowClick: true,
            button: true,
        },
        {
            name: "Actualizar",
            cell: fila => (
                <button
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 transition font-semibold shadow-sm mx-auto"
                    title="Actualizar categoría"
                    onClick={() => abrirActualizar(fila)}
                    style={{ minWidth: 36, minHeight: 28, height: 28, fontSize: '0.93rem', padding: '0.25rem 0.5rem' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.001 2.938L7.5 19.5 3 21l1.5-4.5 12.362-12.013z" /></svg>
                </button>
            ),
            ignoreRowClick: true,
            button: true,
        },
        {
            name: "Deshabilitar",
            cell: fila => (
                <button
                    className={clsx(
                        "flex items-center gap-1 px-3 py-1 rounded-lg border transition font-semibold shadow-sm mx-auto",
                        fila.activoCategoria
                            ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                            : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    )}
                    title="Deshabilitar categoría"
                    onClick={fila.activoCategoria ? async () => {
                        try {
                            const resp = await deshabilitarCategoriaServicio(fila.idCategoriaProducto);
                            if (!resp.success) {
                                setMensaje({ tipo: "error", texto: resp.message || "Error al deshabilitar categoría" });
                                return;
                            }
                            setMensaje({ tipo: "exito", texto: `Categoría deshabilitada correctamente` });
                            await obtenerCategorias();
                            setModo("lista");
                        } catch (e) {
                            let texto = "Error al deshabilitar categoría";
                            if (e && e.response && e.response.data) {
                                if (e.response.data.message) texto = e.response.data.message;
                            }
                            setMensaje({ tipo: "error", texto });
                        }
                    } : undefined}
                    disabled={!fila.activoCategoria}
                    style={{ minWidth: 36, minHeight: 28, height: 28, fontSize: '0.93rem', padding: '0.25rem 0.5rem' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            ),
            ignoreRowClick: true,
            button: true,
        },
    ];

    return (
        <main className="flex flex-col h-full w-full p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Gestión Categorías</h1>
            {mensaje && (() => {
                const texto = typeof mensaje.texto === "string"
                    ? mensaje.texto
                    : Array.isArray(mensaje.texto)
                        ? mensaje.texto.map((t, i) => typeof t === "string" ? t : JSON.stringify(t)).join(" | ")
                        : typeof mensaje.texto === "object" && mensaje.texto?.msg
                            ? mensaje.texto.msg
                            : JSON.stringify(mensaje.texto);
                return (
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
                        {texto}
                    </div>
                );
            })()}
            {modo === "lista" && (
                <>
                    <div className="flex justify-between mb-3">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={abrirCrear}>Crear Categoría</button>
                        <input type="text" placeholder="Buscar por nombre" value={filtro} onChange={e => setFiltro(e.target.value)} className="border rounded px-2 py-1 w-96" autoFocus />
                    </div>
                    <div className="flex-grow">
                        {categoriasFiltradas.length === 0 ? (
                            <p className="text-center mt-10 font-semibold text-gray-500">No se encontraron categorías</p>
                        ) : (
                            <div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                                <DataTable
                                    columns={columnas}
                                    data={categoriasFiltradas}
                                    defaultSortAsc={true}
                                    defaultSortFieldId={1}
                                    pagination
                                    highlightOnHover
                                    striped
                                    noHeader={false}
                                    customStyles={{
                                        table: {
                                            style: {
                                                borderRadius: 0,
                                                boxShadow: 'none',
                                                border: 'none',
                                                fontSize: '0.92rem',
                                                width: '100%',
                                                tableLayout: 'fixed',
                                                background: 'white',
                                                margin: '0 auto',
                                            },
                                        },
                                        headRow: {
                                            style: {
                                                background: '#f3f4f6',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                color: '#1f2937',
                                                borderTopLeftRadius: 0,
                                                borderTopRightRadius: 0,
                                            },
                                        },
                                        headCells: {
                                            style: {
                                                whiteSpace: 'normal',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                wordBreak: 'break-word',
                                                paddingLeft: '0.2rem',
                                                paddingRight: '0.2rem',
                                                paddingTop: '0.1rem',
                                                paddingBottom: '0.1rem',
                                            },
                                        },
                                        rows: {
                                            style: {
                                                minHeight: '36px',
                                                borderBottom: '1px solid #e5e7eb',
                                                transition: 'background 0.2s',
                                                wordBreak: 'break-word',
                                            },
                                        },
                                        cells: {
                                            style: {
                                                whiteSpace: 'normal',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                wordBreak: 'break-word',
                                                paddingLeft: '0.2rem',
                                                paddingRight: '0.2rem',
                                                paddingTop: '0.05rem',
                                                paddingBottom: '0.05rem',
                                            },
                                        },
                                        pagination: {
                                            style: {
                                                borderBottomLeftRadius: 0,
                                                borderBottomRightRadius: 0,
                                                background: '#f9fafb',
                                            },
                                        },
                                    }}
                                    noDataComponent={<span className="text-gray-500">No hay categorías</span>}
                                    responsive
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
            {(modo === "crear" || modo === "actualizar") && (
                <form onSubmit={handleSubmit(modo === "crear" ? async datos => {
                    try {
                        const payload = { nombreCategoria: datos.nombreCategoria };
                        const resp = await crearCategoriaServicio(payload);
                        if (!resp.success) {
                            setMensaje({ tipo: "error", texto: resp.message || "Error al crear categoría" });
                            return;
                        }
                        setMensaje({ tipo: "exito", texto: `Categoría creada correctamente` });
                        await obtenerCategorias();
                        setModo("lista");
                    } catch (e) {
                        let texto = "Error al crear categoría";
                        if (e && e.response && e.response.data) {
                            if (e.response.data.message) texto = e.response.data.message;
                        }
                        setMensaje({ tipo: "error", texto });
                    }
                } : async datos => {
                    try {
                        const payload = {
                            nombreCategoria: datos.nombreCategoria,
                            activoCategoria: datos.activoCategoria ?? true,
                        };
                        const resp = await actualizarCategoriaServicio(categoriaSeleccionada.idCategoriaProducto, payload);
                        if (!resp.success) {
                            setMensaje({ tipo: "error", texto: resp.message || "Error al actualizar categoría" });
                            return;
                        }
                        setMensaje({ tipo: "exito", texto: `Categoría actualizada correctamente` });
                        await obtenerCategorias();
                        setModo("lista");
                    } catch (e) {
                        let texto = "Error al actualizar categoría";
                        if (e && e.response && e.response.data) {
                            if (e.response.data.message) texto = e.response.data.message;
                        }
                        setMensaje({ tipo: "error", texto });
                    }
                })} className="w-full max-w-2xl mx-auto p-8 flex flex-col gap-4" noValidate>
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
                        <h2 className="text-2xl font-semibold flex-1">{modo === "crear" ? "Crear Categoría" : "Actualizar Categoría"}</h2>
                    </div>
                    <label className="font-medium">Nombre Categoría</label>
                    <input
                        {...register("nombreCategoria", {
                            required: "Nombre requerido",
                            minLength: { value: 3, message: "Mínimo 3 caracteres" },
                            maxLength: { value: 50, message: "Máximo 50 caracteres" },
                        })}
                        className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.nombreCategoria })}
                        type="text"
                        autoFocus
                    />
                    {errors.nombreCategoria && <p className="text-red-600 text-sm">{errors.nombreCategoria.message}</p>}
                    {modo === "actualizar" && (
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" {...register("activoCategoria")} id="activoCategoria" className="w-4 h-4" />
                            <label htmlFor="activoCategoria" className="select-none">Activo</label>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setModo("lista")} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{modo === "crear" ? "Guardar" : "Actualizar"}</button>
                    </div>
                </form>
            )}
            {modo === "ver" && categoriaSeleccionada && (
                <section className="w-full max-w-2xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200" style={{ marginTop: 24 }}>
                    <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Resumen de Categoría</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Nombre Categoría</p>
                            <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{categoriaSeleccionada.nombreCategoria}</div>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Estado</p>
                            <div className={clsx("text-lg font-semibold rounded px-3 py-2 border border-gray-200", categoriaSeleccionada.activoCategoria ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{categoriaSeleccionada.activoCategoria ? "Activo" : "Inactivo"}</div>
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