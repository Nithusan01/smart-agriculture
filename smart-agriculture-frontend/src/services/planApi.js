import api from "./api"


export const createPlan = async (data) =>{

    try {
        const res = await api.post("cultivationPlan/",data)
    return res
        
    } catch (error) {
        
        throw error
    }
    
}

export const getPlans = async() => {
    try {
        
    } catch (cmd) {
        
    }
    const res = await api.get("cultivationPlan/")
    return res
}
export const updatePlan = async(id,data) => {
    const res = await api.put(`cultivationPlan/${id}`,data)
    return res
}
export const removePlan = async(id) => {
    const res = await api.delete(`cultivationPlan/${id}`)
    return res
}