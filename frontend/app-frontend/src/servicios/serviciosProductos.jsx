import api from '@/api/axios'
const ruta = '/producto'

// Función para obtener todos los productos del catálogo
export async function obtenerProductosServicio() {
    try {
        const response = await api.get(ruta);
        return response.data

    } catch (error) {
        throw error;
    }
}

// Función para crear un nuevo producto en el catálogo
export async function crearProductoServicio(producto) {
    try {
        const response = await api.post(ruta, producto)
        return response.data
    } catch (error) {
        throw error

    }
}

// Función para obtener un producto por su ID
export async function obtenerProductoPorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}

// Función para actualizar un producto existente en el catálogo
export async function actualizarProductoServicio(id, producto) {
    try {
        const response = await api.put(`${ruta}/${id}/`, producto)
        return response.data
    } catch (error) {
        throw error
    }
}

// Función para deshabilitar un producto del catálogo (eliminarlo)
export async function deshabilitarProductoServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`)
        return response.data
    } catch (error) {
        throw error
    }
}
