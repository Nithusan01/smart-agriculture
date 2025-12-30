import {api} from "./api.js"

export const createDisease = async(data) => {
    try {
        const res = await api.post("disease/",data)
        return res
    } catch (error) {
        throw error
    }
}
export const getDiseases= async() => {
    try {
        const res = await api.get("disease/") 
        return res
    } catch (error) {
        throw error
    }   
}

// export const getDiseaseById = async (id) => {
//     try {
//         const res = await api.get(`disease/${id}`);
//         return res;
//     } catch (error) {
//         console.error('Error fetching crop by ID:', error);
//         throw error;
//     }
// }


export const getDiseaseByCropName = async(cropName) => {
    try {
        const res = await api.get(`disease/${cropName}`)
        return res
    } catch (error) {
        throw error 
    }
}      

export const updateDisease = async (id, data) => {
    try {
        if (!id) {
            throw new Error('disease ID is required');
        }

        const res = await api.put(`disease/${id}`, data);
        return res;
    } catch (error) {
        console.error('Update disease API error:', error);
        
        // Enhance the error with more context
        const enhancedError = new Error(
            error.response?.data?.message 
            || error.message 
            || 'Failed to update disease'
        );
        enhancedError.status = error.response?.status;
        throw enhancedError;
    }
};

export const removeDisease = async (id) => {
    if (!id) {
        throw new Error('disease ID is required');
    }
    
    const response = await api.delete(`disease/${id}`);
    
    // Optional: Add logging for debugging
    console.log(`disease ${id} deleted successfully`);
    
    return response;
};