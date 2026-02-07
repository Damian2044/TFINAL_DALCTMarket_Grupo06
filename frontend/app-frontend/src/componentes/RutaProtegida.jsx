import { useContext } from "react";
import { JwtContext } from "../context/jwtContext";
import { Navigate } from "react-router-dom";
import { rutasPorRol } from "@/permisos/rutasPorRol";


// Componente para proteger rutas según el rol
function RutaProtegida({ children, modulo }) {
  const { jwt, usuario } = useContext(JwtContext);
  // Si no hay JWT → redirige al login
  console.log("JWT en RutaProtegida:", jwt);
  console.log("Usuario en RutaProtegida:", usuario);
  if (!jwt) {
    return <Navigate to="/login" />;
  }
  // Si aún no se ha cargado usuario → espera
  if (!usuario) return null;

  // Verifica si el rol del usuario está permitido para este módulo
  const rolesPermitidos = rutasPorRol[modulo] || [];
  if (!rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;
