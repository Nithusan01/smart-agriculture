import { createContext, useContext, useState, useEffect } from 'react';
import {createDisease,getDiseases,updateDisease,removeDisease} from '../services/diseaseApi.js'

const DiseaseContext = createContext();

export const useDiseases = () => {
    return useContext(DiseaseContext);
}

export  const DiseaseProvider = ({children}) => {


     const [diseases, setDiseases] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [deletingId, setDeletingId] = useState(null);
      const [status,setStatus] = useState("");
      const [disease,setDisease] = useState([]);
    
    
      const fetchDiseases = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getDiseases();
          setDiseases(response?.data?.data || []);
        } catch (error) {
          console.error('Error fetching Diseases:', error);
          setError('Failed to load Disease');
          setDiseases([]);
        } finally {
          setLoading(false);
        }
      };
    
    
      const addDisease = async (disease) => {
        // Basic validation
        if (!disease?.diseaseName?.trim()) {
            return {
                success: false,
                error: "Disease name is required"
            };
        }
        
        try {
            setLoading(true);
            const res = await createDisease(disease);
            return { 
                success: true, 
                message: "Disease added successfully!",
                data: res.data // Optional: include response data
            };
        } catch (error) {
            // Comprehensive error handling
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
    };
    
    
      useEffect(() => {
        fetchDiseases();
            const handleDiseasesUpdate = () => fetchDiseases();
            window.addEventListener('diseasesUpdated', handleDiseasesUpdate);
            
            return () => {
                window.removeEventListener('diseasesUpdated', handleDiseasesUpdate);
            }
      }, []);

    
       const handleDelete = async (diseaseId) => {
            if (!window.confirm('Are you sure you want to delete this disease?')) {
                return;
            }
            
            try {
                setDeletingId(diseaseId);
                setError(null);
                await removeDisease(diseaseId);
                setDiseases((prevDiseases) => prevDiseases.filter((disease) => disease.id !== diseaseId));
            } catch (error) {
                console.error('Failed to delete disease:', error);
                setError('Failed to delete disease');
            } finally {
                setDeletingId(null);
            }
        };
    
       const editDisease = async (id, updates) => {
        try {
            // Validate input
            if (!id) {
                throw new Error('Disease ID is required');
            }
    
            if (!updates || typeof updates !== 'object') {
                throw new Error('Valid update data is required');
            }
    
            const response = await updateDisease(id, updates);
            
            // Check if response has data (adjust based on your API structure)
            const updatedDisease = response.data?.data || response.data;
            
            if (!updatedDisease) {
                throw new Error('No data returned from server');
            }
    
            setDiseases(prev => prev.map(disease => 
                disease.id === id ? { ...disease, ...updatedDisease } : disease
            ));
            
            setStatus("Disease updated successfully!");
            return { success: true };
        } catch (error) {
            console.error('Edit Disease error:', error);
            setError(error)
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Failed to update Disease';
                
            setStatus(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    };
    
    // //get crop by id
    //  const fetchCropById = async (id) => {
    //     try {
    //         if (!id) {
    //             throw new Error('Crop ID is required');
    //         }
    
    //         const response = await getCropById(id);
    //         return response.data?.data || response.data;
            
    //     } catch (error) {
    //         console.error('Error fetching crop:', error);
    //         throw error;
    //     }
    // }
    
    
    
      const value = {
        diseases,
        loading,
        error,
        fetchDiseases,
        setDiseases,
        addDisease,
        setError,
        handleDelete,
        deletingId,
        editDisease,
        
      };


    

    return (
    <DiseaseContext.Provider value={value}>
      {children}
    </DiseaseContext.Provider>
  );
};