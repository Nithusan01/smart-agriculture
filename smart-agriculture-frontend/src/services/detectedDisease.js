import {api} from './api';

export const addDetectedDisease = async (diseaseData) => {

        const res = await api.post('detectedDisease/', diseaseData)
        return res;
}
export const getDetectionByCultivationPlan = async(id)=> {
    try {
        if (!id) {
    console.error("Plan ID is missing");
    return;
  }
        const res = await api.get(`detectedDisease/plan/${id}`)
          console.log(res.data);

        return res;

        
    } catch (error) {
        throw error;

        
    }

}
export const updateDetectionStatus = async (id, status) => {
    try {
        if (!id) {
            throw new Error('detection ID is required');
        }
        const res = await api.put(`detectedDisease/${id}/status`, { status });
        return res;
    } catch (error) {
        console.error('Update detection status API error:', error);

        throw error;
    }
};