import api from '@/api/axios'
const ruta = '/clientes'

// Función para obtener todos los clientes
export async function obtenerClientesServicio() {
    try {
        const response = await api.get(ruta);
        return response.data

    } catch (error) {
        throw error;
    }
}

// Función para crear un nuevo cliente
export async function crearClienteServicio(cliente) {
    try {
        const response = await api.post(ruta, cliente)
        return response.data
    } catch (error) {
        throw error

    }
}

// Función para obtener un cliente por su ID
export async function obtenerClientePorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}

// Función para actualizar un cliente existente
export async function actualizarClienteServicio(id, cliente) {
    try {
        const response = await api.put(`${ruta}/${id}/`, cliente)
        return response.data
    } catch (error) {
        throw error
    }
}

// Función para deshabilitar un cliente (eliminarlo)
export async function deshabilitarClienteServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`)
        return response.data
    } catch (error) {
        throw error
    }
}
