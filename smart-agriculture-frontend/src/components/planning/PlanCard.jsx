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
  faGlobeAmericas
} from "@fortawesome/free-solid-svg-icons";

const PlanCard = ({ 
  plan, 
  weather, 
  location, 
  onEdit, 
  onDelete,
  showAlerts = true 
}) => {

  const { 
    isDateWithinDays, 
    isDateToday, 
    formatDate, 
    calculateGrowthProgress, 
    calculateTimeRemaining,
    getProgressColor,
    getProgressTextColor,
    isReadyForHarvest,
    getGrowthStage
  } = useDateUtils();

  // Calculate real growth progress
  const growthProgress = Math.round(calculateGrowthProgress(plan.plantingDate, plan.expectedHarvestDate));
  const progressColor = getProgressColor(growthProgress);
  const progressTextColor = getProgressTextColor(growthProgress);
  const isHarvestReady = isReadyForHarvest(plan.plantingDate, plan.expectedHarvestDate);
  const growthStage = getGrowthStage(growthProgress);

  // Helper function to get status color and icon
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "planned": 
        return {
          bg: "bg-gradient-to-br from-amber-500 to-orange-500",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: faClipboardList,
          color: "text-amber-100"
        };
      case "planted": 
        return {
          bg: "bg-gradient-to-br from-blue-500 to-cyan-500",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: faSeedling,
          color: "text-blue-100"
        };
      case "growing": 
        return {
          bg: "bg-gradient-to-br from-emerald-500 to-green-500",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: faChartLine,
          color: "text-emerald-100"
        };
      case "harvested": 
        return {
          bg: "bg-gradient-to-br from-green-500 to-lime-500",
          text: "text-green-700",
          border: "border-green-200",
          icon: faCheckCircle,
          color: "text-green-100"
        };
      case "cancelled": 
        return {
          bg: "bg-gradient-to-br from-red-500 to-rose-500",
          text: "text-red-700",
          border: "border-red-200",
          icon: faTimesCircle,
          color: "text-red-100"
        };
      default: 
        return {
          bg: "bg-gradient-to-br from-gray-500 to-slate-500",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: faClipboardList,
          color: "text-gray-100"
        };
    }
  };

  const statusConfig = getStatusConfig(plan.status);

  return (
    <div className="group relative bg-white/80 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-6">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-lg ${statusConfig.bg}`}>
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={statusConfig.icon} className="w-4 h-4" />
                  {plan.status || 'Planned'}
                </span>
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                  Sector {plan.sectorName}
                </span>
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faSeedling} className="text-white text-xl" />
              </div>
              {plan.cropName?.charAt(0).toUpperCase() + plan.cropName?.slice(1)}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              Cultivation plan in progress
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(plan)}
              className="group relative p-3 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              title="Edit Plan"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <FontAwesomeIcon icon={faEdit} className="w-5 h-5 relative z-10" />
            </button>
            <button
              onClick={() => onDelete(plan.id)}
              className="group relative p-3 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-2xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              title="Delete Plan"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <FontAwesomeIcon icon={faTrash} className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </div>

        {/* Plan Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Area Card */}
          <div className="group/card bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faRulerCombined} className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Area</p>
                <p className="text-xl font-black text-gray-800">{plan.area} hectares</p>
              </div>
            </div>
          </div>

          {/* Soil Type Card */}
          <div className="group/card bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faMountain} className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Soil Type</p>
                <p className="text-xl font-black text-gray-800 capitalize">{plan.farmSoilType}</p>
              </div>
            </div>
          </div>

          {/* Planting Date Card */}
          <div className="group/card bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Planting</p>
                <p className="text-xl font-black text-gray-800">{plan.plantingDate}</p>
              </div>
            </div>
          </div>

          {/* Harvest Date Card */}
          <div className="group/card bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faSeedling} className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Harvest</p>
                <p className="text-xl font-black text-gray-800">{plan.expectedHarvestDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather and Location Section */}
        {plan.status !== "harvested" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Weather Information */}
            <div>
              {weather ? (
                <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCloudSun} className="text-blue-500" />
                      Live Weather
                    </h4>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt={weather.weather[0].description}
                        className="w-10 h-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-black text-gray-800">
                        {Math.round(weather.main.temp)}°C
                      </p>
                      <p className="text-sm text-gray-600 capitalize font-medium">
                        {weather.weather[0].description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white/50 rounded-xl">
                      <FontAwesomeIcon icon={faTint} className="text-blue-500 mb-1 text-sm" />
                      <p className="text-xs font-semibold text-gray-500 mb-1">Humidity</p>
                      <p className="text-sm font-black text-blue-600">{weather.main.humidity}%</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-xl">
                      <FontAwesomeIcon icon={faWind} className="text-green-500 mb-1 text-sm" />
                      <p className="text-xs font-semibold text-gray-500 mb-1">Wind</p>
                      <p className="text-sm font-black text-green-600">{weather.wind.speed} m/s</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-xl">
                      <FontAwesomeIcon icon={faTemperatureHigh} className="text-orange-500 mb-1 text-sm" />
                      <p className="text-xs font-semibold text-gray-500 mb-1">Feels like</p>
                      <p className="text-sm font-black text-orange-600">{Math.round(weather.main.feels_like)}°C</p>
                    </div>
                  </div>
                </div>
              ) : plan.farmLat && plan.farmLng ? (
                <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 p-5 flex items-center justify-center shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-amber-700 font-bold">Loading weather data</p>
                      <p className="text-amber-600 text-sm">Fetching current conditions...</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Location Information */}
            
              {location && (
                <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border border-indigo-200/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faGlobeAmericas} className="text-white text-lg" />
                    </div>
                    <h4 className="font-bold text-gray-800">Farm Location</h4>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium bg-white/50 p-3 rounded-xl">
                    {location}
                  </p>
                </div>
              )}
            
          </div>
        )}

        {/* Weather Alerts */}
        {showAlerts && weather && plan.status !== "harvested" && (
          <div className="space-y-3">
            {weather.main.temp > 35 && (plan.status === 'planted' || (plan.status === 'planned' && isDateWithinDays(plan.plantingDate, 1))) && (
              <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-orange-800">High Temperature Alert</p>
                    <p className="text-sm text-orange-700">Ensure adequate irrigation for optimal growth</p>
                  </div>
                </div>
              </div>
            )}

            {weather.weather[0].main === 'Rain' && plan.status === 'planted' && isDateWithinDays(plan.plantingDate, 1) && (
              <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCloudRain} className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">Rain Expected</p>
                    <p className="text-sm text-blue-700">Adjust irrigation schedule accordingly</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
{/* Enhanced Progress Bar */}
{(plan.status === "planted" || plan.status === "growing") && (
  <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <FontAwesomeIcon icon={faChartLine} className={progressTextColor} />
        Growth Timeline • {growthStage}
      </span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${progressTextColor}`}>
          {growthProgress}%
        </span>
        {isHarvestReady && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold animate-pulse">
            🎉 Ready!
          </span>
        )}
      </div>
    </div>
    
    {/* Progress Bar */}
    <div className="w-full bg-white rounded-full h-3 mb-3 border border-gray-300 ">
      <div 
        className={`bg-gradient-to-r ${progressColor} h-3 rounded-full transition-all duration-1000 ease-out relative`}
        style={{ width: `${growthProgress}%` }}
      >
        {/* Progress indicator dot */}
        {growthProgress > 0 && growthProgress < 100 && (
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-current rounded-full shadow-sm"></div>
        )}
      </div>
    </div>
    
    {/* Timeline Details */}
    <div className="grid grid-cols-3 gap-4 text-xs mb-3">
      <div className="text-center">
        <div className="font-semibold text-gray-700">Planted</div>
        <div className="text-gray-500">{formatDate(plan.plantingDate)}</div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-700">Current</div>
        <div className="text-gray-500">{growthProgress}% Complete</div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-700">Harvest</div>
        <div className="text-gray-500">{formatDate(plan.expectedHarvestDate)}</div>
      </div>
    </div>
    
    {/* Status Message */}
    <div className="text-center">
      {isHarvestReady ? (
        <span className="text-xs bg-green-100 text-green-800 px-3 py-2 rounded-full font-semibold inline-block">
          ✅ Harvest Ready! Perfect time for collection
        </span>
      ) : (
        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-2 rounded-full font-semibold inline-block">
          ⏱️ {calculateTimeRemaining(plan.expectedHarvestDate)}
        </span>
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default PlanCard;