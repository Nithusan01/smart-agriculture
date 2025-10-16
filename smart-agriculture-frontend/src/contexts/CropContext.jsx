// src/contexts/CropContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCrops } from '../services/cropApi';

const CropContext = createContext();

export const useCrops = () => {
  return useContext(CropContext);
};

export const CropProvider = ({ children }) => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchCrops();
  }, []);

  const value = {
    crops,
    loading,
    error,
    fetchCrops,
    setCrops
  };

  return (
    <CropContext.Provider value={value}>
      {children}
    </CropContext.Provider>
  );
};