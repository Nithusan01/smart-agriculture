// src/contexts/CultivationPlanContext.js
import { createContext, useState, useContext } from "react";
import { useEffect } from "react";
import { createPlan,getPlans,updatePlan,removePlan,removeDevice} from "../services/planApi";
import { useAuth } from "./AuthContext";

const CultivationPlanContext = createContext();

export const useCultivationPlan = () => useContext(CultivationPlanContext);

export const CultivationPlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [changePlan,setChangePlan]= useState(false)
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error,setError] = useState("")
  const {currentUser} = useAuth();
  const [isLoading,setIsLoading] = useState(true);
  

  // ✅ Create new plan
  const addPlan = async (plan) => {
    try {
      const res = await createPlan(plan)
      setPlans((prev) => [...prev, res.data]) // response has cultivationPlan
      setStatus("Plan added successfully!")
      return { success: true }
    } catch (error) {
      setError("plan add failed server error")
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
        setTimeout(() => setIsLoading(false), 1000);
      }    } 
      };
        

      

     // Reset plans when no user or fetch when user exists
  if (!currentUser) {
    setPlans([]);
    setLoading(false);
  } else {
    setTimeout(() => setIsLoading(false), 500);
    fetchPlans();

  }

      return () => {
        abortController.abort();
      };

 },[currentUser,plans.length,plans.status,plans.sectorName,changePlan,status]);


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
    setError(errorMessage);
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
    setError(errorMessage);
    return {
      success: false,
      error: errorMessage
    };
    
  }
}
const deleteDevice = async(id)=>{
  try {
    const res = await removeDevice(id);
    setPlans((prev) =>prev.map((p) => (p.id === id ? res.data : p)));
     setStatus("removed device from plan successfully!");
     return{success:true}
    
  } catch (error) {
     const errorMessage = error.response?.data?.message || 'Failed to removedevice from plan';
    setError(errorMessage);
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
        error,
        setError,
        setStatus,
        addPlan,
        editPlan,
       deletePlan,
       deleteDevice,
       isLoading,
       setIsLoading
      }}
    >
      {children}
    </CultivationPlanContext.Provider>
  );
};
