import api from '@/api/axios'
const ruta = '/categoriaproducto'

// Función para obtener todas las categorías de productos
export async function obtenerCategoriasServicio() {
    try {
        const response = await api.get(ruta);
        return response.data

    } catch (error) {
        throw error;
    }
}

// Función para crear una nueva categoría de producto
export async function crearCategoriaServicio(categoria) {
    try {
        const response = await api.post(ruta, categoria)
        return response.data
    } catch (error) {
        throw error

    }
}

// Función para obtener una categoría de producto por su ID
export async function obtenerCategoriaPorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}

// Función para actualizar una categoría de producto existente
export async function actualizarCategoriaServicio(id, categoria) {
    try {
        const response = await api.put(`${ruta}/${id}/`, categoria)
        return response.data
    } catch (error) {
        throw error
    }
}

// Función para deshabilitar una categoría de producto (eliminarla)
export async function deshabilitarCategoriaServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`)
        return response.data
    } catch (error) {
        throw error
    }
}
