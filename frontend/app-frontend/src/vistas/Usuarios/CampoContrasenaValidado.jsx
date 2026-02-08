import { useState } from "react";
import clsx from "clsx";
import ojo from '@/assets/imagenes/ojo.png';
import ojoAbierto from '@/assets/imagenes/ojo-abierto.png';
import { useFormContext } from "react-hook-form";

export default function CampoContrasenaValidado({ registrar, nombre, marcador, error, modo }) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const alternarMostrar = () => setMostrarContrasena(v => !v);
  let trigger = () => {};
  try {
    trigger = useFormContext().trigger;
  } catch {}

  function validarPassword(valor) {
    if (!valor) return "Contraseña requerida";
    if (valor.length < 8) return "Mínimo 8 caracteres";
    if (!/[a-z]/.test(valor)) return "Debe tener minúscula";
    if (!/[A-Z]/.test(valor)) return "Debe tener mayúscula";
    if (!/[0-9]/.test(valor)) return "Debe tener número";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(valor)) return "Debe tener símbolo";
    return true;
  }

  const reglas = modo === "crear"
    ? {
        required: "Contraseña requerida",
        validate: validarPassword
      }
    : {
        validate: valor => {
          if (!valor) return true;
          return validarPassword(valor);
        }
      };

  return (
    <div className="campoContrasena">
      <div className="contenedorInputIcono" style={{ position: "relative" }}>
        {(() => {
          // No pasar 'validate' como prop al input
          const { validate, ...inputProps } = registrar(nombre, reglas);
          return (
            <input
              id={nombre}
              type={mostrarContrasena ? "text" : "password"}
              placeholder={marcador}
              {...inputProps}
              className={clsx(
                "border rounded px-3 py-2",
                error ? "border-red-600 bg-red-50" : "",
                "w-full"
              )}
              autoComplete="new-password"
              aria-invalid={!!error}
              aria-describedby={error ? `${nombre}-error` : undefined}
              onChange={async (e) => {
                if (inputProps.onChange) {
                  inputProps.onChange(e);
                }
                await trigger(nombre);
              }}
            />
          );
        })()}
        <img
          src={mostrarContrasena ? ojoAbierto : ojo}
          alt={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={alternarMostrar}
          className="iconoOjo"
          style={{
            cursor: "pointer",
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "20px",
            height: "20px",
            zIndex: 2
          }}
        />
      </div>
      {error && (
        <p id={`${nombre}-error`} className="text-red-600 text-sm mt-1 font-semibold">
          {error.message}
        </p>
      )}
    </div>
  );
}
