// src/rutas/rutasApp.js
import { FaCogs, FaUser, FaBoxes, FaFileInvoiceDollar } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import inicioIcono from "@/assets/imagenes/inicio.svg";
import clienteIcono from "@/assets/imagenes/cliente.png";
import ventasIcono from "@/assets/imagenes/ventas.svg";
import promocionesIcono from "@/assets/imagenes/promociones.png";
import categoriasIcono from "@/assets/imagenes/categorias.png";
import proveedoresIcono from "@/assets/imagenes/proveedores.png";
import Inicio from "@/vistas/Inicio/Inicio.jsx"
import Usuarios from "../vistas/Usuarios/Usuarios";
import Categorias from "@/vistas/Categorias/Categorias.jsx"
import ParametrosSistema from "@/vistas/ParametrosSistema/ParametrosSistema.jsx"
import Proveedores from "@/vistas/Proveedores/Proveedores.jsx"
import Productos from "@/vistas/Productos/Productos.jsx"
import Pedidos from "@/vistas/Pedido/Pedidos.jsx"
import Ventas from "@/vistas/Ventas/Ventas.jsx"
import Promociones from "@/vistas/Promociones/Promociones.jsx"
import Clientes from "@/vistas/Clientes/Clientes.jsx"
import Reportes from "@/vistas/Reportes/Reportes.jsx"

export const rutasApp= {
  Inicio: {
    path: "/inicio",
    etiqueta: "Inicio",
    icono: inicioIcono,
    componente: <Inicio />
  },
  ParametrosSistema: {
    path: "/parametros-sistema",
    etiqueta: "Parámetros Sistema",
    icono: <FaCogs />,
    componente: <ParametrosSistema />
  },
  Usuarios: {
    path: "/usuarios",
    etiqueta: "Usuarios",
    icono: <FaUser />,
    componente: <Usuarios />
  },
  Proveedores: {
    path: "/proveedores",
    etiqueta: "Proveedores",
    icono: proveedoresIcono,
    componente: <Proveedores />

  },
  Categorias: {
    path: "/categorias",
    etiqueta: "Categorías",
    icono: categoriasIcono,
    componente: <Categorias />
  },
  Productos: {
    path: "/productos",
    etiqueta: "Productos",
    icono: <FaBoxes />,
    componente: <Productos />
  },
  Pedido: {
    path: "/pedidos",
    etiqueta: "Pedidos y Compras",
    icono: <FaFileInvoiceDollar />,
    componente: <Pedidos />
  },
  Promocion: {
    path: "/promociones",
    etiqueta: "Promociones",
    icono: promocionesIcono,
    componente: <Promociones />
  },
  Cliente: {
    path: "/clientes",
    etiqueta: "Clientes",
    icono: clienteIcono,
    componente: <Clientes />
  },
  Venta: {
    path: "/ventas",
    etiqueta: "Ventas",
    icono: ventasIcono,
    componente: <Ventas />
  },

  Reportes: {
    path: "/reportes",
    etiqueta: "Reportes",
    icono: <TbReportSearch />,
    componente: <Reportes />
  }
}



export const rutasPorRol = {
  Inicio: ["Administrador", "Bodeguero", "Cajero"],
  ParametrosSistema: ["Administrador"],
  Usuarios: ["Administrador"],
  Proveedores: ["Administrador", "Bodeguero"],
  Categorias: ["Administrador", "Bodeguero"],
  Productos: ["Administrador", "Bodeguero"],
  Pedido: ["Administrador", "Bodeguero"],
  Promocion: ["Administrador"],
  Venta: ["Administrador", "Cajero"],
  Cliente: ["Administrador", "Cajero"],
  Caja: ["Administrador", "Cajero"],
  Reportes: ["Administrador", "Bodeguero"],
};


