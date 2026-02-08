import { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logoEmpresaIcono from "@/assets/imagenes/logo.png";
import cerrarSesionIcono from "@/assets/imagenes/cerrar-sesion.svg";
import usuarioIcono from "@/assets/imagenes/usuarios.svg";
import { JwtContext } from "@/context/jwtContext";
import { rutasApp, rutasPorRol } from "@/permisos/rutasPorRol";
import "@/vistas/PlantillaBase/PlantillaBase.css";

export default function PlantillaBase({ componente }) {
  
  const ubicacion = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const { usuario } = useContext(JwtContext);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const { borrarSesion } = useContext(JwtContext);
  // Flecha abajo en menú lateral
  const [mostrarFlechaMenu, setMostrarFlechaMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const checkScroll = () => {
      setMostrarFlechaMenu(menu.scrollHeight > menu.clientHeight && menu.scrollTop + menu.clientHeight < menu.scrollHeight - 2);
    };
    menu.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => menu.removeEventListener('scroll', checkScroll);
  }, [rutasDisponibles, menuAbierto]);

  useEffect(() => {
    if (usuario && usuario.rol) {
      const rutasPermitidas = Object.keys(rutasApp).filter(
        modulo => rutasPorRol[modulo]?.includes(usuario.rol)
      );
      setRutasDisponibles(rutasPermitidas);
    } else {
      setRutasDisponibles([]);
    }
  }, [usuario]);

  const cerrarSesion = () => {
    borrarSesion();
  };

  const alEntrarMouse = () => {
    if (!modoManual) setMenuAbierto(true);
  };
  const alSalirMouse = () => {
    if (!modoManual) setMenuAbierto(false);
  };
  const alternarMenu = () => {
    setMenuAbierto(prev => !prev);
    setModoManual(true);
  };

  useEffect(() => {
    if (!menuAbierto && modoManual) {
      const temporizador = setTimeout(() => setModoManual(false), 500);
      return () => clearTimeout(temporizador);
    }
  }, [menuAbierto, modoManual]);

  function Icono({ icono }) {
    if (typeof icono === "string") {
      return <img src={icono} alt="icono" className="icono" />;
    }
    return <span className="icono">{icono}</span>;
  }

  return (
    <div className={`plantillaBase ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <aside
        className="barraLateral"
        onMouseEnter={alEntrarMouse}
        onMouseLeave={alSalirMouse}
      >
        <div className="areaLogo">
          <img src={logoEmpresaIcono} alt="Logo" className="logo" />
          
        </div>
        <nav className="menuNavegacion" ref={menuRef} style={{position:'relative'}}>
          {rutasDisponibles.map(modulo => {
            const ruta = rutasApp[modulo];
            return (
              <Link
                key={modulo}
                to={ruta.path}
                className={`itemNavegacion${ubicacion.pathname === ruta.path ? " activo" : ""}`}
                onClick={() => setMenuAbierto(false)}
                title={"Botón para ir a " + ruta.etiqueta}
              >
                <Icono icono={ruta.icono} />
                {menuAbierto && <span>{ruta.etiqueta}</span>}
              </Link>
            );
          })}
          {mostrarFlechaMenu && (
            <div style={{position:'absolute',bottom:6,left:0,right:0,display:'flex',justifyContent:'center',pointerEvents:'none'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L11 14L16 9" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </nav>
      </aside>
      <div className="contenidoPrincipal">
        <header className="encabezado">
          <div className="menuIzquierda">
            <button onClick={alternarMenu} className="botonMenu">
              {menuAbierto ? "X" : "☰"}
            </button>
          </div>
          <UsuarioMenu usuario={usuario} cerrarSesion={cerrarSesion} />
        </header>
        <main className="contenido">{componente}</main>
        <footer className="piePagina">
          <p>© 2025 DALCT Market. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}

// Componente fuera del principal
function UsuarioMenu({ usuario, cerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [horaInicioSesion] = useState(() => {
    // Guardar la hora de inicio de sesión al cargar el componente
    const ahora = new Date();
    return ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  return (
    <div className="usuarioMenuContainer">
      <button className="usuarioMenuBoton" onClick={() => setMenuAbierto(v => !v)}>
        <img src={usuarioIcono} alt="Usuario" className="iconoUsuario" />
        <span className="usuarioMenuNombre">{usuario ? usuario.cedula : ""}</span>
        <span className="usuarioMenuHora">{` | Inicio: ${horaInicioSesion}`}</span>
        <span className={`usuarioMenuFlecha${menuAbierto ? " abierto" : ""}`}>{/* SVG flecha abajo */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 6L8 9.5L11.5 6" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {menuAbierto && (
        <div className="usuarioMenuDropdown">
          <button className="usuarioMenuCerrarSesion" onClick={() => { cerrarSesion(); setMenuAbierto(false); }}>
            <img src={cerrarSesionIcono} alt="Cerrar sesión" className="iconoCerrar" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
