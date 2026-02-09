import { useEffect, useMemo, useState } from "react";
import {
  abrirCajaServicio,
  cerrarCajaServicio,
  listarCajasHoyServicio,
  listarTodasCajasServicio,
  reabrirCajaServicio,
} from "@/servicios/serviciosCaja";

const DENOMINACIONES = [
  { key: "c01", label: "Moneda 1", valor: 0.01 },
  { key: "c05", label: "Moneda 5", valor: 0.05 },
  { key: "c10", label: "Moneda 10", valor: 0.10 },
  { key: "c25", label: "Moneda 25", valor: 0.25 },
  { key: "c50", label: "Moneda 50", valor: 0.50 },
  { key: "m1", label: "Moneda $1", valor: 1.00 },
  { key: "b5", label: "Billete $5", valor: 5 },
  { key: "b10", label: "Billete $10", valor: 10 },
  { key: "b20", label: "Billete $20", valor: 20 },
  { key: "b50", label: "Billete $50", valor: 50 },
  { key: "b100", label: "Billete $100", valor: 100 },
];

const crearConteoInicial = () => DENOMINACIONES.reduce((acc, d) => {
  acc[d.key] = 0;
  return acc;
}, {});

export default function CajaVista({ usuario, onCerrar }) {
  const [conteo, setConteo] = useState(crearConteoInicial());
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [todasCajas, setTodasCajas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [vistaAdmin, setVistaAdmin] = useState("arqueo");

  const esAdmin = usuario?.rol === "Administrador";

  const total = useMemo(() => {
    return DENOMINACIONES.reduce((acc, d) => acc + (Number(conteo[d.key] || 0) * d.valor), 0);
  }, [conteo]);

  const cargarCajasHoy = async () => {
    try {
      const resp = await listarCajasHoyServicio();
      const data = resp?.data || [];
      const idUsuario = usuario?.idUsuario;
      const cajasUsuario = (data || []).filter(c => (c?.usuario?.idUsuario === idUsuario));
      const abierta = cajasUsuario.find(c => c.estadoCaja === "ABIERTA") || null;
      setCajaAbierta(abierta);
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo cargar el estado de caja" });
      setCajaAbierta(null);
    }
  };

  const cargarTodasCajas = async () => {
    if (!esAdmin) return;
    try {
      const resp = await listarTodasCajasServicio();
      setTodasCajas(Array.isArray(resp?.data) ? resp.data : []);
    } catch {
      setTodasCajas([]);
      setMensaje({ tipo: "error", texto: "No se pudo cargar todas las cajas" });
    }
  };

  useEffect(() => {
    setMensaje(null);
    setConteo(crearConteoInicial());
    cargarCajasHoy();
    cargarTodasCajas();
    const intervalo = setInterval(() => {
      cargarCajasHoy();
      cargarTodasCajas();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (esAdmin && vistaAdmin === "cajas") {
      cargarTodasCajas();
    }
  }, [vistaAdmin, esAdmin]);

  useEffect(() => {
    const onFocus = () => {
      cargarCajasHoy();
      cargarTodasCajas();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(null), 3500);
    return () => clearTimeout(timer);
  }, [mensaje]);

  const actualizarCantidad = (key, valor) => {
    const n = Number(valor);
    if (Number.isNaN(n) || n < 0) return;
    setConteo(prev => ({ ...prev, [key]: Math.floor(n) }));
  };

  const abrirCaja = async () => {
    setCargando(true);
    try {
      const resp = await abrirCajaServicio({ montoInicial: Number(total.toFixed(2)) });
      if (!resp?.success) {
        setMensaje({ tipo: "error", texto: resp?.message || "No se pudo abrir caja" });
        return;
      }
      setMensaje({ tipo: "exito", texto: resp?.message || "Caja abierta" });
      await cargarCajasHoy();
      await cargarTodasCajas();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail;
      setMensaje({ tipo: "error", texto: msg || "No se pudo abrir caja" });
    } finally {
      setCargando(false);
    }
  };

  const cerrarCaja = async () => {
    if (!cajaAbierta?.idCaja) return;
    setCargando(true);
    try {
      const resp = await cerrarCajaServicio(cajaAbierta.idCaja, { montoFinal: Number(total.toFixed(2)) });
      if (!resp?.success) {
        setMensaje({ tipo: "error", texto: resp?.message || "No se pudo cerrar caja" });
        return;
      }
      setMensaje({ tipo: "exito", texto: resp?.message || "Caja cerrada" });
      await cargarCajasHoy();
      await cargarTodasCajas();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail;
      setMensaje({ tipo: "error", texto: msg || "No se pudo cerrar caja" });
    } finally {
      setCargando(false);
    }
  };

  const reabrirCaja = async (idCaja) => {
    if (!idCaja) return;
    setCargando(true);
    try {
      const resp = await reabrirCajaServicio(idCaja);
      if (!resp?.success) {
        setMensaje({ tipo: "error", texto: resp?.message || "No se pudo reabrir caja" });
        return;
      }
      setMensaje({ tipo: "exito", texto: resp?.message || "Caja reabierta" });
      await cargarCajasHoy();
      await cargarTodasCajas();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail;
      setMensaje({ tipo: "error", texto: msg || "No se pudo reabrir caja" });
    } finally {
      setCargando(false);
    }
  };

  const cajasFiltradas = useMemo(() => {
    if (!esAdmin) return [];
    const texto = filtro.toLowerCase().trim();
    if (!texto) return todasCajas;
    return (todasCajas || []).filter(c => {
      const usuarioNombre = c?.usuario?.nombreCompleto || "";
      const cedula = c?.usuario?.cedulaUsuario || "";
      return `${usuarioNombre} ${cedula}`.toLowerCase().includes(texto);
    });
  }, [todasCajas, filtro, esAdmin]);

  return (
    <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <div className="flex items-center mb-3">
        <button
          type="button"
          onClick={onCerrar}
          className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow focus:outline-none"
          title="Regresar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold flex-1">Caja</h2>
      </div>

      {mensaje && (
        <div
          className={`p-2 mb-3 rounded text-white text-center font-semibold ${mensaje.tipo === "exito" ? "bg-green-600" : "bg-red-600"}`}
          role="alert"
        >
          {mensaje.texto}
        </div>
      )}

      {esAdmin && (
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            className={`px-3 py-1 rounded border ${vistaAdmin === "arqueo" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-300"}`}
            onClick={() => setVistaAdmin("arqueo")}
          >
            Arqueo Caja
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border ${vistaAdmin === "cajas" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-300"}`}
            onClick={() => setVistaAdmin("cajas")}
          >
            Cajas
          </button>
        </div>
      )}

      {(!esAdmin || vistaAdmin === "arqueo") && (
        <>
          <div className="text-sm text-gray-600 mb-3">
            Estado: <span className={cajaAbierta ? "text-emerald-700 font-semibold" : "text-gray-600"}>
              {cajaAbierta ? "ABIERTA" : "CERRADA"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DENOMINACIONES.map(d => (
              <div key={d.key} className="flex items-center justify-between border rounded px-3 py-2">
                <div className="font-medium">{d.label}</div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={conteo[d.key]}
                  onChange={e => actualizarCantidad(d.key, e.target.value)}
                  className="border rounded px-2 py-1 w-24 text-right"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-lg font-semibold">Total: ${Number(total || 0).toFixed(2)}</div>
            <button
              type="button"
              disabled={cargando}
              className={`px-4 py-2 rounded text-white ${cajaAbierta ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} ${cargando ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => (cajaAbierta ? cerrarCaja() : abrirCaja())}
            >
              {cajaAbierta ? "Cerrar caja" : "Abrir caja"}
            </button>
          </div>
        </>
      )}

      {esAdmin && vistaAdmin === "cajas" && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Todas las cajas</h3>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="border rounded px-2 py-1 w-64"
            />
          </div>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Usuario</th>
                  <th className="text-left p-2">Cédula</th>
                  <th className="text-left p-2">Apertura</th>
                  <th className="text-left p-2">Cierre</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-right p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cajasFiltradas.map(c => (
                  <tr key={c.idCaja} className="border-t">
                    <td className="p-2">{c.idCaja}</td>
                    <td className="p-2">{c?.usuario?.nombreCompleto || "-"}</td>
                    <td className="p-2">{c?.usuario?.cedulaUsuario || "-"}</td>
                    <td className="p-2">{c?.fechaAperturaCaja ? new Date(c.fechaAperturaCaja).toLocaleString() : "-"}</td>
                    <td className="p-2">{c?.fechaCierreCaja ? new Date(c.fechaCierreCaja).toLocaleString() : "-"}</td>
                    <td className="p-2">{c?.estadoCaja || "-"}</td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        disabled={c?.estadoCaja === "ABIERTA"}
                        className={`px-2 py-1 rounded text-white ${c?.estadoCaja === "ABIERTA" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        onClick={() => reabrirCaja(c.idCaja)}
                      >
                        Reabrir
                      </button>
                    </td>
                  </tr>
                ))}
                {cajasFiltradas.length === 0 && (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={7}>Sin resultados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
