import { useContext, useState } from "react";
import { JwtContext } from "@/context/jwtContext";
import { FiBox, FiBarChart2, FiUsers, FiDollarSign } from "react-icons/fi";
import ReportesInventario from "./ReportesInventario";
import ReportesVentas from "./ReportesVentas";
import ReportesCaja from "./ReportesCaja";
import ReportesClientes from "./ReportesClientes";

export default function Reportes() {
    const { usuario } = useContext(JwtContext);
    const [pestana, setPestana] = useState("inventario");
    const rol = usuario?.rol || "";
    const pestañas = [
        { key: "inventario", label: "Inventario", icon: <FiBox size={20} />, color: "#2563eb", text: "#fff", border: "#2563eb", bg: "#2563eb22" }, // azul
        ...(rol === "Administrador" ? [
            { key: "ventas", label: "Ventas", icon: <FiBarChart2 size={20} />, color: "#f59e42", text: "#fff", border: "#f59e42", bg: "#f59e4222" }, // naranja
            { key: "caja", label: "Caja", icon: <FiDollarSign size={20} />, color: "#059669", text: "#fff", border: "#059669", bg: "#05966922" }, // verde
            { key: "clientes", label: "Clientes", icon: <FiUsers size={20} />, color: "#dc2626", text: "#fff", border: "#dc2626", bg: "#dc262622" }, // rojo
        ] : [])
    ];

    return (
        <main className="flex flex-col h-full w-full p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Reportes</h1>
            <div className="flex justify-center gap-4 mb-8">
                {pestañas.map(tab => {
                    const active = pestana === tab.key;
                    const style = {
                        background: active ? tab.color : tab.bg,
                        color: active ? tab.text : tab.color,
                        border: `2px solid ${tab.border}`,
                        fontWeight: 600,
                        boxShadow: active ? `0 2px 8px 0 ${tab.color}33` : undefined,
                        transition: 'all 0.2s',
                    };
                    return (
                        <button
                            key={tab.key}
                            style={style}
                            className="px-4 py-2 rounded flex items-center gap-2"
                            onClick={() => setPestana(tab.key)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
            {pestana === "inventario" && <ReportesInventario />}
            {pestana === "ventas" && <ReportesVentas />}
            {pestana === "caja" && <ReportesCaja />}
            {pestana === "clientes" && <ReportesClientes />}
        </main>
    );
}
