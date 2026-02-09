import api from '@/api/axios'
const ruta = '/inventario'

// Función para obtener todos los inventarios
export async function obtenerInventariosServicio() {
    try {
        const response = await api.get(ruta);
        return response.data

    } catch (error) {
        throw error;
    }
}

// Función para crear un nuevo inventario
export async function crearInventarioServicio(inventario) {
    try {
        const response = await api.post(ruta, inventario)
        return response.data
    } catch (error) {
        throw error

    }
}

// Función para obtener un  inventario por su ID
export async function obtenerInventarioPorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}

// Función para actualizar un inventario existente
export async function actualizarInventarioServicio(id, inventario) {
    try {
        const response = await api.put(`${ruta}/${id}/`,inventario)
        return response.data
    } catch (error) {
        throw error
    }
}


// Función para deshabilitar un inventario
export async function deshabilitarInventarioServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Función para obtener el inventario por id de producto
export async function obtenerInventarioPorProductoServicio(idProducto) {
    try {
        const response = await api.get(`${ruta}/producto/${idProducto}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}
