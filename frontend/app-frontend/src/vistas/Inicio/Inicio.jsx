// Hook para obtener métricas del admin (simulado, reemplazar por servicio real)
function useMetricasAdmin() {
  const [totalUsuarios, setTotalUsuarios] = useState(null);
  const [totalProductos, setTotalProductos] = useState(null);
  const [totalCategorias, setTotalCategorias] = useState(null);
  const [montoTotalVentas, setMontoTotalVentas] = useState(null);
  useEffect(() => {
    setTimeout(() => {
      setTotalUsuarios(12);
      setTotalProductos(34);
      setTotalCategorias(8);
      setMontoTotalVentas(256000);
    }, 1200);
  }, []);
  return { totalUsuarios, totalProductos, totalCategorias, montoTotalVentas };
}

import { useContext, useEffect, useState } from "react";
import { JwtContext } from "@/context/jwtContext";
import { FiUser, FiCalendar, FiClock, FiLogIn, FiUsers, FiBox, FiTag, FiDollarSign } from "react-icons/fi";
import "./Inicio.css";
import minimercadoImagen from "@/assets/imagenes/minimercado.png";
export default function Inicio() {
  const { usuario } = useContext(JwtContext);
  const [fechaActual, setFechaActual] = useState("");
  const [horaActual, setHoraActual] = useState("");
  useEffect(() => {
    // Fecha y hora Ecuador
    const ahora = new Date();
    setFechaActual(ahora.toLocaleDateString("es-EC", {
      timeZone: "America/Guayaquil",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
    const intervalo = setInterval(() => {
      const ahoraHora = new Date();
      setHoraActual(ahoraHora.toLocaleTimeString("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }));
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const horaLogueo = sessionStorage.getItem("horaLogueo")
    ? new Date(sessionStorage.getItem("horaLogueo"))
    : null;

  // Layout principal: header arriba, reloj/fecha, métricas solo admin, hora logueo abajo derecha
  const metricasAdmin = usuario?.rol === "Administrador" ? useMetricasAdmin() : null;
  const metricas = metricasAdmin
    ? [
        { titulo: "Total Usuarios", valor: metricasAdmin.totalUsuarios ?? "Cargando...", icono: <FiUsers size={32} className="text-blue-600" /> },
        { titulo: "Total de categorías", valor: metricasAdmin.totalCategorias ?? "Cargando...", icono: <FiTag size={32} className="text-yellow-600" /> },
        { titulo: "Total de productos", valor: metricasAdmin.totalProductos ?? "Cargando...", icono: <FiBox size={32} className="text-green-600" /> },
        { titulo: "Total de ventas", valor: metricasAdmin.montoTotalVentas ?? "Cargando...", icono: <FiDollarSign size={32} className="text-pink-600" /> },
      ]
    : [];

  return (
    <>
      {/* Hora de inicio de sesión arriba de todo, alineada a la derecha */}
      {horaLogueo && (
        <div style={{width:'100%',maxWidth:1300,margin:'0 auto',display:'flex',justifyContent:'flex-end',alignItems:'flex-start',marginTop:0,marginBottom:12}}>
          <div style={{background:'rgba(255,255,255,0.97)',padding:'8px 18px 8px 10px',borderBottomLeftRadius:12,boxShadow:'0 2px 12px 0 rgba(30,41,59,0.09)',fontSize:'1rem',color:'#22223b',display:'flex',justifyContent:'flex-end',alignItems:'center',gap:6,fontWeight:500,letterSpacing:'.01em',margin:0}}>
            <FiLogIn size={18} />
            <span>Inicio sesión:</span>
            <span>{horaLogueo.toLocaleDateString()} {horaLogueo.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
      {/* Bienvenida centrada superior */}
      <div style={{width:'100%',maxWidth:1100,margin:'0 auto',paddingTop:0,paddingBottom:2,display:'flex',justifyContent:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <FiUser size={36} style={{color:'#2563eb'}} />
          <span style={{fontSize:'2rem',fontWeight:800,color:'#22223b'}}>Bienvenido{usuario?.nombreCompleto ? `, ${usuario.nombreCompleto}` : ''}</span>
        </div>
      </div>
      {/* Reloj y fecha como texto simple, centrados, con íconos */}
      <div style={{width:'100%',maxWidth:1100,margin:'0 auto',textAlign:'center',fontSize:'1.15rem',color:'#374151',marginBottom: usuario?.rol === 'Administrador' ? 6 : 10, display:'flex',justifyContent:'center',gap:8,alignItems:'center'}}>
        <span style={{display:'flex',alignItems:'center',gap:6}}>
          <FiCalendar size={18} style={{marginBottom: -2}} /> {fechaActual}
        </span>
        <span style={{display:'flex',alignItems:'center',gap:6}}>
          <FiClock size={18} style={{marginBottom: -2}} /> {horaActual}
        </span>
      </div>
      {/* Métricas solo para admin, en tarjetas */}
      {usuario?.rol === "Administrador" && (
        <div style={{width:'100%',maxWidth:1300,margin:'40px auto 0 auto',paddingBottom:4,display:'flex',justifyContent:'center'}}>
          <div className="fila-tarjetas-admin" style={{justifyContent:'center',gap:48}}>
            {metricas.map((metrica,indice)=>(
              <div key={indice} className="tarjeta-admin" style={{minWidth:'220px',minHeight:'120px',padding:'24px 18px',fontSize:'1.25rem',boxShadow:'0 2px 12px 0 rgba(30,41,59,0.09)',borderRadius:'16px',background:'#fff',display:'flex',flexDirection:'row',alignItems:'center',gap:'18px'}}>
                <div className="icono-tarjeta-admin" style={{fontSize:'2.2rem'}}>{metrica.icono}</div>
                <div className="info-tarjeta-admin">
                  <div className="titulo-tarjeta-admin" style={{fontSize:'1.1rem',fontWeight:'600',marginBottom:'6px'}}>{metrica.titulo}</div>
                  <div className="valor-tarjeta-admin" style={{fontSize:'1.35rem',fontWeight:'700'}}>{metrica.valor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Imagen solo para usuarios que no son Administrador, debajo del header y fecha/hora */}
      {usuario?.rol !== 'Administrador' && (
        <div style={{width:'100%',maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'center',padding:0,overflow:'visible'}}>
          <img src={minimercadoImagen} alt="market" style={{width:'520px',height:'auto',margin:'32px 0 0 0',padding:0,display:'block',objectFit:'contain',background:'none',border:'none',boxShadow:'none',borderRadius:0}} />
        </div>
      )}

    </>
  );
}