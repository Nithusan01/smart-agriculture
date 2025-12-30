// src/contexts/CropContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCrops,createCrop,removeCrop, updateCrop,getCropById } from '../services/cropApi';
import { useAuth } from './AuthContext';

const CropContext = createContext();

export const useCrops = () => {
  return useContext(CropContext);
};

export const CropProvider = ({ children }) => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [status,setStatus] = useState("");
  const [crop,setCrop] = useState([]);
  const { currentUser } = useAuth();


  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCrops();
      setCrops(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
      setError('Failed to load crops');
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };


  const addCrop = async (crop) => {
    // Basic validation
    if (!crop?.cropName?.trim()) {
        return {
            success: false,
            error: "Crop name is required"
        };
    }
    
    try {
        const res = await createCrop(crop);
        return { 
            success: true, 
            message: "Crop added successfully!",
            data: res.data // Optional: include response data
        };
    } catch (error) {
        // Comprehensive error handling
        let errorMessage = "Failed to add crop";
        
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
  // Check if user is logged in and is admin
  if (!currentUser) {
    setLoading(false);
    setCrops([]);
    return;
  }
  
  // Fetch crops if user is admin
  fetchCrops();
  
  // Set up event listener for crop updates
  const handleCropsUpdate = () => {
    if (currentUser) {
      fetchCrops();
    }
  };
  
  window.addEventListener('cropsUpdated', handleCropsUpdate);
  
  // Cleanup function
  return () => {
    window.removeEventListener('cropsUpdated', handleCropsUpdate);
  };
}, [currentUser]); // Add currentUser as dependency

   const handleDelete = async (cropId) => {
        if (!window.confirm('Are you sure you want to delete this crop?')) {
            return;
        }
        
        try {
            setDeletingId(cropId);
            setError(null);
            await removeCrop(cropId);
            setCrops((prevCrops) => prevCrops.filter((crop) => crop.id !== cropId));
        } catch (error) {
            console.error('Failed to delete crop:', error);
            setError('Failed to delete crop');
        } finally {
            setDeletingId(null);
        }
    };

   const editCrop = async (id, updates) => {
    try {
        // Validate input
        if (!id) {
            throw new Error('Crop ID is required');
        }

        if (!updates || typeof updates !== 'object') {
            throw new Error('Valid update data is required');
        }

        const response = await updateCrop(id, updates);
        
        // Check if response has data (adjust based on your API structure)
        const updatedCrop = response.data?.data || response.data;
        
        if (!updatedCrop) {
            throw new Error('No data returned from server');
        }

        setCrops(prev => prev.map(crop => 
            crop.id === id ? { ...crop, ...updatedCrop } : crop
        ));
        
        setStatus("Crop updated successfully!");
        return { success: true };
    } catch (error) {
        console.error('Edit crop error:', error);
        setError(error)
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to update crop';
            
        setStatus(errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
};

//get crop by id
 const fetchCropById = async (id) => {
    try {
        if (!id) {
            throw new Error('Crop ID is required');
        }

        const response = await getCropById(id);
        return response.data?.data || response.data;
        
    } catch (error) {
        console.error('Error fetching crop:', error);
        throw error;
    }
}



  const value = {
    crops,
    loading,
    error,
    fetchCrops,
    setCrops,
    addCrop,
    setError,
    handleDelete,
    deletingId,
    editCrop,
    fetchCropById
  };

  return (
    <CropContext.Provider value={value}>
      {children}
    </CropContext.Provider>
  );
};