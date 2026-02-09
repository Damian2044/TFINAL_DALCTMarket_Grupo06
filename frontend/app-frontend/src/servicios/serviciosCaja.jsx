import api from '@/api/axios'
const ruta = '/caja'

// Abrir caja
export async function abrirCajaServicio(caja) {
    try {
        const response = await api.post(`${ruta}/abrir`, caja);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Cerrar caja
export async function cerrarCajaServicio(idCaja, cierre) {
    try {
        const response = await api.post(`${ruta}/cerrar/${idCaja}`, cierre);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Listar cajas del día
export async function listarCajasHoyServicio() {
    try {
        const response = await api.get(`${ruta}/listar`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Listar todas las cajas (histórico)
export async function listarTodasCajasServicio() {
    try {
        const response = await api.get(`${ruta}/listar/todas`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Reabrir caja
export async function reabrirCajaServicio(idCaja) {
    try {
        const response = await api.post(`${ruta}/reabrir/${idCaja}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
