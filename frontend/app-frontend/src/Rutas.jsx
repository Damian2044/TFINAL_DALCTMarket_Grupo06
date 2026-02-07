import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./vistas/Login/Login.jsx";
import RutaProtegida from "@/componentes/RutaProtegida.jsx";
import {rutasApp} from "@/permisos/rutasPorRol.jsx"
import PlantillaBase from "@/vistas/PlantillaBase/PlantillaBase.jsx";

function Rutas() {

  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      {Object.keys(rutasApp).map((modulo) => {
        const ruta = rutasApp[modulo]
        return (
          <Route
            key={modulo}
            path={ruta.path}
            element={
              <RutaProtegida modulo={modulo}>
               { <PlantillaBase componente={ruta.componente} />}
              </RutaProtegida>
            }
          />
        )
      })}

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>


  )
}

export default Rutas
