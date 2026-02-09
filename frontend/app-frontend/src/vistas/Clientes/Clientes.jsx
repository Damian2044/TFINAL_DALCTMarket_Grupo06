import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
	obtenerClientesServicio,
	crearClienteServicio,
	actualizarClienteServicio,
	deshabilitarClienteServicio
} from "../../servicios/serviciosClientes";

export default function Clientes() {
	const [mensaje, setMensaje] = useState(null);
	const mensajeRef = useRef(null);
	const [modo, setModo] = useState("lista");
	const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
	const [clientes, setClientes] = useState([]);
	const [filtro, setFiltro] = useState("");

	const { register, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm();

	// Filtrado y orden por ID descendente
	const clientesFiltrados = clientes
		.filter(c =>
			c.cedulaCliente?.toLowerCase().includes(filtro.toLowerCase()) ||
			c.nombreCliente?.toLowerCase().includes(filtro.toLowerCase())
		)
		.sort((a, b) => b.idCliente - a.idCliente);

	useEffect(() => {
		obtenerClientes();
		const intervalo = setInterval(() => {
			obtenerClientes();
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

	async function obtenerClientes() {
		try {
			const resp = await obtenerClientesServicio();
			if (resp && Array.isArray(resp.data)) {
				setClientes(resp.data);
			} else if (Array.isArray(resp)) {
				setClientes(resp);
			} else {
				setClientes([]);
			}
		} catch (error) {
			setClientes([]);
			setMensaje({ tipo: "error", texto: error?.response?.data?.message || "Error al cargar clientes" });
		}
	}

	function abrirCrear() {
		setModo("crear");
		setClienteSeleccionado(null);
		reset({
			nombreCliente: "",
			cedulaCliente: "",
			telefonoCliente: "",
			direccionCliente: "",
			emailCliente: "",
			activoCliente: true
		});
		clearErrors();
		setMensaje(null);
	}

	function abrirActualizar(cliente) {
		setModo("actualizar");
		setClienteSeleccionado(cliente);
		reset({
			nombreCliente: cliente.nombreCliente,
			cedulaCliente: cliente.cedulaCliente,
			telefonoCliente: cliente.telefonoCliente,
			direccionCliente: cliente.direccionCliente,
			emailCliente: cliente.emailCliente,
			activoCliente: cliente.activoCliente,
		});
	}
	const abrirVer = cliente => {
		setModo("ver");
		setClienteSeleccionado(cliente);
	};

	const columnas = [
		{
			name: "ID",
			selector: fila => fila.idCliente,
			sortable: true,
			width: "80px",
		},
		{
			name: "Cédula",
			selector: fila => fila.cedulaCliente,
			sortable: true,
		},
		{
			name: "Nombre",
			selector: fila => fila.nombreCliente,
			sortable: true,
		},
		{
			name: "Estado",
			cell: fila => fila.activoCliente
				? <span className="text-green-600 font-semibold">Activo</span>
				: <span className="text-red-600 font-semibold">Inactivo</span>,
			sortable: true,
		},
		{
			name: "Ver",
			cell: fila => (
				<button
					className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200 transition font-semibold shadow-sm mx-auto"
					title="Ver cliente"
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
					title="Actualizar cliente"
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
						fila.activoCliente
							? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
							: "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
					)}
					title="Deshabilitar cliente"
					onClick={fila.activoCliente ? async () => {
						try {
							await deshabilitarClienteServicio(fila.idCliente);
							setMensaje({ tipo: "exito", texto: `Cliente ${fila.cedulaCliente} deshabilitado correctamente` });
							await obtenerClientes();
							setModo("lista");
						} catch (e) {
							setMensaje({ tipo: "error", texto: e?.response?.data?.message || "Error al deshabilitar cliente" });
						}
					} : undefined}
					disabled={!fila.activoCliente}
					style={{ minWidth: 36, minHeight: 28, height: 28, fontSize: '0.93rem', padding: '0.25rem 0.5rem' }}
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			),
			ignoreRowClick: true,
			button: true,
		},
	];

	// Validaciones según esquema
	function validarCliente(datos) {
		if (!/^[0-9]{10}$/.test(datos.cedulaCliente)) return "Cédula debe tener 10 dígitos numéricos";
		if (!datos.nombreCliente || datos.nombreCliente.length < 3) return "Nombre mínimo 3 caracteres";
		if (!datos.direccionCliente || datos.direccionCliente.length < 3) return "Dirección requerida";
		if (!/^[0-9]{10}$/.test(datos.telefonoCliente)) return "Teléfono debe tener 10 dígitos";
		if (!/^\S+@\S+\.\S+$/.test(datos.emailCliente)) return "Email inválido";
		return null;
	}

	// Crear o actualizar cliente
	async function onSubmit(datos) {
		const errorValidacion = validarCliente(datos);
		if (errorValidacion) {
			setError("cedulaCliente", { type: "manual", message: errorValidacion });
			setMensaje({ tipo: "error", texto: errorValidacion });
			return;
		}
		try {
			let resp;
			if (modo === "crear") {
				resp = await crearClienteServicio(datos);
			} else {
				resp = await actualizarClienteServicio(clienteSeleccionado.idCliente, datos);
			}
			if (!resp.success) {
				setMensaje({ tipo: "error", texto: resp.message || "Error en la operación" });
				return;
			}
			setMensaje({ tipo: "exito", texto: resp.message || "Operación exitosa" });
			await obtenerClientes();
			setModo("lista");
		} catch (e) {
			let texto = "Error en la operación";
			if (e && e.response && e.response.data) {
				if (e.response.data.message) texto = e.response.data.message;
				else if (typeof e.response.data === "string") texto = e.response.data;
			}
			setMensaje({ tipo: "error", texto });
		}
	}

	return (
		<main className="flex flex-col h-full w-full p-4">
			<h1 className="text-3xl font-bold mb-4 text-center">Gestión Clientes</h1>
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
						<button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={abrirCrear}>Crear Cliente</button>
						<input type="text" placeholder="Buscar por cédula o nombre" value={filtro} onChange={e => setFiltro(e.target.value)} className="border rounded px-2 py-1 w-96" autoFocus />
					</div>
					<div className="flex-grow">
						{clientesFiltrados.length === 0 ? (
							<p className="text-center mt-10 font-semibold text-gray-500">No se encontraron clientes</p>
						) : (
							<div className="bg-white w-full" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
								<DataTable
									columns={columnas}
									data={clientesFiltrados}
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
									noDataComponent={<span className="text-gray-500">No hay clientes</span>}
									responsive
								/>
							</div>
						)}
					</div>
				</>
			)}
			{(modo === "crear" || modo === "actualizar") && (
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
						<h2 className="text-2xl font-semibold flex-1">{modo === "crear" ? "Crear Cliente" : "Actualizar Cliente"}</h2>
					</div>
					<label className="font-medium">Nombre</label>
					<input
						{...register("nombreCliente", {
							required: "Nombre requerido",
							minLength: { value: 3, message: "Mínimo 3 caracteres" },
							maxLength: { value: 50, message: "Máximo 50 caracteres" },
						})}
						className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.nombreCliente })}
						type="text"
						autoFocus
					/>
					{errors.nombreCliente && <p className="text-red-600 text-sm">{errors.nombreCliente.message}</p>}
					<label className="font-medium">Cédula</label>
					<input
						{...register("cedulaCliente", {
							required: "Cédula requerida",
							minLength: { value: 10, message: "Debe tener 10 dígitos" },
							maxLength: { value: 10, message: "Debe tener 10 dígitos" },
							pattern: { value: /^[0-9]+$/, message: "Solo números" },
						})}
						className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.cedulaCliente })}
						type="text"
						disabled={modo === "actualizar"}
					/>
					{errors.cedulaCliente && <p className="text-red-600 text-sm">{errors.cedulaCliente.message}</p>}
					<label className="font-medium">Dirección</label>
					<input
						{...register("direccionCliente", {
							required: "Dirección requerida",
							minLength: { value: 3, message: "Mínimo 3 caracteres" },
							maxLength: { value: 100, message: "Máximo 100 caracteres" },
						})}
						className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.direccionCliente })}
						type="text"
					/>
					{errors.direccionCliente && <p className="text-red-600 text-sm">{errors.direccionCliente.message}</p>}
					<label className="font-medium">Teléfono</label>
					<input
						{...register("telefonoCliente", {
							required: "Teléfono requerido",
							minLength: { value: 10, message: "Debe tener 10 dígitos" },
							maxLength: { value: 10, message: "Debe tener 10 dígitos" },
							pattern: { value: /^[0-9]+$/, message: "Solo números" },
						})}
						className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.telefonoCliente })}
						type="text"
					/>
					{errors.telefonoCliente && <p className="text-red-600 text-sm">{errors.telefonoCliente.message}</p>}
					<label className="font-medium">Email</label>
					<input
						{...register("emailCliente", {
							required: "Email requerido",
							pattern: {
								value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
								message: "Email inválido"
							}
						})}
						className={clsx("border rounded px-3 py-2", { "border-red-600 bg-red-50": errors.emailCliente })}
						type="email"
					/>
					{errors.emailCliente && <p className="text-red-600 text-sm">{errors.emailCliente.message}</p>}
					{modo === "actualizar" && (
						<div className="flex items-center gap-2 mt-2">
							<input type="checkbox" {...register("activoCliente")} id="activoCliente" className="w-4 h-4" />
							<label htmlFor="activoCliente" className="select-none">Activo</label>
						</div>
					)}
					<div className="flex justify-end gap-2 mt-4">
						<button type="button" onClick={() => setModo("lista")} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancelar</button>
						<button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{modo === "crear" ? "Guardar" : "Actualizar"}</button>
					</div>
				</form>
			)}
			{modo === "ver" && clienteSeleccionado && (
				<section className="w-full max-w-2xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200" style={{ marginTop: 24 }}>
					<h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Resumen de Cliente</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
						<div>
							<p className="text-gray-600 text-sm mb-1">Nombre</p>
							<div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{clienteSeleccionado.nombreCliente}</div>
						</div>
						<div>
							<p className="text-gray-600 text-sm mb-1">Cédula</p>
							<div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{clienteSeleccionado.cedulaCliente}</div>
						</div>
						<div>
							<p className="text-gray-600 text-sm mb-1">Dirección</p>
							<div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{clienteSeleccionado.direccionCliente}</div>
						</div>
						<div>
							<p className="text-gray-600 text-sm mb-1">Teléfono</p>
							<div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{clienteSeleccionado.telefonoCliente}</div>
						</div>
						<div>
							<p className="text-gray-600 text-sm mb-1">Email</p>
							<div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">{clienteSeleccionado.emailCliente}</div>
						</div>
						<div>
							<p className="text-gray-600 text-sm mb-1">Estado</p>
							<div className={clsx("text-lg font-semibold rounded px-3 py-2 border border-gray-200", clienteSeleccionado.activoCliente ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{clienteSeleccionado.activoCliente ? "Activo" : "Inactivo"}</div>
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