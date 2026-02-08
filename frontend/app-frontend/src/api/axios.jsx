import axios from "axios";
const api=axios.create({
    baseURL: "https://t02-03-dalctmarket-grupo06.onrender.com"//"http://localhost:8000"//import.meta.env.VITE_API_URL 
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