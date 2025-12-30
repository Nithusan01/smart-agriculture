import {api} from "./api"


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
     const res = await api.get("cultivationPlan/")
     return res
        
    } catch (error) {
        throw error

    }
}

export const updatePlan = async(id,data) => {
    try {
        const res = await api.put(`cultivationPlan/${id}`,data)
        return res
        
    }
     catch (error) {
        throw error
        
    }
}
   
export const removePlan = async(id) => {
    try {
        const res = await api.delete(`cultivationPlan/${id}`)
        return res
        
    } catch (error) {
        throw error
    }
    
}