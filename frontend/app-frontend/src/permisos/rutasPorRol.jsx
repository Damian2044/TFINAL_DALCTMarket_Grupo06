// src/rutas/rutasApp.js
import { FaCogs, FaUser, FaBoxes, FaFileInvoiceDollar } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import inicioIcono from "@/assets/imagenes/inicio.svg";
import clienteIcono from "@/assets/imagenes/cliente.png";
import productosIcono from "@/assets/imagenes/productos.svg";
import ventasIcono from "@/assets/imagenes/ventas.svg";
import reportesIcono from "@/assets/imagenes/reportes.png";
import usuariosIcono from "@/assets/imagenes/usuarios.svg";
import promocionesIcono from "@/assets/imagenes/promociones.png";
import categorias from "@/assets/imagenes/categorias.png";
import Inicio from "@/vistas/Inicio/Inicio.jsx"


// import ParametrosSistema from "@/vistas/parametrosSistema/ParametrosSistema.jsx"
// import GestionUsuarios from "@/vistas/gestionUsuarios/GestionUsuarios.jsx"
// import Categorias from "@/vistas/categorias/Categorias.jsx"
// import Productos from "@/vistas/productos/Productos.jsx"
// import Pedidos from "@/vistas/pedidos/Pedidos.jsx"
// import Ventas from "@/vistas/ventas/Ventas.jsx"
// import Promociones from "@/vistas/promociones/Promociones.jsx"
// import Clientes from "@/vistas/clientes/Clientes.jsx"
// import Reportes from "@/vistas/reportes/Reportes.jsx"

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
    // componente: <ParametrosSistema />
  },
  Usuarios: {
    path: "/usuarios",
    etiqueta: "Usuarios",
    icono: <FaUser />,
    // componente: <GestionUsuarios />
  },
  Categorias: {
    path: "/categorias",
    etiqueta: "Categorías",
    icono: categorias,
    // componente: <Categorias />
  },
  Productos: {
    path: "/productos",
    etiqueta: "Productos",
    icono: <FaBoxes />,
    // componente: <Productos />
  },
  Pedido: {
    path: "/pedidos",
    etiqueta: "Pedidos",
    icono: <FaFileInvoiceDollar />,
    // componente: <Pedidos />
  },
  Venta: {
    path: "/ventas",
    etiqueta: "Ventas",
    icono: ventasIcono,
    // componente: <Ventas />
  },
  Promocion: {
    path: "/promociones",
    etiqueta: "Promociones",
    icono: promocionesIcono,
    // componente: <Promociones />
  },
  Cliente: {
    path: "/clientes",
    etiqueta: "Clientes",
    icono: clienteIcono,
    // componente: <Clientes />
  },
  Reportes: {
    path: "/reportes",
    etiqueta: "Reportes",
    icono: <TbReportSearch />,
    // componente: <Reportes />
  }
}



export const rutasPorRol = {
  Inicio: ["Administrador", "Bodeguero", "Cajero"],
  ParametrosSistema: ["Administrador"],
  Usuarios: ["Administrador"],
  Productos: ["Administrador", "Bodeguero", "Cajero"],
  Categorias: ["Administrador", "Bodeguero", "Cajero"],
  Inventario: ["Administrador", "Bodeguero", "Cajero"],
  Pedido: ["Administrador", "Bodeguero"],
  Promocion: ["Administrador", "Cajero"],
  Venta: ["Administrador", "Cajero"],
  Cliente: ["Administrador", "Cajero"],
  Caja: ["Administrador", "Cajero"],
  Reportes: ["Administrador", "Bodeguero"],
};


