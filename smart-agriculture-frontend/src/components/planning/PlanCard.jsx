// components/PlanCard.jsx - Ultra Compact Version
import useDateUtils from "../hooks/useDateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from 'sweetalert2'

import {
  faSeedling,
  faMapMarkerAlt,
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
  faCheckCircle,
  faChartLine,
  faCalendarDay,
  faLeaf
} from "@fortawesome/free-solid-svg-icons";
import { useDeviceAuth } from "../../contexts/DeviceAuthContext";
import { useState, useEffect } from "react";
import useDeviceRealtime from "../hooks/useDeviceRealtime";
import { Droplets, Thermometer } from 'lucide-react';
import { useDetectedDiseases } from "../../contexts/DetectedDiseaseContext";
import { useDiseases } from '../../contexts/DiseaseContext'
import { useCultivationPlan } from "../../contexts/CultivationPlanContext";

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
    isReadyForHarvest,
    getGrowthStage
  } = useDateUtils();

  const { createDetectedDisease, getdetectionsByplan } = useDetectedDiseases();
  const { diseases } = useDiseases();
  const { deleteDevice } = useCultivationPlan();

  const [formData, setFormData] = useState({
    cultivationPlanId: plan.id,
    diseaseId: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [disease, setDisease] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteDevice = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Remove this device from this plan?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteDevice(id);
        Swal.fire('Removed!', 'Device removed successfully.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to remove device.', 'error');
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await createDetectedDisease(formData);

    if (!res.success) {
      setMessage(res.error);
      setLoading(false);
      return;
    }

    setMessage(res.message);
    setFormData({ cultivationPlanId: plan.id, diseaseId: "", notes: "" });
    setLoading(false);
    setShowAddForm(false);
  };

  const fetchDiseases = async (id) => {
    try {
      const res = await getdetectionsByplan(id);
      setDisease(res?.data?.data)
    } catch (error) {
      setMessage(error.response?.data?.message)
    }
  }

  useEffect(() => {
    fetchDiseases(plan.id)
  }, [disease.length])

  const growthProgress = Math.round(calculateGrowthProgress(plan.plantingDate, plan.expectedHarvestDate));
  const isHarvestReady = isReadyForHarvest(plan.plantingDate, plan.expectedHarvestDate);
  const growthStage = getGrowthStage(growthProgress);

  const { devices, selectedDevice, setSelectedDevice } = useDeviceAuth();
  const device = devices.find(d => d.id === plan.deviceId);
  const { latest } = useDeviceRealtime(selectedDevice);

  const getCustomProgressColor = (progress) => {
    if (progress < 25) return { gradient: "from-rose-400 to-orange-400" };
    else if (progress < 50) return { gradient: "from-amber-400 to-lime-400" };
    else if (progress < 75) return { gradient: "from-emerald-400 to-cyan-400" };
    else return { gradient: "from-green-400 to-teal-500" };
  };

  const progressColors = getCustomProgressColor(growthProgress);
  const progressColor = getProgressColor ? getProgressColor(growthProgress) : progressColors.gradient;

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "planned": return { bg: "bg-amber-500", icon: faMapMarkerAlt };
      case "planted": return { bg: "bg-blue-500", icon: faSeedling };
      case "growing": return { bg: "bg-emerald-500", icon: faChartLine };
      case "harvested": return { bg: "bg-green-500", icon: faCheckCircle };
      default: return { bg: "bg-slate-500", icon: faMapMarkerAlt };
    }
  };

  const statusConfig = getStatusConfig(plan.status);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faSeedling} className="text-white text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate">
                {plan.cropName?.charAt(0).toUpperCase() + plan.cropName?.slice(1)}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-white/90 bg-white/20 px-2 py-0.5 rounded">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  {plan.sectorName}
                </span>
                <span className="text-xs text-white/90 bg-white/20 px-2 py-0.5 rounded">
                  {plan.area} ha
                </span>
                <span className="text-xs text-white/90 bg-white/20 px-2 py-0.5 rounded">
                  <FontAwesomeIcon icon={faMountain} className="mr-1" />
                  {plan.farmSoilType}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`${statusConfig.bg} text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap`}>
              <FontAwesomeIcon icon={statusConfig.icon} className="mr-1" />
              {plan.status}
            </span>
            <button
              onClick={() => onEdit(plan)}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
            >
              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(plan.id)}
              className="p-2 bg-white/20 hover:bg-red-500/80 text-white rounded-lg transition-all"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Weather Info */}
        {weather && plan.status !== "harvested" && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCloudSun} className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Weather</p>
                  <p className="text-lg font-bold text-gray-800">{Math.round(weather.main.temp)}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faTint} className="text-blue-500" />
                  {weather.main.humidity}%
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faWind} className="text-emerald-500" />
                  {weather.wind.speed}m/s
                </span>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="w-8 h-8"
                />
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {showAlerts && weather && plan.status !== "harvested" && (
          <>
            {weather.main.temp > 20 && (plan.status === 'planted' || plan.status === 'growing') && (
              <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-3 flex items-start gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-orange-700">High Temperature</p>
                  <p className="text-xs text-orange-600">Ensure adequate irrigation</p>
                </div>
              </div>
            )}
            {weather.weather[0].main === 'Rain' && plan.status === 'planted' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 flex items-start gap-2">
                <FontAwesomeIcon icon={faCloudRain} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700">Rain Expected</p>
                  <p className="text-xs text-blue-600">Adjust irrigation schedule</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Device Section */}
        {device && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📡</span>
                <h4 className="text-sm font-bold text-gray-800">{device.deviceName}</h4>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDevice(device.deviceId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDevice === device.deviceId
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300"
                  }`}
                >
                  {selectedDevice === device.deviceId ? "Live" : "View"}
                </button>
                <button
                  onClick={() => handleDeleteDevice(plan.id)}
                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                </button>
              </div>
            </div>

            {selectedDevice === device.deviceId && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Temperature */}
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-semibold text-gray-500">Temp</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{latest?.temperature || "N/A"}°C</p>
                    <p className={`text-xs mt-1 font-medium ${
                      latest?.temperature < 20 ? "text-blue-600" :
                      latest?.temperature <= 30 ? "text-green-600" :
                      latest?.temperature <= 45 ? "text-orange-600" : "text-red-600"
                    }`}>
                      {latest?.temperature < 20 ? "Cool" :
                       latest?.temperature <= 30 ? "Ideal" :
                       latest?.temperature <= 45 ? "Warm" : " "}
                    </p>
                  </div>

                  {/* Humidity */}
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-gray-500">Humidity</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{latest?.humidity || "N/A" }%</p>
                    <p className={`text-xs mt-1 font-medium ${
                      latest?.humidity < 50 ? "text-orange-600" :
                      latest?.humidity <= 80 ? "text-green-600" : "text-blue-600"
                    }`}>
                      {latest?.humidity < 50 ? "Low" :
                       latest?.humidity <= 80 ? "Ideal" : ""}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-green-200">
                  <p className="text-xs text-gray-500">
                    Updated: <span className="font-semibold text-gray-700">
                      {latest ? new Date(latest.readingTime).toLocaleTimeString() : "Never"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Growth Progress */}
        {(plan.status === "planted" || plan.status === "growing") && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-emerald-600 text-sm" />
                <h4 className="text-sm font-bold text-gray-800">Growth: {growthProgress}%</h4>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isHarvestReady ? "bg-green-500 text-white" : "bg-blue-500 text-white"
              }`}>
                {isHarvestReady ? "Ready" : growthStage}
              </span>
            </div>

            <div className="w-full bg-white/80 rounded-full h-2 mb-2">
              <div
                className={`bg-gradient-to-r ${progressColor} h-2 rounded-full transition-all duration-1000`}
                style={{ width: `${growthProgress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>🌱 {formatDate(plan.plantingDate)}</span>
              <span>🌾 {formatDate(plan.expectedHarvestDate)}</span>
            </div>
          </div>
        )}

        {/* Disease Detection */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faLeaf} className="text-purple-600 text-sm" />
              <h4 className="text-sm font-bold text-gray-800">Diseases</h4>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                {disease.length}
              </span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all"
            >
              {showAddForm ? '−' : '+'}
            </button>
          </div>

          {message && (
            <div className="mb-2 p-2 bg-purple-100 border border-purple-300 rounded-lg text-xs text-purple-700">
              {message}
            </div>
          )}

          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-3 space-y-2 p-3 bg-white rounded-lg border border-purple-100">
              <select
                name="diseaseId"
                value={formData.diseaseId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Disease</option>
                {diseases.map((disease) => (
                  <option key={disease.id} value={disease.id}>{disease.diseaseName}</option>
                ))}
              </select>

              <textarea
                name="notes"
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 rounded-lg text-sm font-semibold transition-all"
              >
                {loading ? 'Saving...' : '💾 Save'}
              </button>
            </form>
          )}

          {disease.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {disease.map((d) => (
                <div key={d.id} className="bg-white rounded-lg p-2 border border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-800 flex-1">{d.disease.diseaseName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      d.status === 'detected' ? 'bg-yellow-100 text-yellow-700' :
                      d.status === 'confirmed' ? 'bg-red-100 text-red-700' :
                      d.status === 'treated' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{d.disease.symptoms}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(d.detectedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-gray-400">
              <FontAwesomeIcon icon={faLeaf} className="text-xl mb-1" />
              <p className="text-xs">No diseases detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlanCard;