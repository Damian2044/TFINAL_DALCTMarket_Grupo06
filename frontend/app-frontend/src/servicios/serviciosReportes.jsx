import api from '@/api/axios'
const ruta = '/reportes'

// Función para obtener el reporte del inventario
export async function obtenerReporteInventarioServicio(filtros = {}) {
    try {
        const response = await api.post(`${ruta}/inventario/`, filtros);
        console.log('Respuesta del reporte de inventario:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// Función para obtener el reporte de ventas productos o categorias
export async function obtenerReporteVentasServicio(filtros = {}) {
    try {
        const response = await api.post(`${ruta}/ventas-producto-categoria/`, filtros);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Función para obtener el reporte de resumen de caja
export async function obtenerReporteCajaServicio(filtros = {}) {
    try {
        const response = await api.post(`${ruta}/resumen-caja/`, filtros);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Función para obtener el reporte de ventas por cliente
export async function obtenerReporteClientesServicio(filtros = {}) {
    try {
        const response = await api.post(`${ruta}/clientes-frecuentes/`, filtros);
        return response.data;
    } catch (error) {
        throw error;
    }
}
