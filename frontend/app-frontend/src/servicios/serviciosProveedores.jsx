import api from '@/api/axios'
const ruta = '/proveedor'

// Función para obtener todos los proveedores
export async function obtenerProveedoresServicio() {
    try {
        const response = await api.get(ruta);
        return response.data

    } catch (error) {
        throw error;
    }
}

// Función para crear un nuevo proveedor
export async function crearProveedorServicio(proveedor) {
    try {
        const response = await api.post(ruta, proveedor)
        return response.data
    } catch (error) {
        throw error

    }
}

// Función para obtener un proveedor por su ID
export async function obtenerProveedorPorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}

// Función para actualizar un proveedor existente
export async function actualizarProveedorServicio(id, proveedor) {
    try {
        const response = await api.put(`${ruta}/${id}/`,proveedor)
        return response.data
    } catch (error) {
        throw error
    }
}

// Función para deshabilitar un proveedor
export async function deshabilitarProveedorServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`)
        return response.data
    } catch (error) {
        throw error
    }
}
