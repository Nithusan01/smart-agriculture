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