import { api } from "./api.js"

export const createCrop = async(data) => {
    try {
        const res = await api.post("crop/",data)
        return res
    } catch (error) {
        throw error
    }
}
export const getCrops = async() => {
    try {
        const res = await api.get("crop/") 
        return res
    } catch (error) {
        throw error
    }   
}

export const getCropById = async (id) => {
    try {
        const res = await api.get(`crop/${id}`);
        return res;
    } catch (error) {
        console.error('Error fetching crop by ID:', error);
        throw error;
    }
}


export const getCropByName = async(cropName) => {
    try {
        const res = await api.get(`crop/${cropName}`)
        return res
    } catch (error) {
        throw error 
    }
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