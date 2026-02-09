import api from '@/api/axios'
const ruta = '/promocion'

// Obtener todas las promociones
export async function obtenerPromocionesServicio() {
    try {
        const response = await api.get(ruta);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Crear una nueva promoción
export async function crearPromocionServicio(promocion) {
    try {
        const response = await api.post(ruta, promocion);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Obtener promoción por ID
export async function obtenerPromocionPorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Obtener promociones activas por producto
export async function obtenerPromocionesPorProductoServicio(idProducto) {
    try {
        const response = await api.get(`${ruta}/producto/${idProducto}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Deshabilitar promoción
export async function deshabilitarPromocionServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Obtener promoción aplicable (mayor descuento) para un producto
export async function obtenerPromocionAplicableServicio(idProducto) {
    try {
        const response = await api.get(`${ruta}/aplicable/${idProducto}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
