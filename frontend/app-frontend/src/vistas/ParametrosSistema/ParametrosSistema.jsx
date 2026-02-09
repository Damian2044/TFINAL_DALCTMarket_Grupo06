import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
    obtenerParametrosServicio,
    actualizarParametroServicio,
    subirLogoNegocioServicio
} from "../../servicios/serviciosParametrosSistema";

export default function ParametrosSistema() {
    const [mensaje, setMensaje] = useState(null);
    const mensajeRef = useRef(null);
    const [parametros, setParametros] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [parametroSeleccionado, setParametroSeleccionado] = useState(null);
    const [modo, setModo] = useState("lista");

    const { register, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm();

    // Filtrado y orden por ID descendente
    const parametrosFiltrados = parametros
        .filter(p => p.claveParametro?.toLowerCase().includes(filtro.toLowerCase()))
        .sort((a, b) => b.idParametroSistema - a.idParametroSistema);

    useEffect(() => {
        obtenerParametros();
        const intervalo = setInterval(() => {
            obtenerParametros();
        }, 5000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        if (mensaje) {
            if (mensajeRef.current) mensajeRef.current.focus();
            const timer = setTimeout(() => setMensaje(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    async function obtenerParametros() {
        try {
            const resp = await obtenerParametrosServicio();
            if (resp && Array.isArray(resp.data)) {
                setParametros(resp.data);
            } else if (Array.isArray(resp)) {
                setParametros(resp);
            } else {
                setParametros([]);
            }
        } catch (error) {
            setParametros([]);
            setMensaje({ tipo: "error", texto: "Error al cargar parámetros" });
        }
    }

    function abrirActualizar(parametro) {
        setModo("actualizar");
        setParametroSeleccionado(parametro);
        reset({
            claveParametro: parametro.claveParametro,
            valorParametro: parametro.valorParametro,
            activoParametro: parametro.activoParametro,
        });
        clearErrors();
        setMensaje(null);
    }

    const columnas = [
        {
            name: "ID",
            selector: fila => fila.idParametroSistema,
            sortable: true,
            width: "80px",
        },
        {
            name: "Clave",
            selector: fila => fila.claveParametro,
            sortable: true,
        },
        {
            name: "Valor",
            selector: fila => fila.valorParametro,
            sortable: true,
        },
        {
            name: "Estado",
            cell: fila => fila.activoParametro
                ? <span className="text-green-600 font-semibold">Activo</span>
                : <span className="text-red-600 font-semibold">Inactivo</span>,
            sortable: true,
        },
        {
            name: "Actualizar",
            cell: fila => (
                <button
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 transition font-semibold shadow-sm mx-auto"
                    title="Actualizar parámetro"
                    onClick={() => abrirActualizar(fila)}
                    style={{ minWidth: 36, minHeight: 28, height: 28, fontSize: '0.93rem', padding: '0.25rem 0.5rem' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.001 2.938L7.5 19.5 3 21l1.5-4.5 12.362-12.013z" /></svg>
                </button>
            ),
            ignoreRowClick: true,
            button: true,
        },
    ];

    // Validaciones específicas
    function validarValor(clave, valor) {
        if (clave === "IVA") {
            if (!/^\d{1,2}$/.test(valor)) return "IVA debe ser un número de 1 o 2 dígitos";
            if (parseInt(valor) < 0 || parseInt(valor) > 99) return "IVA fuera de rango (0-99)";
        }
        if (clave === "correoNegocio") {
            if (!/^\S+@\S+\.\S+$/.test(valor)) return "Correo inválido";
        }
        if (clave === "telefonoNegocio") {
            if (!/^\d{2}-\d{7,8}$/.test(valor)) return "Teléfono inválido (ej: 02-3450538)";
        }
        return null;
    }

    // Actualizar parámetro
    async function onActualizar(datos) {
        const errorValidacion = validarValor(parametroSeleccionado.claveParametro, datos.valorParametro);
        if (errorValidacion) {
            setError("valorParametro", { type: "manual", message: errorValidacion });
            return;
        }
        try {
            let valorEnviar = datos.valorParametro;
            // Si es IVA, asegurar string
            if (parametroSeleccionado.claveParametro === "IVA") {
                valorEnviar = String(valorEnviar);
            }
            // Si es logo, subir imagen y usar la ruta devuelta
            if (parametroSeleccionado.claveParametro === "logoNegocio" && datos.logoFile && datos.logoFile[0]) {
                const archivo = datos.logoFile[0];
                const respLogo = await subirLogoNegocioServicio(archivo);
                if (respLogo && respLogo.success && respLogo.data && respLogo.data.rutaLogo) {
                    valorEnviar = respLogo.data.rutaLogo.replace(/^imagenes\//, "");
                } else {
                    setMensaje({ tipo: "error", texto: respLogo?.message || "Error al subir logo" });
                    return;
                }
            }
            const payload = {
                valorParametro: String(valorEnviar),
            };
            const resp = await actualizarParametroServicio(parametroSeleccionado.idParametroSistema, payload);
            if (!resp.success) {
                setMensaje({ tipo: "error", texto: resp.message || "Error al actualizar parámetro" });
                return;
            }
            setMensaje({ tipo: "exito", texto: `Parámetro actualizado correctamente` });
            await obtenerParametros();
            setModo("lista");
        } catch (e) {
            let texto = "Error al actualizar parámetro";
            if (e && e.response && e.response.data) {
                if (e.response.data.message) texto = e.response.data.message;
            }
            setMensaje({ tipo: "error", texto });
        }
    }

    return (
        <main className="flex flex-col h-full w-full p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Parámetros del Sistema</h1>
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
                        <input type="text" placeholder="Buscar por clave" value={filtro} onChange={e => setFiltro(e.target.value)} className="border rounded px-2 py-1 w-96" autoFocus />
                    </div>
                    <div className="flex-grow">
                        {parametrosFiltrados.length === 0 ? (
                            <p className="text-center mt-10 font-semibold text-gray-500">No se encontraron parámetros</p>
                        ) : (
                            <div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                                <DataTable
                                    columns={columnas}
                                    data={parametrosFiltrados}
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
                                    noDataComponent={<span className="text-gray-500">No hay parámetros</span>}
                                    responsive
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
            {modo === "actualizar" && parametroSeleccionado && (
                <form onSubmit={handleSubmit(onActualizar)} className="w-full max-w-2xl mx-auto p-8 flex flex-col gap-4" noValidate>
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
                        <h2 className="text-2xl font-semibold flex-1">Actualizar parámetro</h2>
                    </div>
                    <label className="font-medium">Clave</label>
                    <input
                        value={parametroSeleccionado.claveParametro}
                        className="border rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                        type="text"
                        disabled
                    />
                    <label className="font-medium">Valor</label>
                    {parametroSeleccionado.claveParametro === "logoNegocio" ? (
                        <input
                            {...register("logoFile")}
                            className="border rounded px-3 py-2"
                            type="file"
                            accept="image/*"
                        />
                    ) : parametroSeleccionado.claveParametro === "IVA" ? (
                        <input
                            {...register("valorParametro", {
                                required: "IVA requerido",
                                min: { value: 0, message: "IVA no puede ser negativo" },
                                max: { value: 99, message: "IVA fuera de rango (0-99)" },
                                valueAsNumber: true,
                            })}
                            className={clsx("border rounded px-3 py-2 w-32", { "border-red-600 bg-red-50": errors.valorParametro })}
                            type="number"
                            min={0}
                            max={99}
                            step={1}
                            autoFocus
                        />
                    ) : (
                        <input
                            {...register("valorParametro", {
                                required: "Valor requerido",
                                minLength: { value: 1, message: "Mínimo 1 caracter" },
                                maxLength: { value: 500, message: "Máximo 500 caracteres" },
                            })}
                            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.valorParametro })}
                            type="text"
                            autoFocus
                        />
                    )}
                    {errors.valorParametro && <p className="text-red-600 text-sm">{errors.valorParametro.message}</p>}
                    {/* No permitir editar el campo activoParametro */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setModo("lista")} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Actualizar</button>
                    </div>
                </form>
            )}
        </main>
    );
}