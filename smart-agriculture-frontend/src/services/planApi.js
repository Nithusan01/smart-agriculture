import api from "./api"


export const createPlan = async (data) =>{
    const res = await api.post("cultivationPlan/",data)
    return res
}

export const getPlans = async() => {
    const res = await api.get("cultivationPlan/")
    return res
}
export const updatePlan = async(id,data) => {
    const res = await api.put(`cultivationPlan/${id}`,data)
    return res
}
