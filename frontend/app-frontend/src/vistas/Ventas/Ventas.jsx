import { useContext, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { JwtContext } from "@/context/jwtContext";
import {
  crearVentaServicio,
  obtenerVentasHoyServicio,
  obtenerHistoricoVentasServicio,
  anularVentaServicio,
  generarComprobanteVentaServicio,
} from "@/servicios/serviciosVentas";
import { obtenerInventariosServicio } from "@/servicios/serviciosInventario";
import { obtenerClientesServicio } from "@/servicios/serviciosClientes";
import { obtenerParametrosServicio } from "@/servicios/serviciosParametrosSistema";
import { obtenerPromocionAplicableServicio } from "@/servicios/serviciosPromociones";
import { mostrarComprobantePdf } from "@/componentes/comprobantePdf";
import VentasLista from "./VentasLista";
import VentasNueva from "./VentasNueva";
import CajaVista from "@/vistas/Caja/CajaVista.jsx";

function formatoComprobante(idVenta) {
  const numero = String(idVenta || 0).padStart(9, "0");
  return `001-001-${numero}`;
}

export default function Ventas() {
  const { usuario } = useContext(JwtContext);
  const rol = usuario?.rol || "";
  const esAdministrador = rol === "Administrador";

  const [mensaje, setMensaje] = useState(null);
  const mensajeRef = useRef(null);

  const [seccion, setSeccion] = useState("hoy");
  const [modo, setModo] = useState("lista");
  const [ventasHoy, setVentasHoy] = useState([]);
  const [ventasHistorico, setVentasHistorico] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [modalProductos, setModalProductos] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [descuentoGeneral, setDescuentoGeneral] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [porcentajeIva, setPorcentajeIva] = useState(15);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [parametrosDetalle, setParametrosDetalle] = useState([]);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarCaja, setMostrarCaja] = useState(false);
  const promoCacheRef = useRef({});
  const draftKey = "ventasDraftNueva";

  const mostrarMensaje = (tipo, texto) => setMensaje({ tipo, texto });

  const extraerMensajeError = (e, porDefecto) => {
    if (e?.response?.data) {
      const data = e.response.data;
      if (typeof data === "string") return data;
      if (data?.message) {
        if (typeof data.message === "string") return data.message;
        if (Array.isArray(data.message?.error)) {
          return data.message.error
            .map(err => {
              const id = err?.idProducto !== undefined ? `Producto ${err.idProducto}` : "Producto";
              const detalle = err?.error ? `: ${err.error}` : "";
              return `${id}${detalle}`;
            })
            .join(" | ");
        }
        return JSON.stringify(data.message);
      }
      if (data?.detail) return data.detail;
      if (Array.isArray(data)) return data.map(d => d.msg || JSON.stringify(d)).join(" | ");
      if (typeof data === "object" && data?.msg) return data.msg;
      return JSON.stringify(data);
    }
    return porDefecto;
  };

  const colorStock = (stock, minimo) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock <= minimo) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const cargarVentasHoy = async () => {
    try {
      const resp = await obtenerVentasHoyServicio();
      const data = resp?.data || resp;
      setVentasHoy(Array.isArray(data) ? data : []);
    } catch (e) {
      setVentasHoy([]);
      mostrarMensaje("error", extraerMensajeError(e, "Error al cargar ventas del día"));
    }
  };

  const cargarVentasHistorico = async () => {
    if (!esAdministrador) return;
    try {
      const resp = await obtenerHistoricoVentasServicio();
      const data = resp?.data || resp;
      setVentasHistorico(Array.isArray(data) ? data : []);
    } catch (e) {
      setVentasHistorico([]);
      mostrarMensaje("error", extraerMensajeError(e, "Error al cargar histórico de ventas"));
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

  const cargarClientes = async () => {
    try {
      const resp = await obtenerClientesServicio();
      const data = resp?.data || resp;
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setClientes([]);
    }
  };

  const cargarIva = async () => {
    try {
      const resp = await obtenerParametrosServicio();
      const data = resp?.data || resp;
      if (Array.isArray(data)) {
        const iva = data.find(p => p.claveParametro === "IVA");
        if (iva?.valorParametro !== undefined) {
          const valor = Number(iva.valorParametro);
          if (!Number.isNaN(valor)) setPorcentajeIva(valor);
        }
      }
    } catch {
      setPorcentajeIva(15);
    }
  };

  useEffect(() => {
    try {
      // Reiniciar borrador al entrar a la vista
      sessionStorage.removeItem(draftKey);
    } catch {
      // ignore draft reset errors
    }
    cargarVentasHoy();
    cargarVentasHistorico();
    cargarInventarios();
    cargarClientes();
    cargarIva();
    const intervalo = setInterval(() => {
      cargarVentasHoy();
      cargarVentasHistorico();
      if (modalProductos) cargarInventarios();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [modalProductos]);

  useEffect(() => {
    const data = {
      clienteSeleccionado,
      productosSeleccionados,
      metodoPago,
      descuentoGeneral,
    };
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(data));
    } catch {
      // ignore draft save errors
    }
  }, [clienteSeleccionado, productosSeleccionados, metodoPago, descuentoGeneral]);

  useEffect(() => {
    if (mensaje && mensajeRef.current) mensajeRef.current.focus();
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const inventariosActivos = useMemo(() => {
    return (inventarios || []).filter(i => i?.producto?.activoProducto);
  }, [inventarios]);

  const ventasFiltradas = useMemo(() => {
    const lista = seccion === "historico" ? ventasHistorico : ventasHoy;
    const texto = filtro.toLowerCase();
    return (lista || []).filter(v => {
      const comprobante = formatoComprobante(v.idVenta || 0);
      const vendedor = v.usuario?.nombreCompleto || "";
      const estado = v.estadoVenta || "";
      return `${comprobante} ${vendedor} ${estado}`.toLowerCase().includes(texto);
    });
  }, [ventasHoy, ventasHistorico, seccion, filtro]);

  const cargarPromo = async (idProducto) => {
    if (!idProducto || promoCacheRef.current[idProducto] !== undefined) return;
    try {
      const resp = await obtenerPromocionAplicableServicio(idProducto);
      const data = resp?.data || resp;
      const porcentaje = data?.porcentajePromocion ?? data?.porcentaje_promocion;
      const promo = porcentaje !== undefined && porcentaje !== null ? Number(porcentaje) || 0 : 0;
      promoCacheRef.current[idProducto] = promo;
      setProductosSeleccionados(prev =>
        prev.map(p => String(p.idProducto) === String(idProducto) ? { ...p, porcentajePromocion: promo } : p)
      );
    } catch {
      promoCacheRef.current[idProducto] = 0;
    }
  };

  const agregarProducto = (inv) => {
    const idProducto = inv?.producto?.idProducto;
    if (!idProducto) return;
    const existe = productosSeleccionados.find(p => String(p.idProducto) === String(idProducto));
    if (existe) {
      setProductosSeleccionados(prev =>
        prev.map(p => {
          if (String(p.idProducto) !== String(idProducto)) return p;
          const limite = Number(p.stock || 0);
          const nuevaCantidad = Math.min((p.cantidadComprada || 0) + 1, limite);
          return { ...p, cantidadComprada: nuevaCantidad };
        })
      );
      return;
    }
    const promo = promoCacheRef.current[idProducto] ?? 0;
    setProductosSeleccionados(prev => [
      ...prev,
      {
        idProducto,
        nombreProducto: inv.producto?.nombreProducto || "-",
        precioUnitarioVenta: Number(inv.producto?.precioUnitarioVenta ?? 0),
        tieneIva: !!inv.producto?.tieneIva,
        stock: Number(inv.cantidadDisponible ?? 0),
        cantidadMinima: Number(inv.cantidadMinima ?? 0),
        cantidadComprada: 1,
        porcentajePromocion: promo,
      },
    ]);
    if (promoCacheRef.current[idProducto] === undefined) {
      cargarPromo(idProducto);
    }
  };

  const eliminarProducto = (idProducto) => {
    setProductosSeleccionados(prev => prev.filter(p => String(p.idProducto) !== String(idProducto)));
  };

  const cambiarCantidad = (idProducto, nuevaCantidad) => {
    if (!nuevaCantidad || nuevaCantidad < 1) return;
    setProductosSeleccionados(prev =>
      prev.map(p => {
        if (String(p.idProducto) !== String(idProducto)) return p;
        const limite = Number(p.stock || 0);
        const cantidad = Math.min(nuevaCantidad, limite);
        return { ...p, cantidadComprada: cantidad };
      })
    );
  };

  const subtotalVenta = useMemo(() => {
    return productosSeleccionados.reduce((acc, p) => acc + (p.precioUnitarioVenta * p.cantidadComprada), 0);
  }, [productosSeleccionados]);

  const totalDescuentoPromos = useMemo(() => {
    return productosSeleccionados.reduce((acc, p) => {
      const bruto = p.precioUnitarioVenta * p.cantidadComprada;
      const promo = Number(p.porcentajePromocion || 0) / 100;
      return acc + (bruto * promo);
    }, 0);
  }, [productosSeleccionados]);

  const totalDescuentoGeneral = useMemo(() => {
    const porcentaje = Number(descuentoGeneral || 0) / 100;
    return productosSeleccionados.reduce((acc, p) => {
      const bruto = p.precioUnitarioVenta * p.cantidadComprada;
      const promo = Number(p.porcentajePromocion || 0) / 100;
      const netoPromo = bruto - (bruto * promo);
      return acc + (netoPromo * porcentaje);
    }, 0);
  }, [productosSeleccionados, descuentoGeneral]);

  const totalDescuento = useMemo(() => +(totalDescuentoPromos + totalDescuentoGeneral).toFixed(2), [totalDescuentoPromos, totalDescuentoGeneral]);

  const totalNeto = useMemo(() => {
    const porcentaje = Number(descuentoGeneral || 0) / 100;
    return productosSeleccionados.reduce((acc, p) => {
      const bruto = p.precioUnitarioVenta * p.cantidadComprada;
      const promo = Number(p.porcentajePromocion || 0) / 100;
      const netoPromo = bruto - (bruto * promo);
      const neto = netoPromo - (netoPromo * porcentaje);
      return acc + neto;
    }, 0);
  }, [productosSeleccionados, descuentoGeneral]);

  const baseIVA = useMemo(() => {
    const porcentaje = Number(descuentoGeneral || 0) / 100;
    return productosSeleccionados.reduce((acc, p) => {
      if (!p.tieneIva) return acc;
      const bruto = p.precioUnitarioVenta * p.cantidadComprada;
      const promo = Number(p.porcentajePromocion || 0) / 100;
      const netoPromo = bruto - (bruto * promo);
      const neto = netoPromo - (netoPromo * porcentaje);
      return acc + neto;
    }, 0);
  }, [productosSeleccionados, descuentoGeneral]);

  const totalIVA = useMemo(() => +(baseIVA * (Number(porcentajeIva || 0) / 100)).toFixed(2), [baseIVA, porcentajeIva]);

  const totalPagar = useMemo(() => +(totalNeto + totalIVA).toFixed(2), [totalNeto, totalIVA]);

  const resetearVenta = () => {
    setProductosSeleccionados([]);
    setDescuentoGeneral(0);
    setClienteSeleccionado(null);
    setBusquedaCliente("");
    setMetodoPago("Efectivo");
    try { sessionStorage.removeItem(draftKey); } catch {}
  };

  const crearVenta = async () => {
    if (!clienteSeleccionado?.idCliente) {
      mostrarMensaje("error", "Selecciona un cliente");
      return;
    }
    if (productosSeleccionados.length === 0) {
      mostrarMensaje("error", "Agrega al menos un producto");
      return;
    }
    try {
      const payload = {
        descuentoGeneral: Number(descuentoGeneral || 0),
        idCliente: Number(clienteSeleccionado.idCliente),
        metodoPago,
        detalles: productosSeleccionados.map(p => ({
          idProducto: p.idProducto,
          cantidadComprada: p.cantidadComprada,
        })),
      };
      const resp = await crearVentaServicio(payload);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al crear venta");
        return;
      }
      const idVenta = resp?.data?.idVenta || resp?.idVenta;
      mostrarMensaje("exito", `Venta creada. Comprobante: ${formatoComprobante(idVenta)}`);
      if (idVenta) {
        try {
          const respComp = await generarComprobanteVentaServicio(idVenta);
          if (respComp?.success) mostrarComprobantePdf(respComp?.data || respComp);
        } catch {
          // ignorar si falla imprimir
        }
      }
      resetearVenta();
      await cargarVentasHoy();
      if (esAdministrador) await cargarVentasHistorico();
      setSeccion("hoy");
      setModo("lista");
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al crear venta"));
    }
  };

  const verComprobante = async (venta) => {
    try {
      const resp = await generarComprobanteVentaServicio(venta.idVenta);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al generar comprobante");
        return;
      }
      mostrarComprobantePdf(resp?.data || resp);
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al generar comprobante"));
    }
  };

  const verDetalleVenta = async (venta) => {
    try {
      const resp = await generarComprobanteVentaServicio(venta.idVenta);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "Error al cargar detalle");
        return;
      }
      const data = resp?.data || {};
      setParametrosDetalle(Array.isArray(data.parametros) ? data.parametros : []);
      setVentaDetalle(data.venta || null);
      setMostrarDetalle(true);
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "Error al cargar detalle"));
    }
  };

  const anularVenta = async (venta) => {
    try {
      const resp = await anularVentaServicio(venta.idVenta);
      if (!resp?.success) {
        mostrarMensaje("error", resp?.message || "No se pudo anular");
        return;
      }
      mostrarMensaje("exito", `Venta ${formatoComprobante(venta.idVenta)} anulada`);
      await cargarVentasHoy();
      if (esAdministrador) await cargarVentasHistorico();
    } catch (e) {
      mostrarMensaje("error", extraerMensajeError(e, "No se pudo anular"));
    }
  };

  const columnasVentas = [
    {
      name: "Comprobante",
      selector: row => formatoComprobante(row.idVenta),
      sortable: true,
      width: "190px",
      wrap: true,
    },
    {
      name: "Fecha",
      selector: row => row.fechaVenta ? new Date(row.fechaVenta).toLocaleString() : "-",
      sortable: true,
    },
    {
      name: "Vendedor",
      selector: row => row.usuario?.nombreCompleto || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Total",
      cell: row => `$${Number(row.totalPagar || 0).toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Estado",
      cell: row => (
        <span className={clsx("font-semibold px-2 py-1 rounded", {
          "bg-green-100 text-green-800": row.estadoVenta === "COMPLETADA",
          "bg-red-100 text-red-800": row.estadoVenta === "ANULADA",
        })}>
          {row.estadoVenta}
        </span>
      ),
      sortable: true,
    },
    {
      name: "PDF",
      cell: row => (
        <button
          className="bg-gray-300 px-3 py-1 rounded shadow hover:bg-gray-400"
          onClick={() => verComprobante(row)}
        >
          PDF
        </button>
      ),
      ignoreRowClick: true,
      button: true,
    },
    {
      name: "Ver",
      cell: row => (
        <button
          className="bg-blue-500 px-3 py-1 rounded shadow hover:bg-blue-600 text-white"
          onClick={() => verDetalleVenta(row)}
        >
          Ver
        </button>
      ),
      ignoreRowClick: true,
      button: true,
    },
    {
      name: "Anular",
      cell: row => (
        row.estadoVenta === "ANULADA" ? (
          <button
            className="bg-gray-300 px-3 py-1 rounded text-gray-400 cursor-not-allowed"
            disabled
            style={{ minWidth: 90 }}
          >
            Anulada
          </button>
        ) : (
          <button
            className="bg-red-400 px-3 py-1 rounded shadow hover:bg-red-500 text-white"
            onClick={() => anularVenta(row)}
          >
            Anular
          </button>
        )
      ),
      ignoreRowClick: true,
      button: true,
    },
  ].filter(col => col.name !== "Anular" || esAdministrador);

  const columnasDetalle = [
    { name: "ID", selector: row => row.idProducto, sortable: true, width: "110px" },
    {
      name: "Producto",
      cell: row => (
        <div className="truncate text-base font-semibold" title={row.nombreProducto} style={{ maxWidth: 220 }}>
          {row.nombreProducto}
        </div>
      ),
      sortable: true,
      width: "240px",
    },
    {
      name: "Stock",
      cell: row => {
        const stock = Number(row.stock || 0);
        const minimo = Number(row.cantidadMinima || 0);
        return (
          <span className={clsx("font-semibold px-2 py-1 rounded", colorStock(stock, minimo))}>
            {stock}
          </span>
        );
      },
      sortable: true,
      width: "100px",
    },
    {
      name: "Cantidad",
      cell: row => (
        <input
          type="number"
          min={1}
          max={row.stock}
          value={row.cantidadComprada}
          onChange={e => cambiarCantidad(row.idProducto, Number(e.target.value))}
          className="border rounded px-2 py-1 w-16 text-black bg-gray-50 focus:ring focus:ring-blue-200"
          style={{ textAlign: "center" }}
        />
      ),
      sortable: false,
      width: "110px",
    },
    {
      name: "Precio Unitario",
      cell: row => <span className="text-base font-semibold">{`$${Number(row.precioUnitarioVenta || 0).toFixed(2)}`}</span>,
      sortable: true,
      width: "150px",
    },
    {
      name: "Precio Total",
      cell: row => (
        <span className="text-base font-semibold">
          {`$${Number((row.precioUnitarioVenta || 0) * (row.cantidadComprada || 0)).toFixed(2)}`}
        </span>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Acciones",
      cell: row => (
        <button
          className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
          onClick={() => eliminarProducto(row.idProducto)}
        >
          Eliminar
        </button>
      ),
      ignoreRowClick: true,
      button: true,
      width: "72px",
      right: true,
    },
  ];

  return (
    <main className="flex flex-col h-full w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-center flex-1">Ventas</h1>
        <button
          type="button"
          className="bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700"
          onClick={() => setMostrarCaja(true)}
        >
          Caja
        </button>
      </div>

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

      {!mostrarCaja && modo === "lista" && (
        <VentasLista
          esAdministrador={esAdministrador}
          seccion={seccion}
          setSeccion={setSeccion}
          setModo={setModo}
          filtro={filtro}
          setFiltro={setFiltro}
          columnasVentas={columnasVentas}
          ventasFiltradas={ventasFiltradas}
        />
      )}

      {!mostrarCaja && modo === "nueva" && (
        <VentasNueva
          setModo={setModo}
          mostrarListaClientes={mostrarListaClientes}
          setMostrarListaClientes={setMostrarListaClientes}
          clienteSeleccionado={clienteSeleccionado}
          setClienteSeleccionado={setClienteSeleccionado}
          busquedaCliente={busquedaCliente}
          setBusquedaCliente={setBusquedaCliente}
          clientes={clientes}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          modalProductos={modalProductos}
          setModalProductos={setModalProductos}
          columnasDetalle={columnasDetalle}
          productosSeleccionados={productosSeleccionados}
          subtotalVenta={subtotalVenta}
          descuentoGeneral={descuentoGeneral}
          setDescuentoGeneral={setDescuentoGeneral}
          totalDescuentoGeneral={totalDescuentoGeneral}
          totalDescuento={totalDescuento}
          porcentajeIva={porcentajeIva}
          totalIVA={totalIVA}
          totalPagar={totalPagar}
          crearVenta={crearVenta}
          resetearVenta={resetearVenta}
          inventariosActivos={inventariosActivos}
          agregarProducto={agregarProducto}
        />
      )}

      {mostrarDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setMostrarDetalle(false)}></div>
          <div className="relative bg-white rounded-lg shadow-2xl p-4 w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Detalle de Venta</h3>
              <button className="text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setMostrarDetalle(false)}>&times;</button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="border rounded p-3 bg-gray-50">
                <div className="text-center font-semibold text-lg">
                  {(parametrosDetalle.find(p => p.claveParametro === "nombreNegocio")?.valorParametro) || "Comprobante"}
                </div>
                <div className="text-center text-sm text-gray-600">
                  {(parametrosDetalle.find(p => p.claveParametro === "direccionNegocio")?.valorParametro) || "-"}
                </div>
                <div className="text-center text-sm text-gray-600">
                  {(parametrosDetalle.find(p => p.claveParametro === "telefonoNegocio")?.valorParametro) || "-"}
                </div>
                <div className="text-center text-sm text-gray-600 mb-3">
                  {(parametrosDetalle.find(p => p.claveParametro === "correoNegocio")?.valorParametro) || "-"}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="font-semibold">Venta:</span> {ventaDetalle?.idVenta ?? "-"}</div>
                  <div><span className="font-semibold">Fecha:</span> {ventaDetalle?.fechaVenta ? new Date(ventaDetalle.fechaVenta).toLocaleString() : "-"}</div>
                  <div><span className="font-semibold">Metodo:</span> {ventaDetalle?.metodoPago || "-"}</div>
                  <div><span className="font-semibold">Estado:</span> {ventaDetalle?.estadoVenta || "-"}</div>
                  <div><span className="font-semibold">Vendedor:</span> {ventaDetalle?.usuario?.nombreCompleto || "-"}</div>
                  <div><span className="font-semibold">Cliente:</span> {ventaDetalle?.cliente?.nombreCliente || "-"}</div>
                  <div><span className="font-semibold">Cédula:</span> {ventaDetalle?.cliente?.cedulaCliente || "-"}</div>
                  <div><span className="font-semibold">Caja:</span> {ventaDetalle?.idCaja ?? "-"}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Producto</th>
                        <th className="text-center py-1">Cant</th>
                        <th className="text-center py-1">P.U.</th>
                        <th className="text-center py-1">Subtotal</th>
                        <th className="text-center py-1">Desc.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ventaDetalle?.detalles || []).map(d => (
                        <tr key={d.idDetalleVenta} className="border-b last:border-b-0">
                          <td className="py-1">{d.producto?.nombreProducto || "-"}</td>
                          <td className="text-center py-1">{d.cantidadVendida ?? "-"}</td>
                          <td className="text-center py-1">${Number(d.precioUnitarioVendido || 0).toFixed(2)}</td>
                          <td className="text-center py-1">${Number(d.subtotalProducto || 0).toFixed(2)}</td>
                          <td className="text-center py-1">${Number(d.valorDescuentoProducto || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                      {(ventaDetalle?.detalles || []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-gray-500 py-2">Sin detalles</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-sm">
                  <div className="flex justify-end">
                    <span className="w-40 text-right">Subtotal:</span>
                    <span className="w-24 text-right">${Number(ventaDetalle?.subtotalVenta || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="w-40 text-right">Descuento ({Number(ventaDetalle?.descuentoGeneral || 0).toFixed(0)}%):</span>
                    <span className="w-24 text-right">${Number(ventaDetalle?.totalDescuento || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="w-40 text-right">IVA ({Number(ventaDetalle?.baseIVA || 0).toFixed(0)}%):</span>
                    <span className="w-24 text-right">${Number(ventaDetalle?.totalIVA || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end font-semibold">
                    <span className="w-40 text-right">Total:</span>
                    <span className="w-24 text-right">${Number(ventaDetalle?.totalPagar || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarCaja && (
        <CajaVista
          usuario={usuario}
          onCerrar={() => setMostrarCaja(false)}
        />
      )}

    </main>
  );
}
