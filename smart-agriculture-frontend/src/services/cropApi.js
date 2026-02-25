import { api } from "./api.js"

export const createCrop = async(data) => {
        const res = await api.post("crop/",data)
        return res;
}
export const getCrops = async() => {
        const res = await api.get("crop/") 
        return res;  
}

export const getCropById = async (id) => {
    
        const res = await api.get(`crop/${id}`);
        return res;
}


export const getCropByName = async(cropName) => {

        const res = await api.get(`crop/${cropName}`)
        return res
}      

export const updateCrop = async (id, data) => {
    try {
        if (!id) {
            throw new Error('Crop ID is required');
        }

        const res = await api.put(`crop/${id}`, data);
        return res;
    } catch (error) {
        console.error('Update crop API error:', error);
        
        // Enhance the error with more context
        const enhancedError = new Error(
            error.response?.data?.message 
            || error.message 
            || 'Failed to update crop'
        );
        enhancedError.status = error.response?.status;
        throw enhancedError;
    }
};

export const removeCrop = async (id) => {
    if (!id) {
        throw new Error('Crop ID is required');
    }
    
    const response = await api.delete(`crop/${id}`);
    
    // Optional: Add logging for debugging
    console.log(`Crop ${id} deleted successfully`);
    
    return response;
};