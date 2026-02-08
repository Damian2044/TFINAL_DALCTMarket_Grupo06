import { useContext } from "react";
import { JwtContext } from "../context/jwtContext";
import { Navigate } from "react-router-dom";
import { rutasPorRol } from "@/permisos/rutasPorRol";


// Componente para proteger rutas según el rol
function RutaProtegida({ children, modulo }) {
  const { jwt, usuario } = useContext(JwtContext);
  // Si no hay JWT → redirige al login
  if (!jwt) {
    return <Navigate to="/login" />;
  }
  // Si aún no se ha cargado usuario → espera
  if (!usuario) return null;

  // BLOQUEO: Si el flag de forzar cambio está activo, redirige siempre a login
  // Este flag se debe setear en login cuando usuario === contraseña
  const forzarCambio = sessionStorage.getItem("forzarCambioClave") === "true";
  if (forzarCambio) {
    // Evita parpadeo: oculta todo antes de limpiar y recargar
    setTimeout(() => {
      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
    }, 0);
    return null;
  }

  // Verifica si el rol del usuario está permitido para este módulo
  const rolesPermitidos = rutasPorRol[modulo] || [];
  if (!rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;
