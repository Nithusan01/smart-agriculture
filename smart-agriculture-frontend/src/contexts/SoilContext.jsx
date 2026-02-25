import React, { createContext, useContext, useState } from 'react';
import { getAllSoilData,addSoilData} from '../services/soilApi';
import { useAuth} from './AuthContext';
const SoilContext = createContext();

export const useSoil = () => {
  return useContext(SoilContext)
}

export const SoilProvider = ({ children }) => {
    const [soilData, setSoilData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const fetchSoilData = async () => {
        try {
            setLoading(true);   
            setError(null);
            const response = await getAllSoilData();
            setSoilData(response?.data?.data || []);
        } catch (error) {
            console.error('Error fetching soil data:', error);
            setError('Failed to load soil data');
            setSoilData([]);
        } finally {
            setLoading(false);
        }   
        };
        const addSoil = async (soil) => {
            if (!soil?.moisture || !soil?.ph || !soil?.temperature) {
                return {    
                    success: false,
                    error: "All soil parameters (moisture, pH, temperature) are required"
                };
            }
            try {
                const res = await addSoilData(soil);
                return {
                    success: true,
                    message: "Soil data added successfully!",
                    data: res.data
                };
            } catch (error) {   
                let errorMessage = "Failed to add soil data";
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


        const value = {
            soilData,
            loading,
            error,
            fetchSoilData,
            addSoil
        }
    return (
        <SoilContext.Provider value={value}>
            {children}
        </SoilContext.Provider>
    )
         
}