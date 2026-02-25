import { useState } from "react";
import { useCrops } from "../../contexts/CropContext.jsx";
import { useSoil } from "../../contexts/SoilContext.jsx";

const CropForm = () => {

  const {addCrop} = useCrops();
  const {soilData} = useSoil();
  const [formData, setFormData] = useState({
    cropName: "",
    cropType: "",
    durationDays: "",
    waterRequirement: "",
    recommendedSoil: "",
  });

  
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
          {soilData.length > 0 ? (
            <>
              <option value="">Select Recommended Soil...</option>
              {soilData.map((soil) => (
                <option key={soil.id} value={soil.soilType}>
                  {soil.soilType
                    
                    ? soil.soilType.charAt(0).toUpperCase() + soil.soilType.slice(1)
                    : "Unknown Soil Type"}
                </option>
              ))}
            </>
          ) : (
             <> 

            <option value="">No soil data available</option>
            </>
          )}
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
