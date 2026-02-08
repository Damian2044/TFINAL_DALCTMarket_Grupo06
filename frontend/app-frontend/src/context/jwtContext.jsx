// Contexto para manejar el JWT desde el Storage
import { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";


// Se crea el contexto
const JwtContext = createContext();

function JwtProvider({ children }) {
  const [jwt, setJwt] = useState(() => sessionStorage.getItem("jwt"));
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        return JSON.parse(usuarioGuardado);
      } catch {
        sessionStorage.removeItem("usuario");
      }
    }
    const token = sessionStorage.getItem("jwt");
    if (token) {
      try {
        const usuarioDecodificado = jwtDecode(token);
        sessionStorage.setItem("usuario", JSON.stringify(usuarioDecodificado));
        return usuarioDecodificado;
      } catch {
        sessionStorage.removeItem("usuario");
      }
    }
    return null;
  });

  useEffect(() => {
    if (jwt && !usuario) {
      try {
        const usuarioDecodificado = jwtDecode(jwt);
        setUsuario(usuarioDecodificado);
        sessionStorage.setItem("usuario", JSON.stringify(usuarioDecodificado));
      } catch {
        setUsuario(null);
        sessionStorage.removeItem("usuario");
      }
    }
  }, [jwt, usuario]);


  // Iniciar sesión: guarda el JWT y el usuario decodificado
  const guardarSesion = (nuevoJwt) => {
    setJwt(nuevoJwt);
    sessionStorage.setItem("jwt", nuevoJwt);
    try {
      const usuarioDecodificado = jwtDecode(nuevoJwt);
      setUsuario(usuarioDecodificado);
      sessionStorage.setItem("usuario", JSON.stringify(usuarioDecodificado));
    } catch {
      setUsuario(null);
      console.log("Error al decodificar el JWT");
      sessionStorage.removeItem("usuario");
    }
  };

  // Cerrar sesión: elimina el JWT y el usuario
  const borrarSesion = () => {
    setJwt(null);
    setUsuario(null);
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("usuario");
  };

  return (
    <JwtContext.Provider value={{ jwt, usuario, guardarSesion, borrarSesion }}>
      {children}
    </JwtContext.Provider>
  );
}

// Exportación del contexto y proveedor
export { JwtContext, JwtProvider };
