import api from '@/api/axios'
import { use } from 'react'
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