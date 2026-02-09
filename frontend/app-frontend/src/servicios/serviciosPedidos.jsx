import api from '@/api/axios'
const ruta = '/pedido'

// Obtener todos los pedidos
export async function obtenerPedidosServicio() {
    try {
        const response = await api.get(ruta);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Obtener pedidos pendientes de revisión
export async function obtenerPedidosPendientesServicio() {
    try {
        const response = await api.get(`${ruta}/pendientes`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Obtener pedido por ID
export async function obtenerPedidoPorIdServicio(idPedido) {
    try {
        const response = await api.get(`${ruta}/${idPedido}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Crear pedido
export async function crearPedidoServicio(pedido) {
    try {
        const response = await api.post(ruta, pedido);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Revisar/aprobar/rechazar pedido
export async function revisarPedidoServicio(idPedido, revisar) {
    try {
        const response = await api.post(`${ruta}/${idPedido}/revisar`, revisar);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Listar detalles de un pedido
export async function listarDetallesPorPedidoServicio(idPedido) {
    try {
        const response = await api.get(`${ruta}/${idPedido}/detalles`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Obtener detalle de pedido por ID
export async function obtenerDetallePedidoPorIdServicio(idDetalle) {
    try {
        const response = await api.get(`${ruta}/detalles/${idDetalle}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Confirmar recepción de un detalle de pedido
export async function recepcionarDetallePedidoServicio(idDetalle, recepcion) {
    try {
        const response = await api.post(`${ruta}/detalles/${idDetalle}/recepcionar`, recepcion);
        return response.data;
    } catch (error) {
        throw error;
    }
}
