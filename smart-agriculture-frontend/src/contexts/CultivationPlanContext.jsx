// src/contexts/CultivationPlanContext.js
import { createContext, useState, useContext } from "react";
import { useEffect } from "react";
import { createPlan,getPlans,updatePlan,removePlan} from "../services/planApi";
import { useAuth } from "./AuthContext";

const CultivationPlanContext = createContext();

export const useCultivationPlan = () => useContext(CultivationPlanContext);

export const CultivationPlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [changePlan,setChangePlan]= useState(false)
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const {currentUser} = useAuth();
  

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
        error: error.response?.data?.message || 'plan add failed server error'
      }
    }
  };


  // ✅ Fetch plans from backend
     useEffect( () => {
      const abortController = new AbortController();

      const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlans({ signal: abortController.signal });
      if(!abortController.signal.aborted){
      setPlans(res.data.data); // ensure backend returns array in data
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('Fetch plan failed:', error);
        setPlans([]);
      }
    } finally {
         if (!abortController.signal.aborted) {
        setLoading(false);
      }    } 
      };

     // Reset plans when no user or fetch when user exists
  if (!currentUser) {
    setPlans([]);
    setLoading(false);
  } else {
    fetchPlans();
  }

      return () => {
        abortController.abort();
      };

 },[currentUser,plans.length,plans.status,plans.sectorName,changePlan]);


// In your CultivationPlanContext.jsx
const editPlan = async (id, updates) => {
  try {
    const res = await  updatePlan(id,updates)
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? res.data : p))
    );
    setStatus("Plan updated successfully!");
    setChangePlan(true)
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

const deletePlan = async(id) => {
  try {
    
    const res = await removePlan(id)
    setPlans(prev => prev.filter(p => p.id !== id))
    setStatus("Plan deleted successfully!");
    return { success: true };
  } catch (error) {

    const errorMessage = error.response?.data?.message || 'Failed to delete plan';
    setStatus(errorMessage);
    return {
      success: false,
      error: errorMessage
    };
    
  }
}


 


  return (
    <CultivationPlanContext.Provider
      value={{
        plans,
        loading,
        setLoading,
        status,
        setStatus,
        addPlan,
        editPlan,
       deletePlan,
      }}
    >
      {children}
    </CultivationPlanContext.Provider>
  );
};
