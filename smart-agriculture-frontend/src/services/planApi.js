import {api} from "./api"


export const createPlan = async (data) =>{

    const res = await api.post("cultivationPlan/",data)
    return res;  
}

export const getPlans = async() => {
     const res = await api.get("cultivationPlan/")
     return res;
}

export const updatePlan = async(id,data) => {
        const res = await api.put(`cultivationPlan/${id}`,data)
        return res;
    
}
   
export const removePlan = async(id) => {
    
        const res = await api.delete(`cultivationPlan/${id}`)
        return res;
}

export const removeDevice =async (id) =>{
    
        const res = await api.patch(`cultivationPlan/device/${id}`)
        return res;
}