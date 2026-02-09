// Componente principal para gestión de usuarios
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import CampoContrasenaValidado from "./CampoContrasenaValidado";
import {
  obtenerUsuariosServicio,
  crearUsuarioServicio,
  actualizarUsuarioServicio,
  deshabilitarUsuarioServicio
} from "../../servicios/serviciosUsuarios";

import { useRef, useContext } from "react";
import { JwtContext } from "../../context/jwtContext";

export default function Usuarios() {

  // Estados principales
  const [mensaje, setMensaje] = useState(null);
  const mensajeRef = useRef(null);
  const [modo, setModo] = useState("lista");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const { borrarSesion } = useContext(JwtContext);

  // Formulario
  const { register, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm();

  // Filtrado de usuarios
  const usuariosFiltrados = usuarios.filter(u =>
    u.cedulaUsuario?.toLowerCase().includes(filtro.toLowerCase()) ||
    u.nombreCompleto?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Debug: ver datos que llegan a la tabla
  console.log("Usuarios para la tabla:", usuarios);
  console.log("Usuarios filtrados:", usuariosFiltrados);

  // Cargar usuarios al montar y actualizar cada 5 segundos
  useEffect(() => {
    obtenerUsuarios();
    const intervalo = setInterval(() => {
      obtenerUsuarios();
    }, 5000); // 5 segundos
    return () => clearInterval(intervalo);
  }, []);

  // Enfocar y ocultar mensaje automáticamente
  useEffect(() => {
    if (mensaje) {
      if (mensajeRef.current) {
        mensajeRef.current.focus();
      }
      const timer = setTimeout(() => {
        setMensaje(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);


  async function obtenerUsuarios() {
    try {
      const lista = await obtenerUsuariosServicio();
      // Si la respuesta es un objeto con .data, usar ese array
      if (lista && Array.isArray(lista.data)) {
        setUsuarios(lista.data);
      } else if (Array.isArray(lista)) {
        setUsuarios(lista);
      } else {
        setUsuarios([]);
      }
      // Si el token existe y no hay usuarios, mostrar mensaje especial
      if (window.localStorage.getItem('token') && (!lista || lista.length === 0)) {
        setMensaje({ tipo: "error", texto: "No se encontraron usuarios, pero el token está presente. Puede ser un problema de backend o permisos." });
      }
    } catch (error) {
      setUsuarios([]);
      if (error && error.response && error.response.status === 401) {
        setMensaje({ tipo: "error", texto: "Sesión caducada o no autorizada. Debes iniciar sesión nuevamente." });
        borrarSesion && borrarSesion();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMensaje({ tipo: "error", texto: "Error al cargar usuarios" });
      }
    }
  }

  function abrirCrear() {
    setModo("crear");
    setUsuarioSeleccionado(null);
    reset({
      nombreCompleto: "",
      cedulaUsuario: "",
      emailUsuario: "",
      passwordUsuario: "",
      idRol: "",
      activoUsuario: true
    });
    clearErrors();
    setMensaje(null);
  }

  function abrirActualizar(usuario) {
    setModo("actualizar");
    setUsuarioSeleccionado(usuario);
    reset({
      nombreCompleto: usuario.nombreCompleto,
      cedulaUsuario: usuario.cedulaUsuario,
      emailUsuario: usuario.emailUsuario,
      idRol: usuario.rol?.idRol,
      activoUsuario: usuario.activoUsuario,
    });
  }
  const abrirVer = usuario => {
    setModo("ver");
    setUsuarioSeleccionado(usuario);
  };

  const columnas = [
    {
      name: "ID",
      selector: fila => fila.idUsuario,
      sortable: true,
      width: "80px",
    },
    {
      name: "Cédula",
      selector: fila => fila.cedulaUsuario,
      sortable: true,
    },
    {
      name: "Nombre",
      selector: fila => fila.nombreCompleto,
      sortable: true,
    },
    {
      name: "Rol",
      cell: fila => (
        <span className={clsx("px-2 py-1 rounded text-white", {
          "bg-blue-500": fila.rol?.nombreRol === "Administrador",
          "bg-yellow-500": fila.rol?.nombreRol === "Bodeguero",
          "bg-green-500": fila.rol?.nombreRol === "Cajero",
        })}>{fila.rol?.nombreRol}</span>
      ),
      sortable: true,
    },
    {
      name: "Estado",
      cell: fila => fila.activoUsuario
        ? <span className="text-green-600 font-semibold">Activo</span>
        : <span className="text-red-600 font-semibold">Inactivo</span>,
      sortable: true,
    },
    {
      name: "Ver",
      cell: fila => (
        <button
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200 transition font-semibold shadow-sm mx-auto"
          title="Ver usuario"
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
          title="Actualizar usuario"
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
            fila.activoUsuario
              ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
              : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
          )}
          title="Deshabilitar usuario"
          onClick={fila.activoUsuario ? async () => {
            try {
              await deshabilitarUsuarioServicio(fila.idUsuario);
              setMensaje({ tipo: "exito", texto: `Usuario ${fila.cedulaUsuario} deshabilitado correctamente` });
              await obtenerUsuarios();
              setModo("lista");
            } catch {
              setMensaje({ tipo: "error", texto: "Error al deshabilitar usuario" });
            }
          } : undefined}
          disabled={!fila.activoUsuario}
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
      <h1 className="text-3xl font-bold mb-4 text-center">Gestión Usuarios</h1>
      {mensaje && (() => {
        // Cerrar sesión si el mensaje es de token inválido o expirado
        const texto = typeof mensaje.texto === "string"
          ? mensaje.texto
          : Array.isArray(mensaje.texto)
            ? mensaje.texto.map((t, i) => typeof t === "string" ? t : JSON.stringify(t)).join(" | ")
            : typeof mensaje.texto === "object" && mensaje.texto?.msg
              ? mensaje.texto.msg
              : JSON.stringify(mensaje.texto);
        if (texto.startsWith("Token inválido") || texto.startsWith("Token expirado")) {
          setMensaje({ tipo: "error", texto: "Token inválido o expirado. Cerrando sesión..." });
          borrarSesion && borrarSesion();
          setTimeout(() => {
            window.location.href = '/login';
          }, 1800);
        }
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
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={abrirCrear}>Crear Usuario</button>
            <input type="text" placeholder="Buscar por cédula o nombre" value={filtro} onChange={e => setFiltro(e.target.value)} className="border rounded px-2 py-1 w-96" autoFocus />
          </div>
          <div className="flex-grow">
            {usuariosFiltrados.length === 0 ? (
              <p className="text-center mt-10 font-semibold text-gray-500">No se encontraron usuarios</p>
            ) : (
              <div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                <DataTable
                  columns={columnas}
                  data={usuariosFiltrados}
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
                  noDataComponent={<span className="text-gray-500">No hay usuarios</span>}
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
            // Construir payload para crear usuario
            const payload = {
              nombreCompleto: datos.nombreCompleto,
              cedulaUsuario: datos.cedulaUsuario,
              emailUsuario: datos.emailUsuario,
              // En creación, la contraseña será la cédula
              passwordUsuario: datos.cedulaUsuario,
              idRol: Number(datos.idRol),
            };
            const resp = await crearUsuarioServicio(payload);
            if (!resp.success) {
              setMensaje({ tipo: "error", texto: resp.message || resp.detail || "Error al crear usuario" });
              return;
            }
            setMensaje({ tipo: "exito", texto: `Usuario ${payload.cedulaUsuario} creado correctamente` });
            await obtenerUsuarios();
            setModo("lista");
          } catch (e) {
            console.error("Error al crear usuario:", e);
            let texto = "Error al crear usuario";
            if (e && e.response && e.response.data) {
                
              if (e.response.data.message) {
                texto = e.response.data.message;
              } else if (e.response.data.detail) {
                texto = e.response.data.detail;
              }
            }
            setMensaje({ tipo: "error", texto });
          }
        } : async datos => {
          try {
            // Construir payload para actualizar usuario
            const payload = {
              idRol: Number(datos.idRol),
              nombreCompleto: datos.nombreCompleto,
              emailUsuario: datos.emailUsuario,
              activoUsuario: datos.activoUsuario ?? true,
            };
            if (datos.passwordUsuario && datos.passwordUsuario.length >= 8) {
              payload.passwordUsuario = datos.passwordUsuario;
            }
            const resp = await actualizarUsuarioServicio(usuarioSeleccionado.idUsuario, payload);
            if (!resp.success) {
              setMensaje({ tipo: "error", texto: resp.message || resp.detail || "Error al actualizar usuario" });
              return;
            }
            setMensaje({ tipo: "exito", texto: `Usuario ${payload.nombreCompleto} actualizado correctamente` });
            await obtenerUsuarios();
            setModo("lista");
          } catch (e) {
            let texto = "Error al actualizar usuario";
            if (e && e.response) {
              const data = e.response.data;
              if (typeof data === "string") {
                texto = data;
              } else if (data?.message) {
                texto = data.message;
              } else if (data?.detail) {
                texto = data.detail;
              } else if (Array.isArray(data)) {
                // Si es un array de errores, concatenar los mensajes
                texto = data.map(err => err.msg || JSON.stringify(err)).join(" | ");
              } else if (typeof data === "object" && data?.msg) {
                texto = data.msg;
              } else {
                texto = JSON.stringify(data);
              }
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
            <h2 className="text-2xl font-semibold flex-1">{modo === "crear" ? "Crear Usuario" : "Actualizar Usuario"}</h2>
          </div>
          <label className="font-medium">Nombre Completo</label>
          <input
            {...register("nombreCompleto", {
              required: "Nombre requerido",
              minLength: { value: 3, message: "Mínimo 3 caracteres" },
              maxLength: { value: 50, message: "Máximo 50 caracteres" },
            })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.nombreCompleto })}
            type="text"
            autoFocus
          />
          {errors.nombreCompleto && <p className="text-red-600 text-sm">{errors.nombreCompleto.message}</p>}
          <label className="font-medium">Cédula Usuario</label>
          {modo === "crear" ? (
            <input
              {...register("cedulaUsuario", {
                required: "Cédula requerida",
                minLength: { value: 10, message: "Debe tener 10 dígitos" },
                maxLength: { value: 10, message: "Debe tener 10 dígitos" },
                pattern: { value: /^[0-9]+$/, message: "Solo números" },
              })}
              className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.cedulaUsuario })}
              type="text"
            />
          ) : (
            <input
              {...register("cedulaUsuario")}
              className="border rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              type="text"
              disabled
            />
          )}
          {modo === "crear" && errors.cedulaUsuario && <p className="text-red-600 text-sm">{errors.cedulaUsuario.message}</p>}
          <label className="font-medium">Email</label>
          <input
            {...register("emailUsuario", {
              required: "Email requerido",
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: "Email inválido"
              }
            })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.emailUsuario })}
            type="email"
          />
          {errors.emailUsuario && <p className="text-red-600 text-sm">{errors.emailUsuario.message}</p>}
          {/* Solo mostrar campo contraseña en actualizar */}
          {modo === "actualizar" && (
            <>
              <label className="font-medium">Contraseña</label>
              <CampoContrasenaValidado 
                registrar={register}
                nombre="passwordUsuario"
                marcador={"Dejar vacío para no cambiar"}
                error={errors.passwordUsuario}
                modo={modo}
                setError={setError}
                clearErrors={clearErrors}
              />
            </>
          )}
          <label className="font-medium">Rol</label>
          <select
            {...register("idRol", {
              required: "Rol requerido",
              validate: value => ["1", "2", "3", 1, 2, 3].includes(value) || "Rol inválido"
            })}
            className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.idRol })}
          >
            <option value="">Seleccione...</option>
            <option value="1">Administrador</option>
            <option value="2">Bodeguero</option>
            <option value="3">Cajero</option>
          </select>
          {errors.idRol && <p className="text-red-600 text-sm">{errors.idRol.message}</p>}
          {modo === "actualizar" && (
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" {...register("activoUsuario")} id="activoUsuario" className="w-4 h-4" />
              <label htmlFor="activoUsuario" className="select-none">Activo</label>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setModo("lista")} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{modo === "crear" ? "Guardar" : "Actualizar"}</button>
          </div>
        </form>
      )}
      {modo === "ver" && usuarioSeleccionado && (
        <section className="w-full max-w-2xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200" style={{ marginTop: 24 }}>
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Resumen de Usuario</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Nombre Completo</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{usuarioSeleccionado.nombreCompleto}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Cédula Usuario</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{usuarioSeleccionado.cedulaUsuario}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Email</p>
              <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{usuarioSeleccionado.emailUsuario}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Rol</p>
              <div className={clsx("text-lg font-semibold rounded px-3 py-2 border border-gray-200", usuarioSeleccionado.rol?.nombreRol === "Administrador" ? "bg-blue-100 text-blue-800" : usuarioSeleccionado.rol?.nombreRol === "Bodeguero" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800")}>{usuarioSeleccionado.rol?.nombreRol}</div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Estado</p>
              <div className={clsx("text-lg font-semibold rounded px-3 py-2 border border-gray-200", usuarioSeleccionado.activoUsuario ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{usuarioSeleccionado.activoUsuario ? "Activo" : "Inactivo"}</div>
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