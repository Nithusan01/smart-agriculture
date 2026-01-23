// components/PlanCard.jsx
import useDateUtils from "../hooks/useDateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSeedling,
  faMapMarkerAlt,
  faCalendarAlt,
  faMountain,
  faRulerCombined,
  faCloudSun,
  faTemperatureHigh,
  faWind,
  faTint,
  faExclamationTriangle,
  faCloudRain,
  faEdit,
  faTrash,
  faClipboardList,
  faCheckCircle,
  faTimesCircle,
  faChartLine,
  faGlobeAmericas,
  faDroplet,
  faGaugeHigh,
  faInfoCircle,
  faCalendarDay,
  faLeaf
} from "@fortawesome/free-solid-svg-icons";
import { useDeviceAuth } from "../../contexts/DeviceAuthContext";
import { useState } from "react";
import DeviceCard from "../device/DeviceCard";
import useDeviceRealtime from "../hooks/useDeviceRealtime";
import { 
  Droplets,
  Thermometer,
} from 'lucide-react';
import { useDetectedDiseases } from "../../contexts/DetectedDiseaseContext";
import {useDiseases} from '../../contexts/DiseaseContext'
import { useEffect } from "react";

const PlanCard = ({
  plan,
  weather,
  location,
  onEdit,
  onDelete,
  showAlerts = true,
}) => {
  const {
    isDateWithinDays,
    formatDate,
    calculateGrowthProgress,
    calculateTimeRemaining,
    getProgressColor,
    getProgressTextColor,
    isReadyForHarvest,
    getGrowthStage
  } = useDateUtils();

  // create disease 
  const {createDetectedDisease,getdetectionsByplan} = useDetectedDiseases();
  const {diseases} = useDiseases();

   const [formData, setFormData] = useState({
    cultivationPlanId: plan.id,
    diseaseId: "",
    imageUrl: "",
    confidence: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [disease,setDisease]= useState([]);
  const [showAddForm,setShowAddForm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {

      const res = await createDetectedDisease(formData);


      setMessage(res.data.message);
      setFormData({
        cultivationPlanId: plan.id,
        diseaseId: "",
        imageUrl: "",
        confidence: "",
        notes: "",
      });
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to submit detected disease")
      
    } finally {
      setLoading(false);
    }
  };
const fetchDiseases = async(id)=>{
  try {
    const res = await getdetectionsByplan(id);
     setDisease(res?.data?.data)
    
    
  } catch (error) {
    setMessage(error.response.data.message)
    
  }
}
useEffect(()=>{
  fetchDiseases(plan.id)

},[disease.length])
  // Calculate real growth progress
  const growthProgress = Math.round(calculateGrowthProgress(plan.plantingDate, plan.expectedHarvestDate));
  const isHarvestReady = isReadyForHarvest(plan.plantingDate, plan.expectedHarvestDate);
  const growthStage = getGrowthStage(growthProgress);

  // Context - only get what you need
  const { devices, selectedDevice, setSelectedDevice, handleRemoveDevice } = useDeviceAuth();
  const device = devices.find(d => d.id === plan.deviceId);
  const { latest } = useDeviceRealtime(selectedDevice);
  

  // Custom progress color function
  const getCustomProgressColor = (progress) => {
    if (progress < 25) {
      return {
        gradient: "from-rose-400 via-pink-400 to-orange-400",
        text: "text-rose-600",
        bg: "bg-gradient-to-r from-rose-50 to-orange-50"
      };
    } else if (progress < 50) {
      return {
        gradient: "from-amber-400 via-yellow-400 to-lime-400",
        text: "text-amber-600",
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50"
      };
    } else if (progress < 75) {
      return {
        gradient: "from-emerald-400 via-teal-400 to-cyan-400",
        text: "text-emerald-600",
        bg: "bg-gradient-to-r from-emerald-50 to-teal-50"
      };
    } else {
      return {
        gradient: "from-green-400 via-emerald-500 to-teal-500",
        text: "text-green-600",
        bg: "bg-gradient-to-r from-green-50 to-emerald-50"
      };
    }
  };

  const progressColors = getCustomProgressColor(growthProgress);
  const progressColor = getProgressColor ? getProgressColor(growthProgress) : progressColors.gradient;
  const progressTextColor = getProgressTextColor ? getProgressTextColor(growthProgress) : progressColors.text;

  // Helper function to get status color and icon
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "planned":
        return {
          bg: "bg-gradient-to-r from-amber-400 to-orange-400",
          icon: faClipboardList,
          iconColor: "text-amber-100",
          lightBg: "bg-gradient-to-r from-amber-50 to-orange-50"
        };
      case "planted":
        return {
          bg: "bg-gradient-to-r from-blue-400 to-indigo-400",
          icon: faSeedling,
          iconColor: "text-blue-100",
          lightBg: "bg-gradient-to-r from-blue-50 to-indigo-50"
        };
      case "growing":
        return {
          bg: "bg-gradient-to-r from-emerald-400 to-teal-400",
          icon: faChartLine,
          iconColor: "text-emerald-100",
          lightBg: "bg-gradient-to-r from-emerald-50 to-teal-50"
        };
      case "harvested":
        return {
          bg: "bg-gradient-to-r from-green-400 to-lime-400",
          icon: faCheckCircle,
          iconColor: "text-green-100",
          lightBg: "bg-gradient-to-r from-green-50 to-lime-50"
        };
      case "cancelled":
        return {
          bg: "bg-gradient-to-r from-rose-400 to-red-400",
          icon: faTimesCircle,
          iconColor: "text-rose-100",
          lightBg: "bg-gradient-to-r from-rose-50 to-red-50"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-slate-400 to-gray-400",
          icon: faClipboardList,
          iconColor: "text-slate-100",
          lightBg: "bg-gradient-to-r from-slate-50 to-gray-50"
        };
    }
  };

  const statusConfig = getStatusConfig(plan.status);

  return (
    <div className="group relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl border border-gray-200/70 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 p-8">
      {/* Top decorative gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-t-3xl"></div>

      {/* Subtle corner accents */}
      <div className="absolute top-4 left-4 w-3 h-3 bg-emerald-300/30 rounded-full blur-sm"></div>
      <div className="absolute top-4 right-4 w-3 h-3 bg-blue-300/30 rounded-full blur-sm"></div>

      <div className="relative z-10">
        {/* Header Section - Enhanced */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-6">
          <div className="flex-1">
            {/* Crop title and basic info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50 flex-shrink-0">
                <FontAwesomeIcon icon={faSeedling} className="text-white text-3xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                      Sector {plan.sectorName}
                    </span>
                  </span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faRulerCombined} className="w-3 h-3" />
                      {plan.area} hectares
                    </span>
                  </span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold shadow-md">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faMountain} className="w-3 h-3" />
                      {plan.farmSoilType}
                    </span>
                  </span>
                  <span  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md ${statusConfig.bg} hover:opacity-90 transition-opacity duration-300 min-w-[120px] flex items-center justify-center gap-2`}>
                     <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={statusConfig.icon} className="w-4 h-4" />
                    <span>{plan.status || 'Planned'}</span>
                    </span>
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
                  {plan.cropName?.charAt(0).toUpperCase() + plan.cropName?.slice(1)}
                </h3>
              </div>
            </div>

            {/* Date cards */}
              {/* Location row - full width */}
              {location && (
                <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/60 rounded-xl border border-indigo-200/70 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faGlobeAmericas} className="text-white text-xs" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500 mb-0.5">Farm Location</p>
                      <p className="text-xs font-medium text-gray-700 truncate" title={location}>
                        {location}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(plan)}
                className="group relative p-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                title="Edit Plan"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FontAwesomeIcon icon={faEdit} className="w-5 h-5 relative z-10" />
              </button>
              <button
                onClick={() => onDelete(plan.id)}
                className="group relative p-2.5 bg-gradient-to-r from-rose-400 to-red-400 text-white rounded-xl hover:from-rose-500 hover:to-red-500 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                title="Delete Plan"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FontAwesomeIcon icon={faTrash} className="w-5 h-5 relative z-10" />
              </button>
            </div>
          </div>
        </div>

        {/* Weather and Location Section */}
        {plan.status !== "harvested" && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 mb-8">
            {/* Weather Information */}
            <div className="min-w-0">
              {weather ? (
                <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/60 rounded-2xl border border-blue-200/70 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Single horizontal row */}
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    {/* Left side: Icon and title */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                        <FontAwesomeIcon icon={faCloudSun} className="text-white text-sm" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm">Live Weather</h4>
                        <p className="text-xs text-gray-400 truncate">Current</p>
                      </div>
                    </div>

                    {/* Center: Temperature */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">
                          {Math.round(weather.main.temp)}°C
                        </p>
                        <p className="text-xs text-gray-500 capitalize truncate max-w-[80px]">
                          {weather.weather[0].description}
                        </p>
                      </div>
                      
                      <div className="hidden sm:block bg-white/80 rounded-lg p-2 shadow-sm">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faTemperatureHigh} className="text-orange-500 text-xs" />
                          <span className="text-xs font-semibold text-gray-500">Feels</span>
                        </div>
                        <p className="text-sm font-bold text-orange-600">
                          {Math.round(weather.main.feels_like)}°C
                        </p>
                      </div>
                    </div>

                    {/* Right side: Metrics icons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faTint} className="text-blue-500 text-xs" />
                          <span className="text-xs font-bold text-blue-600">{weather.main.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faWind} className="text-emerald-500 text-xs" />
                          <span className="text-xs font-bold text-emerald-600">{weather.wind.speed}m/s</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faGaugeHigh} className="text-rose-500 text-xs" />
                          <span className="text-xs font-bold text-rose-600">{weather.main.pressure}</span>
                        </div>
                      </div>
                      
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt={weather.weather[0].description}
                        className="w-6 h-6 sm:w-8 sm:h-8"
                      />
                    </div>
                  </div>

                  {/* Mobile feels like and metrics */}
                  <div className="sm:hidden mt-2 pt-2 border-t border-blue-100/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faTemperatureHigh} className="text-orange-500 text-xs" />
                        <span className="text-xs font-semibold text-gray-500">Feels like:</span>
                        <span className="text-xs font-bold text-orange-600 ml-1">{Math.round(weather.main.feels_like)}°C</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faTint} className="text-blue-500 text-xs" />
                          <span className="text-xs font-bold text-blue-600">{weather.main.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faWind} className="text-emerald-500 text-xs" />
                          <span className="text-xs font-bold text-emerald-600">{weather.wind.speed}m/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : plan.farmLat && plan.farmLng ? (
                <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 rounded-2xl border border-amber-200/70 p-3 sm:p-4 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-amber-700 font-medium text-xs">Loading weather...</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/60 rounded-2xl border border-gray-200/70 p-3 sm:p-4 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCloudSun} className="text-gray-400 text-sm" />
                    <span className="text-gray-600 font-medium text-xs">No weather data</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        {showAlerts && weather && plan.status !== "harvested" && (
          <div className="space-y-3 mb-6">
            {weather.main.temp > 20 && (plan.status === 'planted' || (plan.status === 'planned' && isDateWithinDays(plan.plantingDate, 1))) && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50/70 rounded-xl border border-orange-300/50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-700 text-sm">High Temperature Alert</p>
                    <p className="text-xs text-orange-600">Temperature is above 20°C. Ensure adequate irrigation for optimal growth.</p>
                  </div>
                </div>
              </div>
            )}

            {weather.weather[0].main === 'Rain' && plan.status === 'planted' && isDateWithinDays(plan.plantingDate, 1) && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50/70 rounded-xl border-l-3 border-blue-500 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCloudRain} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-700 text-sm">Rain Expected</p>
                    <p className="text-xs text-blue-600">Rain detected in forecast. Consider adjusting irrigation schedule.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Device Section */}
        {device && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            {/* DeviceCard now handles its own modal */}
            <DeviceCard
              key={device?.deviceId}
              device={device}
              isSelected={selectedDevice === device.deviceId}
              onSelect={() => {
                device.status === "active" 
                  ? setSelectedDevice(device.deviceId) 
                  : alert("⚠️ This device is inactive. Please contact the admin.");
              }}
              onRemove={() => handleRemoveDevice(device.deviceId)}
              // No onViewInfo prop needed anymore
            />
            
            {/* Device details section */}
            {selectedDevice === device.deviceId && (
              <div className="bg-gradient-to-br from-white/70 to-gray-50/70 rounded-2xl border border-gray-200/70 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Device Details</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage and monitor the device associated with this plan.
                  </p>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/80 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-gray-500">Temperature</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{latest?.temperature || 0} °C</div>
                        {latest?.temperature < 20 ? (
                          <div className="text-xs text-gray-500 mt-1">Cool</div>
                        ) : ( latest?.temperature <= 30 ? ( 
                          <div className="text-xs text-gray-500 mt-1">Ideal for crops</div>
                        ) : ( latest?.temperature > 30 && (latest?.temperature <= 45) ) ? (
                          <div className="text-xs text-gray-500 mt-1">Warm</div>  
                        ) : (latest?.temperature > 45) ? (  
                          <div className="text-xs text-gray-500 mt-1">Hot</div>
                        ) : (
                          <div className="text-xs text-gray-500 mt-1">N/A</div>
                        ))}
                      </div>
                      
                      <div className="bg-white/80 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-500">Humidity</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{latest?.humidity || 0}%</div>
                        {latest?.humidity < 50 ? (
                          <div className="text-xs text-gray-500 mt-1">Low humidity</div>
                        ) : ( latest?.humidity <= 80 ? (
                          <div className="text-xs text-gray-500 mt-1">Ideal for crops</div>
                        ) : ( latest?.humidity > 80 && (latest?.humidity <= 100) ) ? (
                          <div className="text-xs text-gray-500 mt-1">High humidity</div>
                        ) : (
                          <div className="text-xs text-gray-500 mt-1">N/A</div>
                        ))}
                      </div>
                    </div>
                    
                    {/* <div className="pt-4 border-t border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Weather Condition</div>
                          <div className="text-lg font-semibold text-gray-900">Partly Cloudy</div>
                        </div>
                        <div className="text-3xl">⛅</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Perfect conditions for outdoor farming activities
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Progress Bar */}
        {(plan.status === "planted" || plan.status === "growing") && (
          <div className={`rounded-2xl border border-gray-200/60 p-5 sm:p-6 shadow-sm ${progressColors.bg}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <FontAwesomeIcon icon={faChartLine} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-base sm:text-lg">Growth Progress</h4>
                  <p className="text-sm text-gray-600">{growthStage} • {growthProgress}% complete</p>
                </div>
              </div>

              {isHarvestReady ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow-md">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span className="text-sm font-semibold">Ready for Harvest</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl shadow-md">
                  <FontAwesomeIcon icon={faCalendarDay} />
                  <span className="text-sm font-semibold">{calculateTimeRemaining(plan.expectedHarvestDate)}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
              <div className="w-full bg-white/80 rounded-full h-2.5 shadow-inner">
                <div
                  className={`bg-gradient-to-r ${progressColor} h-2.5 rounded-full transition-all duration-1000 ease-out relative`}
                  style={{ width: `${growthProgress}%` }}
                >
                  {growthProgress > 0 && growthProgress < 100 && (
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-3 border-current rounded-full shadow-lg"></div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span className="font-medium">Planting: {formatDate(plan.plantingDate)}</span>
                <span className="font-medium">Harvest: {formatDate(plan.expectedHarvestDate)}</span>
              </div>
            </div>

            
            {/* Timeline Summary */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/90 rounded-xl p-3 border border-gray-200/50">
                <p className="text-xs font-semibold text-gray-500 mb-1">Growth Stage</p>
                <p className="text-sm font-bold text-gray-800">{growthStage}</p>
              </div>
              <div className="bg-white/90 rounded-xl p-3 border border-gray-200/50">
                <p className="text-xs font-semibold text-gray-500 mb-1">Progress</p>
                <p className="text-sm font-bold text-gray-800">{growthProgress}% complete</p>
              </div>
              <div className="bg-white/90 rounded-xl p-3 border border-gray-200/50">
                <p className="text-xs font-semibold text-gray-500 mb-1">Health Status</p>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-sm" />
                  {growthProgress > 75 ? "Excellent" : growthProgress > 50 ? "Good" : "Growing"}
                </p>
              </div>
            </div> */}
          </div>
          
        )}

        {/* <div className="rounded-2xl border border-gray-200/60 p-5 sm:p-6 shadow-sm bg-white/80 mt-6"> */}
              
                
               <div className="mt-6 bg-gradient-to-br from-white to-emerald-50 rounded-2xl border border-emerald-200 p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
    <FontAwesomeIcon icon={faLeaf} className="text-emerald-500" />
    Detected Disease
  </h3>
  <span>
    <button
    key={plan.id}
    onClick={()=>setShowAddForm(!showAddForm)}
    className="">
      detect disease
    </button>
  </span>

  {message && (
    <p className="text-sm text-emerald-600 mb-3">{message}</p>
  )}
{showAddForm && (
  <form onSubmit={handleSubmit} className="space-y-3">

    <select
     name="diseaseId" 
     value={formData.diseaseId}
     onChange={handleChange}
     className="w-full rounded-lg border px-3 py-2 text-sm"
    
     
     >
          <option value="" className="text-gray-700">select the disease</option>
      {diseases.map((disease) =>(
    <option key={disease.id} value={disease.id} className="text-gray-700">
     {disease.diseaseName && ` (${disease.diseaseName} )`}
     </option>
    ))}
    </select>
     {/* <input
    //   type="text"
    //   name="diseaseId"
    //   placeholder="Disease name or ID"
    //   value={formData.diseaseId}
    //   onChange={handleChange}
    //   className="w-full rounded-lg border px-3 py-2 text-sm"
    // /> */}

    <input
      type="text"
      name="imageUrl"
      placeholder="Image URL (optional)"
      value={formData.imageUrl}
      onChange={handleChange}
      className="w-full rounded-lg border px-3 py-2 text-sm"
    />

    <input
      type="number"
      name="confidence"
      placeholder="Confidence (%)"
      value={formData.confidence}
      onChange={handleChange}
      min="0"
      max="100"
      className="w-full rounded-lg border px-3 py-2 text-sm"
    />

    {/* <select
      name="status"
      value={formData.status}
      onChange={handleChange}
      className="w-full rounded-lg border px-3 py-2 text-sm"
    >
      <option value="detected">Detected</option>
      <option value="confirmed">Confirmed</option>
      <option value="treated">Treated</option>
    </select> */}

    <textarea
      name="notes"
      placeholder="Additional notes"
      value={formData.notes}
      onChange={handleChange}
      className="w-full rounded-lg border px-3 py-2 text-sm"
    />

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-semibold transition"
    >
      {loading ? "Saving..." : "Save Disease Info"}
    </button>
  </form> )}
  <div className="mt-6 bg-gradient-to-br from-white to-emerald-50 rounded-2xl border border-emerald-200 p-6">

    <div className="mt-6 overflow-x-auto">
  <h3 className="font-semibold text-gray-700 mb-2">Detected Diseases</h3>
  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
    <thead>
      <tr className="bg-gray-100">
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Disease Name</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">symptoms</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">treatment</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Confidence (%)</th>
      </tr>
    </thead>
    <tbody>
      {disease.length > 0 ? (
        disease.map((d) => (
          <tr key={d.id} className="border-t border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2 text-sm text-gray-700">{d.disease.diseaseName}</td>
            {/* <td className="px-4 py-2 text-sm text-gray-700">
              {d.imageUrl ? (
                <img src={d.imageUrl} alt="disease" className="w-12 h-12 object-cover rounded" />
              ) : (
                "-"
              )}
            </td> */}
            <td className="px-4 py-2 text-sm text-gray-700">{d.disease.symptoms}</td>
            <td className="px-4 py-2 text-sm text-gray-700">{d.disease.treatment}</td>
            <td className="px-4 py-2 text-sm text-gray-700">{d.status}</td>
            <td className="px-4 py-2 text-sm text-gray-700">{d.confidence || "-"}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="px-4 py-2 text-center text-gray-500 text-sm">
            No detected diseases yet.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


    
  </div>
</div>

                
              


            {/* </div> */}

      </div>
    </div>
  );
};

export default PlanCard;