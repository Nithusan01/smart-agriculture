// src/pages/Planning.jsx
import { useState, useEffect } from "react";
import { useCultivationPlan } from "../../contexts/CultivationPlanContext";
import Swal from 'sweetalert2'
import LocationPicker from "../common/LocationPicker";
import { useWeather } from "../../contexts/WeatherContext";
import { getLocationName } from "../common/geocoding"

const Planning = () => {
  const { plans, loading, addPlan, status, setStatus } = useCultivationPlan();
  const { fetchWeatherForPlan } = useWeather();
  const [activeTab, setActiveTab] = useState("crop-plan");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    sectorName: "",
    cropName: "",
    area: "",
    farmSoilType: "",
    plantingDate: "",
    expectedHarvestDate: ""
  });
  const [planLocations, setPlanLocations] = useState({}); // Store location names
  const [planWeather, setPlanWeather] = useState({}); // Store weather for each plan

  // Get location names for all plans
  useEffect(() => {
    const fetchLocationNames = async () => {
      const locationPromises = plans.map(async (plan) => {
        if (plan.farmLat && plan.farmLng) {
          try {
            const locationName = await getLocationName(plan.farmLat, plan.farmLng);
            return { planId: plan.id, locationName };
          } catch (error) {
            return { planId: plan.id, locationName: 'Location unavailable' };
          }
        }
        return { planId: plan.id, locationName: 'No location set' };
      });

      const results = await Promise.all(locationPromises);
      const locationMap = {};
      results.forEach(result => {
        locationMap[result.planId] = result.locationName;
      });
      setPlanLocations(locationMap);
    };

    if (plans.length > 0) {
      fetchLocationNames();
    }
  }, [plans]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    const dataToSend = {
      ...formData,
      farmLat: location.lat,
      farmLng: location.lng
    };

    const result = await addPlan(dataToSend);

    if (result.success) {
      Swal.fire({
        title: 'Success!',
        text: 'Plan added successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#648bdfff',
        background: '#f8f9fa'
      });

      setFormData({
        sectorName: "",
        cropName: "",
        area: "",
        farmSoilType: "",
        plantingDate: "",
        expectedHarvestDate: ""
      });
      setLocation({ lat: null, lng: null });
    } else {
      setError(result.error || 'Add plan failed');
    }
  };

  // In your Planning.jsx, update the useEffect:
  useEffect(() => {
    const fetchWeatherForPlans = async () => {
      const weatherPromises = plans.map(async (plan) => {
        if (plan.farmLat && plan.farmLng) {
          try {
            // Use the new function that doesn't set global state
            const weather = await fetchWeatherForPlan(plan.farmLat, plan.farmLng);
            return { planId: plan.id, weather };
          } catch (error) {
            console.error(`Failed to fetch weather for plan ${plan.id}:`, error);
            return { planId: plan.id, weather: null };
          }
        }
        return { planId: plan.id, weather: null };
      });

      try {
        const results = await Promise.all(weatherPromises);
        const weatherMap = {};
        results.forEach(result => {
          if (result.weather) {
            weatherMap[result.planId] = result.weather;
          }
        });
        setPlanWeather(weatherMap);
      } catch (error) {
        console.error('Error fetching weather for plans:', error);
      }
    };

    if (plans.length > 0) {
      fetchWeatherForPlans();
    }
  }, [plans, fetchWeatherForPlan]); // Add fetchWeatherForPlan to dependencies
  

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "planned": return "bg-yellow-100 text-yellow-700";
      case "planted": return "bg-blue-100 text-blue-700";
      case "harvested": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
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
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {["crop-plan", "schedule", "resources"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all ${activeTab === tab
                  ? "border-b-2 border-iot-primary text-iot-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "crop-plan" && (
              <div className="animate-fade-in">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sector Name</label>
                      <input
                        type="text"
                        name="sectorName"
                        maxLength="1"
                        value={formData.sectorName.toUpperCase()}
                        onChange={handleInputChange}
                        placeholder="Enter sector type (A, B, C...)"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                      <select
                        name="cropName"
                        value={formData.cropName}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary"
                      >
                        <option value="">Select Crop Type</option>
                        <option value="wheat">Wheat</option>
                        <option value="corn">Corn</option>
                        <option value="rice">Rice</option>
                        <option value="soybean">Soybean</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Area (hectares)</label>
                      <input
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="Enter area in hectares"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Soil Type</label>
                      <select
                        name="farmSoilType"
                        value={formData.farmSoilType}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary"
                      >
                        <option value="">Select Soil Type</option>
                        <option value="loamy">Loamy</option>
                        <option value="sandy">Sandy</option>
                        <option value="clay">Clay</option>
                        <option value="silt">Silt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Planting Date</label>
                      <input
                        type="date"
                        name="plantingDate"
                        value={formData.plantingDate}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Harvest Date</label>
                      <input
                        type="date"
                        name="expectedHarvestDate"
                        value={formData.expectedHarvestDate}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-iot-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Farm Location</label>
                      <LocationPicker location={location} setLocation={setLocation} />
                      {location.lat && location.lng && (
                        <p className="text-sm text-gray-600">Selected: Latitude {location.lat}, Longitude {location.lng}</p>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-400 transition-colors">
                    Save Crop Plan
                  </button>
                </form>

                {/* Show Saved Plans */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Your Plans</h3>
                  <ul className="space-y-3">
                    {plans.map((plan) => {
                      const weather = planWeather[plan.id];
                      return (
                        <li
                          key={plan.id}
                          className="relative p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col gap-2"
                        >
                          {/* Status Badge - top right */}
                          <span
                            className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(plan.status)}`}
                          >
                            {plan.status}
                          </span>

                          {/* Title */}
                          <h3 className="text-lg font-semibold text-gray-800">
                            🌱 {plan.cropName}
                          </h3>

                          {/* Sector */}
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                            Sector {plan.sectorName}
                          </span>

                          {/* Weather Information */}
                          {weather && (
                            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                              <img
                                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                                alt={weather.weather[0].description}
                                className="w-8 h-8"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                  {Math.round(weather.main.temp)}°C • {weather.weather[0].description}
                                </p>
                                <div className="flex gap-3 text-xs text-gray-600">
                                  <span>💧 {weather.main.humidity}%</span>
                                  <span>💨 {weather.wind.speed} m/s</span>
                                  <span>🌡️ Feels like {Math.round(weather.main.feels_like)}°C</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {!weather && plan.farmLat && plan.farmLng && (
                            <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                              <p className="text-xs text-yellow-700">Weather data loading...</p>
                            </div>
                          )}

                          {/* Plan Details */}
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">📅 Planting:</span> {plan.plantingDate}
                            </p>
                            <p>
                              <span className="font-medium">🌍 Area:</span> {plan.area} ha
                            </p>
                            <p>
                              <span className="font-medium">🪨 Soil:</span> {plan.farmSoilType}
                            </p>
                            <p>
                              <span className="font-medium">🍂 Expected Harvest:</span>{" "}
                              {plan.expectedHarvestDate}
                            </p>
                            {/* Location Display */}
                            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm font-medium text-blue-800 flex items-center gap-1">
                                📍 Location:
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {planLocations[plan.id] || 'Loading location...'}
                              </p>
                            </div>
                          </div>

                          {/* Weather Recommendations */}
                          {weather && weather.main.temp > 35 && (
                            <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                              <p className="text-xs text-orange-700 font-medium">
                                ⚠️ High temperature alert - Ensure adequate irrigation
                              </p>
                            </div>
                          )}

                          {weather && weather.weather[0].main === 'Rain' && (
                            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-xs text-blue-700 font-medium">
                                🌧️ Rain expected - Adjust irrigation schedule
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">IoT-Optimized Planting Schedule</h3>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Your Plans</h3>
                  {plans.length > 0 ? (
                    <ul className="space-y-3">
                      {plans.map((plan) => (
                        <li
                          key={plan.id}
                          className="relative p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col gap-2"
                        >
                          <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(plan.status)}`}>
                            {plan.status}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-800">🌱 {plan.cropName}</h3>
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                            Sector {plan.sectorName}
                          </span>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">📅 Planting:</span> {plan.plantingDate}</p>
                            <p><span className="font-medium">🌍 Area:</span> {plan.area} ha</p>
                            <p><span className="font-medium">🪨 Soil:</span> {plan.farmSoilType}</p>
                            <p><span className="font-medium">🍂 Expected Harvest:</span> {plan.expectedHarvestDate}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">Generate a crop plan first to see schedule.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "resources" && (

              <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Resource Allocation</h3>
                {plans.length > 0 ? (
                  <ul className="space-y-3">
                    {plans.map((plan) => (
                      <li
                        key={plan.id}
                        className="relative p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col gap-2"
                      >
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                            Sector {plan.sectorName}
                          </span>
                        
                        {plan.area * 500}L water, {plan.area * 20}kg fertilizer, {plan.area * 5}kg seeds
                      </li>
                      

                    ))}
                  </ul>
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