// src/contexts/CultivationPlanContext.js
import { createContext, useState, useContext } from "react";
import { useEffect } from "react";
import { createPlan,getPlans} from "../services/planApi";

const CultivationPlanContext = createContext();

export const useCultivationPlan = () => useContext(CultivationPlanContext);

export const CultivationPlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  

  // ✅ Create new plan
  const addPlan = async (plan) => {
    try {
      const res = await createPlan(plan)
      setPlans((prev) => [...prev, res.data]) // response has cultivationPlan
      setStatus("Plan added successfully!")
      return { success: true }
    } catch (error) {
       return {
        success: false,
        error: error.res?.data?.message || 'plan add failed server error'
      }
    }
  };


  // ✅ Fetch plans from backend
     useEffect( () => {

      const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      setPlans(res.data.data); // ensure backend returns array in data
    } catch (error) {
       return {
        success: false,
        error: error.res?.data?.message || 'fetch plan failed server error'
      }
    } finally {
      setLoading(false);
    } 
      };
      fetchPlans();

 },[status]);

// In your CultivationPlanContext.jsx
const editPlan = async (id, updates) => {
  try {
    const res = await  updatedPlan(id,updates)
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? res : p.data.data))
    );
    setStatus("Plan updated successfully!");
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update plan';
    setStatus(errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

 


  return (
    <CultivationPlanContext.Provider
      value={{
        plans,
        loading,
        status,
        setStatus,
        addPlan,
        editPlan
      }}
    >
      {children}
    </CultivationPlanContext.Provider>
  );
};
