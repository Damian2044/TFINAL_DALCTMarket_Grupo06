import { useState } from 'react'
import ojo from '@/assets/imagenes/ojo.png'
import ojoAbierto from '@/assets/imagenes/ojo-abierto.png'

export default function CampoContrasena({ registrar, nombre, marcador, error }) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const alternarMostrar = () => setMostrarContrasena(!mostrarContrasena)

  return (
    <div className="campoContrasena">
      <div className="contenedorInputIcono">
        <input
          type={mostrarContrasena ? 'text' : 'password'}
          placeholder={marcador}
          {...registrar(nombre, { required: 'La contraseña es obligatoria' })}
          className="entrada"
        />
        <img
          src={mostrarContrasena ? ojoAbierto : ojo}
          alt={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={alternarMostrar}
          className="iconoOjo"
        />
      </div>
      {error && <p className="errorValidacion">{error.message}</p>}
    </div>
  )
}
