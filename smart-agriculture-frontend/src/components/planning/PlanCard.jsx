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
import { useState, useEffect, useMemo } from "react";
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
    getGrowthStage,
    isDatePast,
    isDateFuture,
  } = useDateUtils();

  const { createDetectedDisease, getdetectionsByplan, editDetectionStatus } = useDetectedDiseases();
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
  const selectedDisease = diseases.find(disease => disease.id === formData.diseaseId)


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = async (id, status) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Change status to ${status}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    });
    if (result.isConfirmed) {
      try {
        const res = await editDetectionStatus(id, status);
        setMessage(res.message || "Status updated successfully" );
        fetchDiseases(plan.id);

      }
      catch (error) {
        setMessage(error.response?.data?.message || "Failed to update status");
      }
      finally {
       
        setTimeout(() => setMessage(""), 4000);
      }
    }
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
    fetchDiseases(plan.id);
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
  // const { latest } = useDeviceRealtime(selectedDevice);
  // Use array of device IDs for multiple device support
  const deviceIds = useMemo(() => {
    if (!device?.deviceId) return [];
    return [device.deviceId];
  }, [device?.deviceId]);

  // Use the hook with device IDs array
  const { data, connected, getDeviceData } = useDeviceRealtime(deviceIds);

  // Get data for this specific device
  const deviceData = device?.deviceId ? getDeviceData(device.deviceId) : { latest: null, history: [] };
  const latest = deviceData.latest;
  const latestTimestamp = latest ? new Date(latest.readingTime).getTime() : null;



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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-3"></div>
          <h3 className="text-base font-semibold text-gray-700">Loading Plans</h3>
        </div>
      </div>
    );
  }


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
                <span className="text-base">📡</span>
                <h4 className="text-sm font-bold text-gray-800">{device.deviceName}</h4>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <button
                  onClick={() => handleDeleteDevice(plan.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  <FontAwesomeIcon icon={faTrash} className=" text-lg" />
                </button>
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
        {plan.status === "planned" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 flex items-start gap-2">
            <FontAwesomeIcon icon={faCalendarDay} className="text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-700">Planned Cultivation</p>
              <p className="text-sm text-yellow-600">This cultivation plan is scheduled to start on <span className="font-semibold">{formatDate(plan.plantingDate)}</span>.</p>
            </div>
          </div>
        )}
        {plan.status !== "planned" && isDateWithinDays(plan.expectedHarvestDate, 7) && (
          <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-3 flex items-start gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-700">Harvest Approaching</p>
              <p className="text-sm text-green-600">The expected harvest date is on <span className="font-semibold">{formatDate(plan.expectedHarvestDate)}</span>. Prepare for harvest!</p>
            </div>
          </div>
        )}
        {plan.status !== "planned" && isDatePast(plan.expectedHarvestDate) && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3 flex items-start gap-2">
            <FontAwesomeIcon icon={faLeaf} className="text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Harvest Overdue</p>
              <p className="text-sm text-red-600">The expected harvest date was on <span className="font-semibold">{formatDate(plan.expectedHarvestDate)}</span>. Please take necessary actions!</p>
            </div>
          </div>
        )}
        {plan.status === "harvested" && (
          <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-3 flex items-start gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Cultivation Completed</p>
              <p className="text-sm text-gray-600">This cultivation plan has been successfully harvested on <span className="font-semibold">{formatDate(plan.expectedHarvestDate)}</span>.</p>
            </div>
          </div>
        )}

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
        {device && plan.status !== "harvested" && plan.status !== "planned" && latest && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📡</span>
                <h4 className="text-sm font-bold text-gray-800">{device.deviceName}</h4>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="flex gap-2">
                {latest && (() => {
                  // calculate if the device is live
                  const latestTimestamp = new Date(latest.readingTime).getTime();
                  const now = Date.now();
                  const diff = now - latestTimestamp;
                  const oneMinutes = 1 * 60 * 1000;

                  return diff <= oneMinutes; // true = live, false = offline
                })() ? (
                  <div className="flex items-center gap-2 rounded-lg border border-green-700 px-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Live Streaming</span>
                  </div>
                ) : (
                  <div className="flex items-center border border-gray-700 rounded-lg px-3 gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full "></div>
                    <span className="text-sm font-medium text-gray-500">No Live Data</span>
                  </div>
                )}
                <button
                  onClick={() => handleDeleteDevice(plan.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  <FontAwesomeIcon icon={faTrash} className=" text-lg" />
                </button>

                
              </div>

            </div>

            {device.deviceId && latest && (() => {
              // calculate if the device is live
              const latestTimestamp = new Date(latest.readingTime).getTime();
              const now = Date.now();
              const diff = now - latestTimestamp;
              const oneMinutes = 1 * 60 * 1000;

              return diff <= oneMinutes; // true = live, false = offline
            })() && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Temperature */}

                    <div className="bg-white rounded-lg p-4 border border-gray-400 relative">

                      {/* Badge */}
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-md ${latest?.temperature < 20 ? "bg-blue-100 text-blue-600" :
                          latest?.temperature <= 30 ? "bg-green-100 text-green-600" :
                            latest?.temperature <= 45 ? "bg-orange-100 text-orange-600" :
                              "bg-red-100 text-red-600"
                          }`}
                      >
                        {latest?.temperature < 20 ? "Cool" :
                          latest?.temperature <= 30 ? "Ideal" :
                            latest?.temperature <= 45 ? "Warm" : ""}
                      </span>

                      <div className="flex items-center gap-2 mb-1">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-gray-500">Temp</span>
                      </div>

                      <p className="text-2xl font-bold text-gray-900">
                        {latest?.temperature || "N/A"}°C
                      </p>

                    </div>

                    {/* Humidity */}
                    <div className="bg-white rounded-lg p-4 border border-gray-400 relative">

                      {/* Badge */}
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-md ${latest?.humidity < 50 ? "bg-orange-100 text-orange-600" :
                          latest?.humidity <= 80 ? "bg-green-100 text-green-600" :
                            "bg-blue-100 text-blue-600"
                          }`}
                      >
                        {latest?.humidity < 50 ? "Low" :
                          latest?.humidity <= 80 ? "Ideal" : ""}
                      </span>

                      <div className="flex items-center gap-2 mb-1">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-gray-500">Humidity</span>
                      </div>

                      <p className="text-2xl font-bold text-gray-900">
                        {latest?.humidity || "N/A"}%
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
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isHarvestReady ? "bg-green-500 text-white" : "bg-blue-500 text-white"
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
        {plan.status !== "harvested" && plan.status !== "planned" && (
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
                <>
                  <select
                    name="diseaseId"
                    value={formData.diseaseId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Disease</option>
                    {diseases.filter(d => (d.cropId === plan.cropId || d.cropId === null)).map((disease) => (
                      <option key={disease.id} value={disease.id}>{disease.diseaseName}  {disease.symptoms && `  • ${disease.symptoms} `}</option>


                    ))}
                  </select>
                  {formData.diseaseId && selectedDisease && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-800">
                        <strong>{selectedDisease.diseaseName}</strong>
                        {selectedDisease.symptoms && ` • ${selectedDisease.symptoms} `}
                        {selectedDisease.severity && ` • ${selectedDisease.severity}`}
                        {selectedDisease.imageUrl && (
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <img
                              src={selectedDisease.imageUrl}
                              alt={selectedDisease.diseaseName}
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/400x200?text=Disease+Image+Not+Available";
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">Reference image for identification</p>
                          </div>)}
                      </p>
                    </div>
                  )}

                </>

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
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${d.status === 'detected' ? 'bg-yellow-100 text-yellow-700' :
                        d.status === 'confirmed' ? 'bg-red-100 text-red-700' :
                          d.status === 'treated' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">symptoms: {d.disease.symptoms}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Detected Date : {new Date(d.detectedDate).toLocaleDateString()}
                    </p>
                   {d.resolvedDate && ( <p className="text-xs text-gray-400 mt-1">Resolved Date : {new Date(d?.resolvedDate).toLocaleDateString()}</p>)}
                    <div className="flex gap-2 mt-2">
                      {d.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(d.id, 'resolved')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 rounded-lg transition-all"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>

                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-400">
                <FontAwesomeIcon icon={faLeaf} className="text-xl mb-1" />
                <p className="text-xs">No diseases detected</p>
              </div>
            )}
          </div>)}
      </div>
    </div>
  )
}

export default PlanCard;