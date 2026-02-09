import axios from "axios";

const api=axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("jwt");
    console.log("Token en interceptor:", token); // Agrega este log para verificar el token

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
export default api;


api.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status
        const mensaje = error.response?.data?.message
        console.error("Error en la respuesta:", error.response); // Agrega este log para verificar la respuesta de error
        if (status === 401) {
            sessionStorage.removeItem("jwt");
            sessionStorage.removeItem("usuario");
        }

        return Promise.reject(error)
    }
)