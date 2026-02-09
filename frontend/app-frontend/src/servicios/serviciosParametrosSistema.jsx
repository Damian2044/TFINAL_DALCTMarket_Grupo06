import api from '@/api/axios'
const ruta = '/parametrosistema'


// Subir logo del negocio y obtener la ruta
export async function subirLogoNegocioServicio(archivo) {
    const formData = new FormData();
    formData.append("archivoLogo", archivo);
    try {
        const response = await api.post("/parametrosistema/subirLogo", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Función para obtener todos los parámetros del sistema
export async function obtenerParametrosServicio() {
    try {
        const response = await api.get(ruta);
        return response.data

    } catch (error) {
        throw error;
    }
}

// Función para crear un nuevo parámetro del sistema
export async function crearParametroServicio(parametro) {
    try {
        const response = await api.post(ruta, parametro)
        return response.data
    } catch (error) {
        throw error

    }
}

// Función para obtener un parámetro del sistema por su ID
export async function obtenerParametroPorIdServicio(id) {
    try {
        const response = await api.get(`${ruta}/${id}/`)
        return response.data
    }
    catch (error) {
        throw error
    }
}

// Función para actualizar una categoría de producto existente
export async function actualizarParametroServicio(id, parametro) {
    try {
        const response = await api.put(`${ruta}/${id}/`, parametro)
        return response.data
    } catch (error) {
        throw error
    }
}

// Función para deshabilitar un parámetro del sistema (eliminarlo)
export async function deshabilitarParametroServicio(id) {
    try {
        const response = await api.delete(`${ruta}/${id}/`)
        return response.data
    } catch (error) {
        throw error
    }
}
