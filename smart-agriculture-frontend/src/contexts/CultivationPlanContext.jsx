// src/context/CultivationPlanContext.js
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import api from "../services/api";

const CultivationPlanContext = createContext();

export const useCultivationPlan = () => useContext(CultivationPlanContext);

export const CultivationPlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status,setStatus] = useState("")
  const [error, setError] = useState("");

 

  // ✅ Create new plan
  const addPlan = async (planData) => {
    try {
      const response = await api.post("http://localhost:5000/api/cultivationPlan/plan", planData);
      setPlans((prev) => [...prev, response.data]);
      setStatus("plan added successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add plan");
    }
  };

  return (
    <CultivationPlanContext.Provider
      value={{
        plans,
        loading,
        error,
        setError,
        status,
        setStatus,
        addPlan
      }}
    >
      {children}
    </CultivationPlanContext.Provider>
  );
};
