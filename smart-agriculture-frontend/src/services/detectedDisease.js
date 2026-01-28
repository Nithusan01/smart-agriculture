import {api} from './api';

export const addDetectedDisease = async (diseaseData) => {

    try {
        const res = await api.post('detectedDisease/', diseaseData)
        return res;
        
        
    } catch (error) {
        throw error 
        
    }
        
        
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