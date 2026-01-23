import { createContext, useContext, useState, useEffect } from 'react'
import {addDetectedDisease,getDetectionByCultivationPlan} from '../services/detectedDisease'


const DetectedDiseaseContext = createContext();

export const useDetectedDiseases = () => {
    return useContext(DetectedDiseaseContext);
}

export  const DetectedDiseaseProvider = ({children}) => {
        const [detectedDiseases, setDetectedDiseases] = useState([]);

const createDetectedDisease = async(disease)=> {
    try {
        const res = await addDetectedDisease(disease);
        return {
            success:true,
            message:"disease detected ",
            data:res.data
        }

        
    } catch (error) {
        let errorMessage = "Failed to add Disease";
            
            if (error.response) {
                errorMessage = error.response.data?.message || 
                              `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "No response from server. Check your connection.";
            }
            
            return {
                success: false,
                error: errorMessage
            };

        
    }

  

}

const getdetectionsByplan = async (planTd) =>{
    try {
        const res = await getDetectionByCultivationPlan(planTd);
        return{
            success:true,
            message:"disease fetched successfully",
            data:res.data
        }

        
    } catch (error) {

        let errorMessage = "Failed to fetch Disease";
            
            if (error.response) {
                errorMessage = error.response.data?.message || 
                              `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "No response from server. Check your connection.";
            }
            
            return {
                success: false,
                error: errorMessage
            };

        
    }

}











      const  value = {
            detectedDiseases,
            setDetectedDiseases,
            getdetectionsByplan,
            createDetectedDisease
        }


    return (  <DetectedDiseaseContext.Provider value={value}>
            {children}
            </DetectedDiseaseContext.Provider>
    );
};
