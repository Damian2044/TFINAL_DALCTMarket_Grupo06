import { useState, useRef, useContext } from "react";
import { JwtContext } from "@/context/jwtContext";
import CampoContrasenaValidado from "@/vistas/Usuarios/CampoContrasenaValidado";
import { actualizarUsuarioServicio } from "@/servicios/serviciosUsuarios";

/**
 * Componente que recibe usuario, contraseña y onCambioExitoso.
 * Si usuario === contraseña, muestra modal para forzar cambio de contraseña.
 * Si no, no muestra nada.
 * onCambioExitoso(nuevaContrasenia) se llama tras cambio exitoso.
 */
export default function ForzarCambioContrasena({ usuario, contrasenia, onCambioExitoso, visible }) {
  const { usuario: usuarioContext } = useContext(JwtContext);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const [cambiando, setCambiando] = useState(false);
  const [exito, setExito] = useState(false);
  const [tocado1, setTocado1] = useState(false);
  const [tocado2, setTocado2] = useState(false);
  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);
  const formRef = useRef();
  if (!visible || usuario !== contrasenia) return null;

  // Cerrar: borra sesión y recarga todo
  const handleCerrar = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTocado1(true);
    setTocado2(true);
    setError1(null);
    setError2(null);
    // Validación campo 1 (fuerte)
    if (!password1) {
      setError1("Contraseña requerida");
      return;
    }
    if (password1 === usuario) {
      setError1("La nueva contraseña no puede ser igual al usuario.");
      return;
    }
    const reglas = [
      v => v.length >= 8 || "Mínimo 8 caracteres",
      v => /[a-z]/.test(v) || "Debe tener minúscula",
      v => /[A-Z]/.test(v) || "Debe tener mayúscula",
      v => /[0-9]/.test(v) || "Debe tener número",
      v => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) || "Debe tener símbolo"
    ];
    for (let regla of reglas) {
      const r = regla(password1);
      if (r !== true) {
        setError1(r);
        return;
      }
    }
    // Validación campo 2 (igualdad)
    if (!password2) {
      setError2("Confirma la contraseña");
      return;
    }
    if (password1 !== password2) {
      setError2("Las contraseñas no coinciden.");
      return;
    }
    setCambiando(true);
    try {
      // Usar idUsuario del contexto si está disponible
      let idUsuario = usuarioContext?.idUsuario;

      if (!idUsuario) throw new Error("No se encontró el usuario para actualizar contraseña");
      await actualizarUsuarioServicio(idUsuario, { passwordUsuario: password1 });
      setCambiando(false);
      setExito(true);
      setTimeout(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError2(err?.response?.data?.detail || err?.message || "Error al actualizar la contraseña.");
      setCambiando(false);
      setTimeout(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.reload();
      }, 5000);
    }
  };

  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',padding:32,borderRadius:12,boxShadow:'0 2px 16px 0 rgba(0,0,0,0.18)',maxWidth:420,width:'100%',position:'relative'}}>
        {/* Botón X para cerrar */}
        <button onClick={handleCerrar} style={{position:'absolute',top:10,right:12,fontSize:22,fontWeight:700,color:'#888',background:'none',border:'none',cursor:'pointer',zIndex:2}} title="Cerrar y salir">×</button>
        <h2 style={{fontSize:'1.3rem',fontWeight:700,marginBottom:12,color:'#222'}}>Debes actualizar tu contraseña</h2>
        <p style={{marginBottom:18,color:'#444'}}>Por seguridad, la contraseña no puede ser igual al usuario.<br/>Ingresa y confirma una nueva contraseña para continuar.</p>
        {exito ? (
          <div style={{marginTop:24,marginBottom:24,textAlign:'center',color:'#2563eb',fontWeight:600,fontSize:'1.1rem'}}>Contraseña actualizada. Ingrese nuevamente.</div>
        ) : (
        <form onSubmit={handleSubmit} ref={formRef} autoComplete="off" style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{marginBottom:0}}>
            <CampoContrasenaValidado
              registrar={(name, rules) => ({
                name,
                value: password1,
                onChange: e => { setPassword1(e.target.value); setTocado1(true); setError1(null); },
                ...rules
              })}
              nombre="password1"
              marcador="Nueva contraseña"
              error={tocado1 && error1 ? { message: error1 } : null}
              modo="crear"
            />
          </div>
          <div style={{marginBottom:0}}>
            <CampoContrasenaValidado
              registrar={(name, rules) => ({
                name,
                value: password2,
                onChange: e => { setPassword2(e.target.value); setTocado2(true); setError2(null); },
                ...rules
              })}
              nombre="password2"
              marcador="Confirmar contraseña"
              error={tocado2 && error2 ? { message: error2 } : null}
              modo="crear"
            />
          </div>
          <button type="submit" className="botonLogin" style={{marginTop:8,width:'100%'}} disabled={cambiando}>
            {cambiando ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
