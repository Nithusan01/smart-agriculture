import { useState } from "react";
import { useCultivationPlan } from "../../contexts/CultivationPlanContext";
import { useAuth } from "../../contexts/AuthContext";

const Planning = (  ) => {
  const [activeTab, setActiveTab] = useState("crop-plan");
  const [formData, setFormData] = useState({
    sectorName: "",
    cropType: "",
    plantingDate: ""

  });

  const {  addPlan, loading, error ,status,setError,setStatus} = useCultivationPlan();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData({ sectorName: "", cropType: "", plantingDate: ""});
    addPlan(formData); // ✅ save to backend + context
    setError("")
    setStatus("")
    
    
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <section id="planning" className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
          Cultivation Planning with IoT Data
        </h2>

        {loading && <p className="text-blue-500">Loading plans...</p>}
        {error ? <p className="text-red-500">{error}</p> : <p className="text-green-500">{status}</p>}
        

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "crop-plan"
                  ? "border-b-2 border-iot-primary text-iot-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("crop-plan")}
            >
              Crop Plan
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "schedule"
                  ? "border-b-2 border-iot-primary text-iot-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              Schedule
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "resources"
                  ? "border-b-2 border-iot-primary text-iot-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("resources")}
            >
              Resources
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Crop Plan Tab */}
            {activeTab === "crop-plan" && (
              <div className="animate-fade-in">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                        Sector Name
                      </label>
                      <input
                        type="text"
                        id="sectorName"
                        name="sectorName"
                        maxLength="1"
                        value={formData.sectorName}
                        onChange={handleInputChange}
                        placeholder="Enter sector type (A, B, C...)"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="cropType" className="block text-sm font-medium text-gray-700">
                        Crop Type
                      </label>
                      <select
                        id="cropType"
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary focus:border-transparent"
                      >
                        <option value="">Select Crop Type</option>
                        <option value="wheat">Wheat</option>
                        <option value="corn">Corn</option>
                        <option value="rice">Rice</option>
                        <option value="soybean">Soybean</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700">
                        Planting Date
                      </label>
                      <input
                        type="date"
                        id="plantingDate"
                        name="plantingDate"
                        value={formData.plantingDate}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary focus:border-transparent"
                      />
                    </div>

                    {/* <div>
                      <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                        Area (hectares)
                      </label>
                      <input
                        type="number"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="Enter area in hectares"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary focus:border-transparent"
                      />
                    </div> */}

                    {/* <div>
                      <label htmlFor="soilType" className="block text-sm font-medium text-gray-700">
                        Soil Type
                      </label>
                      <select
                        id="soilType"
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary focus:border-transparent"
                      >
                        <option value="">Select Soil Type</option>
                        <option value="loamy">Loamy</option>
                        <option value="sandy">Sandy</option>
                        <option value="clay">Clay</option>
                        <option value="silt">Silt</option>
                      </select>
                    </div> */}
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto border-green-500 bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-400 transition-colors"
                  
                  >
                    Save Crop Plan
                  </button>
                </form>

                {/* ✅ Show Saved Plans
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Your Plans</h3>
                  <ul className="space-y-3">
                    {plans.map((plan) => (
                      <li key={plan.id} className="p-4 border rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium">{plan.cropType} (Sector {plan.sector})</p>
                          <p className="text-sm text-gray-600">
                            Planting: {plan.plantingDate} | Area: {plan.area} ha | Soil: {plan.soilType}
                          </p>
                        </div>
                        <button
                        
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div> */}
              </div>
            )}

            {/* ✅ Schedule Tab */}
            {activeTab === "schedule" && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">IoT-Optimized Planting Schedule</h3>
                {formData.cropType ? (
                  <p>Your personalized planting schedule will be generated...</p>
                ) : (
                  <p className="text-gray-600">Generate a crop plan first to see schedule.</p>
                )}
              </div>
            )}

            {/* ✅ Resources Tab */}
            {activeTab === "resources" && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Resource Allocation</h3>
                {formData.cropType && formData.area ? (
                  <p>
                    {formData.area * 500}L water, {formData.area * 20}kg fertilizer, {formData.area * 5}kg seeds
                  </p>
                ) : (
                  <p className="text-gray-600">Generate a crop plan first to see resources.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Planning;
