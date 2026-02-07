import axios from "axios";
const api=axios.create({
    baseURL: "https://t02-03-dalctmarket-grupo06.onrender.com"//"http://localhost:8000"//import.meta.env.VITE_API_URL 
});

export default api;