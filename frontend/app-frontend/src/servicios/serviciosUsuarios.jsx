import api from '@/api/axios'
const ruta = '/usuarios'

// **********************************
// Función para iniciar sesión
// **********************************
export async function iniciarSesion(username, password) {
    try {
        const response = await api.post(ruta + '/login/', { username, password })
        
        return response.data
    } catch (error) {
        console.error('Error al iniciar sesión:', error)
        throw error
    }
}

// **********************************
// Función para el manejo de usuarios
// **********************************

// Función para obtener todos los usuarios
export async function obtenerUsuariosServicio() {
    try {
        const response = await api.get(ruta);
        return response.data

    } catch (error) {
        throw error;
    }
}

// Función para obtener un usuario por su ID
export async function obtenerUsuarioPorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}

// Función para crear un nuevo usuario
export async function crearUsuarioServicio(usuario) {
    try {
        const response = await api.post(ruta, usuario)
        return response.data
    } catch (error) {
        throw error

    }
}

// Función para actualizar un usuario existente
export async function actualizarUsuarioServicio(id, usuario) {
    try {
        const response = await api.put(`${ruta}/${id}/`, usuario)
        console.log("Respuesta del servidor al actualizar usuario:", response);
        return response.data
    } catch (error) {
        throw error
    }
}

// Función para deshabilitar un usuario (eliminarlo)
export async function deshabilitarUsuarioServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`)
        return response.data
    } catch (error) {
        throw error
    }
}
