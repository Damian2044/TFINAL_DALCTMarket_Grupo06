import api from '@/api/axios'
const ruta = '/venta'

// Crear venta
export async function crearVentaServicio(venta) {
    try {
        const response = await api.post(`${ruta}/crear`, venta);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Listar ventas del día
export async function obtenerVentasHoyServicio() {
    try {
        const response = await api.get(ruta);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Listar histórico de ventas
export async function obtenerHistoricoVentasServicio() {
    try {
        const response = await api.get(`${ruta}/historico`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Anular venta
export async function anularVentaServicio(idVenta) {
    try {
        const response = await api.delete(`${ruta}/${idVenta}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Generar comprobante de venta
export async function generarComprobanteVentaServicio(idVenta) {
    try {
        const response = await api.get(`${ruta}/generar-comprobante/${idVenta}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
