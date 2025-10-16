import { useState } from "react";
import { createCrop } from "../../services/cropApi.js";

const CropForm = () => {
  const [formData, setFormData] = useState({
    cropName: "",
    cropType: "",
    durationDays: "",
    waterRequirement: "",
    recommendedSoil: "",
  });

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
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addCrop(formData);

    if (result.success) {
      alert(result.message);
      setFormData({
        cropName: "",
        cropType: "",
        season:"",
        durationDays: "",
        waterRequirement: "",
        recommendedSoil: "", 
      });
       window.location.reload();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="flex justify-center pt-20">
      <form
        onSubmit={handleSubmit}
        className="max-w-md bg-white p-6 rounded shadow"
      >
        <h2 className="text-xl font-bold mb-4">Add New Crop</h2>

        <input
          type="text"
          name="cropName"
          placeholder="Crop Name"
          value={formData.cropName}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <select
          name="cropType"
          value={formData.cropType}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
          required
        >
          <option value="">Select Crop Type...</option>
          <option value="Seasonal">Seasonal</option>
          <option value="Perennial">Perennial</option>
        </select>

        <select
          name="season"
          value={formData.season}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
          required
        >  
        <option value=""> select season name...</option>   
        <option value="Yala">Yala</option>
        <option value="Maha"> Maha</option>
        <option value="Noth">Both</option>
        

        </select>
        <input
          type="number"
          name="durationDays"
          placeholder="Duration (Days)"
          value={formData.durationDays}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <select
          name="waterRequirement"
          value={formData.waterRequirement}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
          required
        >
          <option value="">Select Water Requirement...</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          name="recommendedSoil"
          value={formData.recommendedSoil}
          onChange={handleChange}
          className="w-full p-2 border mb-3 rounded"
          required
        >
          <option value="">Select Recommended Soil...</option>
          <option value="Clay">Clay</option>
          <option value="Sandy">Sandy</option>
          <option value="Loamy">Loamy</option>
          <option value="Silty">Silty</option>
          <option value="Peaty">Peaty</option>
          <option value="Chalky">Chalky</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Add Crop
        </button>
      </form>
    </div>
  );
};

export default CropForm;
