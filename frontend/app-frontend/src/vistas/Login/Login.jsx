import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useEffect,useState, useContext } from 'react'
import CampoContrasena from '@/vistas/Login/CampoContrasena.jsx'
import ForzarCambioContrasena from '@/componentes/ForzarCambioContrasena.jsx'
import '@/vistas/Login/Login.css'
import { iniciarSesion} from '@/servicios/serviciosUsuarios'
import { JwtContext } from '@/context/jwtContext'


export default function Login() {
//register: para registrar los campos del formulario
//handleSubmit: para manejar el envío del formulario
//formState: para manejar el estado del formulario, incluyendo errores

  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const [mensaje, setMensaje] = useState(null)
  const limpiarMensaje = () => { if (mensaje) setMensaje(null) }
  const { guardarSesion, usuario } = useContext(JwtContext)
  const [forzarCambio, setForzarCambio] = useState(false);
  const [credenciales, setCredenciales] = useState({ usuario: '', contrasenia: '' });

  useEffect(() => {
    // Solo navegar automáticamente si hay usuario, no hay forzarCambioClave y NO hay mensaje de éxito
    const forzarCambioClave = sessionStorage.getItem("forzarCambioClave") === "true";
    if (usuario && !forzarCambioClave && !(mensaje && mensaje.tipo === 'exito')) {
      navigate("/inicio", { replace: true })
    }
  }, [usuario, navigate, mensaje])

  const manejarInicioSesion = async (datos) => {
    try {
      const respuesta = await iniciarSesion(datos.usuario, datos.contrasenia)
      if (respuesta.access_token) {
        // Guardar el token SIEMPRE para que el modal funcione correctamente
        guardarSesion(respuesta.access_token);
        // Si usuario y contraseña son iguales, forzar cambio y NO navegar
        if (datos.usuario === datos.contrasenia) {
          setCredenciales({ usuario: datos.usuario, contrasenia: datos.contrasenia });
          setForzarCambio(true);
          sessionStorage.setItem("forzarCambioClave", "true");
          return;
        }
        setMensaje({ tipo: 'exito', texto: '¡Inicio de sesión exitoso!' })
        setTimeout(() => {
          navigate("/inicio", { replace: true })
        }, 2000)
      } else {
        setMensaje({ tipo: 'error', texto: 'Usuario o contraseña incorrectos' })
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.response?.data?.detail || 'Usuario o contraseña incorrectos' })
    }
  }

  // Handler para cuando el cambio de contraseña es exitoso
  const handleCambioExitoso = async (nuevaContrasenia) => {
    setForzarCambio(false);
    sessionStorage.removeItem("forzarCambioClave");
    // Realiza login con la nueva contraseña
    try {
      const resp = await iniciarSesion(credenciales.usuario, nuevaContrasenia);
      if (resp.access_token) {
        guardarSesion(resp.access_token);
        setMensaje({ tipo: 'exito', texto: 'Contraseña actualizada. ¡Inicio de sesión exitoso!' });
        setTimeout(() => {
          navigate("/inicio", { replace: true });
        }, 2000);
      } else {
        setMensaje({ tipo: 'error', texto: 'No se pudo iniciar sesión con la nueva contraseña.' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo iniciar sesión con la nueva contraseña.' });
    }
  };

  return(
    <div className="contenedorLogin">
      <h1 className="tituloLogin">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit(manejarInicioSesion)} className="formularioLogin">
        <div>
          <input
            type="text"
            placeholder="Usuario"
            {...register('usuario',{required:'El usuario es obligatorio',onChange:limpiarMensaje})}
            className="entrada"
          />
          {errors.usuario&&<p className="errorValidacion">{errors.usuario.message}</p>}
        </div>
        <CampoContrasena
          registrar={(nombre)=>register(nombre,{required:'La contraseña es obligatoria',onChange:limpiarMensaje})}
          nombre="contrasenia"
          marcador="Contraseña"
          error={errors.contrasenia}
        />
        <button type="submit" className="botonLogin">Iniciar sesión</button>
      </form>
      {mensaje&&(
        <div className={`mensaje ${mensaje.tipo==='error'?'mensajeError':'mensajeExito'}`}>
          {mensaje.texto}
        </div>
      )}
      {/* Modal de forzar cambio de contraseña si usuario==contraseña */}
      <ForzarCambioContrasena
        usuario={credenciales.usuario}
        contrasenia={credenciales.contrasenia}
        visible={forzarCambio}
        onCambioExitoso={handleCambioExitoso}
      />
    </div>
  )
}
