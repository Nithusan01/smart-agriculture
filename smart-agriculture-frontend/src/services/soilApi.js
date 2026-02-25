import { api } from "./api.js"
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/'

export const addSoilData = async(data) => {
        const res = await api.post("soil/",data)
        return res;
}
export const getAllSoilData = async() => {
        const res = await api.get("soil/") 
        return res;  
}

