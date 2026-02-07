import { useForm } from 'react-hook-form'
//import { iniciarSesionServicio } from '@/servicios/servicioLogin'
import { useNavigate } from 'react-router-dom'
import { useEffect,useState, useContext } from 'react'
import CampoContrasena from '@/vistas/Login/CampoContrasena.jsx'
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

  useEffect(() => {
    if (usuario) {
      navigate("/inicio", { replace: true })
    }
  }, [usuario, navigate])

  const manejarInicioSesion = async (datos) => {
    try {
      const respuesta = await iniciarSesion(datos.usuario, datos.contrasenia)
      if (respuesta.access_token) {
        guardarSesion(respuesta.access_token)
        setMensaje({ tipo: 'exito', texto: '¡Inicio de sesión exitoso!' })
        setTimeout(() => {
          navigate("/inicio", { replace: true })
        }, 500)
      } else {
        setMensaje({ tipo: 'error', texto: 'Usuario o contraseña incorrectos' })
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.response?.data?.detail || 'Usuario o contraseña incorrectos' })
    }
  }

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
    </div>
  )
}
