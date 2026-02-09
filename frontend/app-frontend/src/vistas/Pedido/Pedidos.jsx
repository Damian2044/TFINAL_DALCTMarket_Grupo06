import { useContext, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { JwtContext } from "@/context/jwtContext";
import { FiClipboard, FiCheckCircle, FiPackage, FiClock } from "react-icons/fi";
import {
  obtenerPedidosServicio,
  obtenerPedidosPendientesServicio,
  crearPedidoServicio,
  revisarPedidoServicio,
  recepcionarDetallePedidoServicio,
} from "@/servicios/serviciosPedidos";
import { obtenerInventariosServicio } from "@/servicios/serviciosInventario";
import PedidoCrear from "@/vistas/Pedido/PedidoCrear.jsx";
import PedidoRevisar from "@/vistas/Pedido/PedidoRevisar.jsx";
import PedidoRecepcionar from "@/vistas/Pedido/PedidoRecepcionar.jsx";
import PedidoDetalle from "@/vistas/Pedido/PedidoDetalle.jsx";
import PedidoHistorial from "@/vistas/Pedido/PedidoHistorial.jsx";

export default function Pedidos() {
  const { usuario } = useContext(JwtContext);
  const rol = usuario?.rol || "";
  const esAdministrador = rol === "Administrador";

  const [mensaje, setMensaje] = useState(null);
  const mensajeRef = useRef(null);

  const [pedidos, setPedidos] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [inventarios, setInventarios] = useState([]);

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [seccion, setSeccion] = useState("crear");

  const mostrarMensaje = (tipo, texto) => setMensaje({ tipo, texto });

  const extraerMensajeError = (e, porDefecto) => {
    const data = e?.response?.data;
    if (!data) return porDefecto;
    if (typeof data === "string") return data;
    if (data?.message?.error && Array.isArray(data.message.error)) {
      return data.message.error.map(d => `Producto ${d.idProducto}: ${d.error}`).join(" | ");
    }
    if (data?.message) return typeof data.message === "string" ? data.message : JSON.stringify(data.message);
    if (data?.detail) return data.detail;
    if (Array.isArray(data)) return data.map(d => d.msg || JSON.stringify(d)).join(" | ");
    if (data?.msg) return data.msg;
    return JSON.stringify(data);
  };

  const cargarPedidos = async () => {
    try {
      const resp = await obtenerPedidosServicio();
      const data = resp?.data || resp;
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      setPedidos([]);
      mostrarMensaje("error", extraerMensajeError(e, "Error al cargar pedidos"));
    }
  };

  const cargarPendientes = async () => {
    if (!esAdministrador) return;
    try {
      const resp = await obtenerPedidosPendientesServicio();
      const data = resp?.data || resp;
      setPendientes(Array.isArray(data) ? data : []);
    } catch (e) {
      setPendientes([]);
      mostrarMensaje("error", extraerMensajeError(e, "Error al cargar pedidos pendientes"));
    }
  };

  const cargarInventarios = async () => {
    try {
      const resp = await obtenerInventariosServicio();
      const data = resp?.data || resp;
      setInventarios(Array.isArray(data) ? data : []);
    } catch {
      setInventarios([]);
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarPendientes();
    cargarInventarios();
    const intervalo = setInterval(() => {
      cargarPedidos();
      cargarPendientes();
      cargarInventarios();
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

  const productosActivos = useMemo(() => {
    return (inventarios || []).filter(i => i?.producto?.activoProducto);
  }, [inventarios]);

  const detallesPendientesRecepcion = useMemo(() => {
    const todos = [];
    (pedidos || []).forEach(p => {
      (p.detalles || []).forEach(d => {
        if (d.estadoDetalle === "PENDIENTE_RECEPCION") {
          todos.push({
            ...d,
            pedido: p,
          });
        }
      });
    });
    return todos;
  }, [pedidos]);

  const onCrearPedido = async (detalles, onReset) => {
    try {
      const payload = {
        detalles: detalles.map(d => ({
          idProducto: Number(d.idProducto),
          cantidadSolicitada: Number(d.cantidadSolicitada),
        })),
      };
      const resp = await crearPedidoServicio(payload);
      if (!resp?.success) {
        const msg = resp?.message?.error && Array.isArray(resp.message.error)
          ? resp.message.error.map(d => `Producto ${d.idProducto}: ${d.error}`).join(" | ")
          : resp?.message || "Error al crear pedido";
        mostrarMensaje("error", msg);
        return;
      }
      const idPedido = resp?.data?.idPedido || resp?.data?.data?.idPedido;
      if (idPedido) {
        mostrarMensaje("exito", `Pedido creado #${idPedido}`);
      } else {
        mostrarMensaje("exito", "Pedido creado");
      }
      onReset && onReset();
      await cargarPedidos();
      await cargarPendientes();
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al crear pedido"));
    }
  };

  const onRevisarPedido = async (idPedido, estadoPedido, observaciones) => {
    try {
      const payload = {
        estadoPedido,
        observaciones: observaciones || "",
      };
      const resp = await revisarPedidoServicio(idPedido, payload);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al revisar pedido");
        return;
      }
      mostrarMensaje("exito", `Pedido ${idPedido} ${estadoPedido === "APROBADO" ? "aprobado" : "rechazado"}`);
      await cargarPedidos();
      await cargarPendientes();
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al revisar pedido"));
    }
  };

  const onRecepcionarDetalle = async (detalle) => {
    const idDetalle = detalle?.idDetallePedido;
    const nombreProducto = detalle?.producto?.nombreProducto || "Producto";
    const cantidad = detalle?.cantidadSolicitada ?? "-";
    try {
      const resp = await recepcionarDetallePedidoServicio(idDetalle, { confirmar: true });
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al recepcionar detalle");
        return;
      }
      mostrarMensaje("exito", `Detalle ${idDetalle}: ${nombreProducto} x${cantidad} recepcionado`);
      await cargarPedidos();
      await cargarPendientes();
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al recepcionar detalle"));
    }
  };

  return (
    <main className="flex flex-col h-full w-full p-4 gap-4">
      <h1 className="text-3xl font-bold text-center">Pedidos y Compras</h1>

      {mensaje && (
        <div
          ref={mensajeRef}
          tabIndex={-1}
          className={clsx("p-3 rounded text-white text-center font-semibold outline-none", {
            "bg-green-600": mensaje.tipo === "exito",
            "bg-red-600": mensaje.tipo === "error",
          })}
          role="alert"
          aria-live="assertive"
        >
          {mensaje.texto}
        </div>
      )}

      <div className="flex justify-center gap-4 mb-2 flex-wrap">
        <button
          className={clsx("px-4 py-2 rounded flex items-center gap-2 border-2 font-semibold transition-all", {
            "bg-blue-600 text-white border-blue-600 shadow": seccion === "crear",
            "bg-blue-50 text-blue-700 border-blue-300": seccion !== "crear",
          })}
          onClick={() => setSeccion("crear")}
        >
          <FiClipboard size={18} />
          Crear Pedido
        </button>
        {esAdministrador && (
          <button
            className={clsx("px-4 py-2 rounded flex items-center gap-2 border-2 font-semibold transition-all", {
              "bg-amber-500 text-white border-amber-500 shadow": seccion === "revisar",
              "bg-amber-50 text-amber-700 border-amber-300": seccion !== "revisar",
            })}
            onClick={() => setSeccion("revisar")}
          >
            <FiCheckCircle size={18} />
            Revisar Pedidos
          </button>
        )}
        <button
          className={clsx("px-4 py-2 rounded flex items-center gap-2 border-2 font-semibold transition-all", {
            "bg-emerald-600 text-white border-emerald-600 shadow": seccion === "recepcionar",
            "bg-emerald-50 text-emerald-700 border-emerald-300": seccion !== "recepcionar",
          })}
          onClick={() => setSeccion("recepcionar")}
        >
          <FiPackage size={18} />
          Recepcionar Pedido
        </button>
        <button
          className={clsx("px-4 py-2 rounded flex items-center gap-2 border-2 font-semibold transition-all", {
            "bg-slate-700 text-white border-slate-700 shadow": seccion === "historial",
            "bg-slate-100 text-slate-700 border-slate-300": seccion !== "historial",
          })}
          onClick={() => setSeccion("historial")}
        >
          <FiClock size={18} />
          Historial de Pedidos
        </button>
      </div>

      {seccion === "crear" && (
        <PedidoCrear
          productosActivos={productosActivos}
          onCrearPedido={onCrearPedido}
        />
      )}

      {seccion === "revisar" && esAdministrador && (
        <PedidoRevisar
          pedidosPendientes={pendientes}
          onRevisarPedido={onRevisarPedido}
          onVerDetalle={setPedidoSeleccionado}
        />
      )}

      {seccion === "recepcionar" && (
        <PedidoRecepcionar
          detallesRecepcion={detallesPendientesRecepcion}
          onRecepcionarDetalle={onRecepcionarDetalle}
          onVerDetalle={(pedido) => setPedidoSeleccionado(pedido)}
        />
      )}

      {seccion === "historial" && (
        <PedidoHistorial
          pedidos={pedidos}
          onVerDetalle={setPedidoSeleccionado}
        />
      )}

      <PedidoDetalle
        pedido={pedidoSeleccionado}
        onCerrar={() => setPedidoSeleccionado(null)}
      />
    </main>
  );
}
