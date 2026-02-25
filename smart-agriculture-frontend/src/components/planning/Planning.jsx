// src/pages/Planning.jsx
import { useEffect, useState } from "react";
import { useCultivationPlan } from "../../contexts/CultivationPlanContext";
import Swal from 'sweetalert2'
import LocationPicker from "../common/LocationPicker";
import { useWeather } from "../../contexts/WeatherContext";
import { usePlanLocations } from "../hooks/usePlanLocations";
import { usePlanWeather } from "../hooks/usePlanWeather";
import { useLocation } from "../hooks/useLocation";
import useDateUtils from "../hooks/useDateUtils"
import PlanCard from "./PlanCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCrops } from "../../contexts/CropContext";
import { useDeviceAuth } from "../../contexts/DeviceAuthContext"; 
import {
  faMapMarkerAlt,
  faSeedling,
  faRulerCombined,
  faMountain,
  faClipboardList,
  faChartLine,
  faCheckCircle,
  faTimesCircle,
  faCalendarPlus,
  faHourglassEnd,
  faMapPin,
  faCheck,
  faClipboardCheck,
  faCalendarAlt,
  faSave,
  faPlusCircle,
  faArrowRight,
  faWheatAwn,
  faLeaf,
  faLayerGroup,
  faTintSlash,
  faCube,
  faWater,
  faMountainSun,
  faLocationDot,
  faRuler,
  faSpinner,
  faTag,
  faClock,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { removeDevice } from "../../services/planApi";

const Planning = () => {
  const { plans, loading, addPlan, editPlan, deletePlan, status, setStatus,error,setError,isLoading } = useCultivationPlan();
  const { crops, loading: cropsLoading, error: cropsError } = useCrops();
  const { devices,loading:devicesLoading } = useDeviceAuth();
  const { fetchWeatherForPlan } = useWeather();
  const [activeTab, setActiveTab] = useState("active crops");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [formData, setFormData] = useState({
    sectorName: "",
    cropId: "", // Use cropId to store the selected crop ID
    cropName: "", // This will be auto-filled based on cropId
    area: "",
    farmSoilType: "",
    plantingDate: "",
    expectedHarvestDate: "",
    status: "planned",
    deviceId: null,
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ expandedPlan, setExpandedPlan] = useState(false);
  

  // ✅ Custom reusable hooks
  const planLocations = usePlanLocations(plans);
  const planWeather = usePlanWeather(plans, fetchWeatherForPlan);
  const { locationAddress, isLoadingAddress } = useLocation(location.lat, location.lng)
  const { isDateWithinDays, isDateToday, formatDate } = useDateUtils();

  // Get selected crop details
  const selectedCrop = crops.find(crop => crop.id === formData.cropId);

const availableDevices = devices.filter(
  device => !plans.some(plan => plan.deviceId === device.id)
);


  // Update cropName and calculate harvest date when cropId changes
  useEffect(() => {
    if (selectedCrop) {
      setFormData(prev => ({
        ...prev,
        cropName: selectedCrop.cropName
      }));
          


      // If planting date is set, automatically calculate harvest date
      if (formData.plantingDate && selectedCrop.durationDays) {
        calculateHarvestDate(formData.plantingDate, selectedCrop.durationDays);
      }
    }
  }, [selectedCrop]);

  // Calculate harvest date when planting date changes
  useEffect(() => {
    if (formData.plantingDate && selectedCrop?.durationDays) {
      calculateHarvestDate(formData.plantingDate, selectedCrop.durationDays);
    }
  }, [formData.plantingDate]);

  // Function to calculate harvest date based on planting date and crop duration
  const calculateHarvestDate = (plantingDate, durationDays) => {
    if (!plantingDate || !durationDays) return;

    const planting = new Date(plantingDate);
    const harvestDate = new Date(planting);
    harvestDate.setDate(planting.getDate() + parseInt(durationDays));

    // Format to YYYY-MM-DD for input field
    const formattedHarvestDate = harvestDate.toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      expectedHarvestDate: formattedHarvestDate
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cropId") {
      // When crop is selected, update both cropId and cropName
      const selectedCrop = crops.find(crop => crop.id === value);
      setFormData(prev => ({
        ...prev,
        cropId: value,
        cropName: selectedCrop ? selectedCrop.cropName : ""
      }));

      // If planting date is already set, calculate harvest date immediately
      if (formData.plantingDate && selectedCrop?.durationDays) {
        calculateHarvestDate(formData.plantingDate, selectedCrop.durationDays);
      }
    } else if (name === "plantingDate") {
      // When planting date changes, update it and calculate harvest date if crop is selected
      setFormData(prev => ({
        ...prev,
        plantingDate: value
      }));

      if (value && selectedCrop?.durationDays) {
        calculateHarvestDate(value, selectedCrop.durationDays);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Start editing a plan
  const handleEditClick = (plan) => {
    setEditingPlan(plan.id);
    setIsEditing(true);
     setShowPlanForm(true);


    setFormData({
      sectorName: plan.sectorName || "",
      cropId: plan.cropId || "", // Use cropId from the plan
      cropName: plan.cropName || "",
      area: plan.area || "",
      farmSoilType: plan.farmSoilType || "",
      plantingDate: plan.plantingDate || "",
      expectedHarvestDate: plan.expectedHarvestDate || "",
      status: plan.status || "planned",
      deviceId: plan.deviceId || null,
    });
    setLocation({
      lat: plan.farmLat || null,
      lng: plan.farmLng || null
    });
    setActiveTab("crop-plan");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPlan(null);
    setIsEditing(false);
    setIsSubmitting(false);
    setFormData({
      sectorName: "",
      cropId: "",
      cropName: "",
      area: "",
      farmSoilType: "",
      plantingDate: "",
      expectedHarvestDate: "",
      status: "planned",
      deviceId: null,
    });
    setLocation({ lat: null, lng: null });
    setError("");
    setStatus("");
    setShowPlanForm(false);
  };

  // Handle form submission for both add and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    // Validate form - now check for cropId instead of cropName
    if (!formData.sectorName || !formData.cropId) {
      setError("Sector Name and Crop Selection are required");
      setIsSubmitting(false);
      return;
    }

    // Validate that planting date is set
    if (!formData.plantingDate) {
      setError("Planting date is required");
      setIsSubmitting(false);
      return;
    }
     if (formData.deviceId === '' || formData.deviceId === undefined) {
      formData.deviceId = null;
    }


    const dataToSend = {
      ...formData,
      farmLat: location.lat,
      farmLng: location.lng
    };

    try {
      let result;

      if (isEditing && editingPlan) {
        result = await editPlan(editingPlan, dataToSend);
      } else {
        result = await addPlan(dataToSend);
      }

      if (result.success) {
        Swal.fire({
          title: 'Success!',
          text: `Plan ${isEditing ? 'updated' : 'added'} successfully!`,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          background: '#f8f9fa'
        });
        handleCancelEdit();
      } else {
        setError(result.error || `${isEditing ? 'Update' : 'Add'} plan failed`);
        Swal.fire({
          title: 'Error!',
          text: result.error || `${isEditing ? 'Update' : 'Add'} plan failed`,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.message || 'An unexpected error occurred');
      Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsSubmitting(false);
       
    }
  };

  // Delete plan function
  const handleDeletePlan = async (planId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deletePlan(planId);
        Swal.fire('Deleted!', 'Your plan has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete plan.', 'error');
      }
    }
  };
 

  // Helper function to get emoji for crop type
  const getCropEmoji = (cropType) => {
    const emojiMap = {
      'Grain': '🌾',
      'Vegetable': '🥬',
      'Fruit': '🍎',
      'Legume': '🫘',
      'Tuber': '🥔',
      'Cereal': '🌽',
      'Seasonal': '🌱',
      'Perennial': '🌳',
      'Wheat': '🌾',
      'Corn': '🌽',
      'Rice': '🍚',
      'Soybean': '🫘'
    };
    return emojiMap[cropType] || '🌱';
  };

  // Calculate days until harvest (for display)
  const getDaysUntilHarvest = () => {
    if (!formData.plantingDate || !formData.expectedHarvestDate) return null;

    const today = new Date();
    const harvest = new Date(formData.expectedHarvestDate);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };
  if (isLoading) {
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
    <div className="min-h-screen bg-gray-100 py-8">
      <section id="planning" className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-start mt-12 pt-4">
          <h2 className="text-3xl font-bold text-black mb-2 pt-3">
            Cultivation Planning
          </h2>
          <p className="text-start text-gray-600 mb-8">
            Plan and manage your agricultural activities with IoT-powered insights and real-time weather data
          </p>
        </div>

        {/* Status Messages */}
        <div className="mb-8 space-y-3">
          {loading && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-blue-700 font-medium">Loading cultivation plans...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">!</span>
              </div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          )}

          {status && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-green-700 font-medium">{status}</span>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Enhanced Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-100/50">
            {["crop-plan", "active crops", "harvested"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-5 px-6 text-center font-semibold transition-all duration-300 relative ${activeTab === tab
                  ? "text-green-600 bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 bg-gray-100/50" >
            {activeTab === "crop-plan" && (
              <div className="space-y-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm ">
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 text-center sm:text-left">
  <div>
    <h3 className="text-2xl font-bold text-center text-gray-800">
      {isEditing ? 'Edit Crop Plan' : 'Create New Crop Plan'}
    </h3>
    <p className="text-gray-600  mt-1">
      {isEditing
        ? 'Update your cultivation plan details'
        : 'Fill in the details to create a new cultivation plan'
      }
    </p>
  </div>
  {isEditing && (
    <div className="flex gap-3 justify-center sm:justify-start">
      <button
        onClick={handleCancelEdit}
        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
      >
        <span>←</span>
        Cancel
      </button>
      <button
        onClick={() => handleDeletePlan(editingPlan)}
        className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
      >
        <span>🗑️</span>
        Delete
      </button>
    </div>
  )}
</div>

{!isEditing && (
<div className="flex justify-center">
  <button
    onClick={() => setShowPlanForm(!showPlanForm)}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
      showPlanForm 
        ? 'bg-red-500 hover:bg-red-600 text-white' 
        : 'bg-green-500 hover:bg-green-600 text-white'
    }`}
  >
    {showPlanForm ? (
      <>✕ Cancel</>
    ) : (
      <>+ Add New Crop Plan</>
    )}
  </button>
</div>
)}

 {showPlanForm && (
                // Compact Cultivation Plan Form
<form onSubmit={handleSubmit} className="space-y-6">
  <div className="space-y-6">
    {/* Basic Information Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Sector Name */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-cyan-300 transition-all">
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-sm" />
          </div>
          <span>Sector Name</span>
        </label>
        <input
          type="text"
          name="sectorName"
          value={formData.sectorName.toUpperCase()}
          onChange={handleInputChange}
          placeholder="e.g., NORTH-FIELD-A"
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-sm font-semibold"
          required
        />
      </div>

      {/* Crop Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 transition-all">
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faSeedling} className="text-white text-sm" />
          </div>
          <span>Crop Selection</span>
        </label>

        {cropsLoading ? (
          <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 text-green-600">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
              <span className="text-xs font-medium">Loading crops...</span>
            </div>
          </div>
        ) : (
          <>
            <select
              name="cropId"
              value={formData.cropId}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm cursor-pointer"
              required
              disabled={crops.length === 0}
            >
              <option value="">
                {crops.length === 0 ? 'No crops available' : `Select crop (${crops.length} available)`}
              </option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {getCropEmoji(crop.cropType)} {crop.cropName} - {crop.cropType}
                  {crop.durationDays && ` (${crop.durationDays} days)`}
                </option>
              ))}
            </select>

            {formData.cropId && selectedCrop && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-800">
                  <strong>{selectedCrop.cropName}</strong>
                  {selectedCrop.durationDays && ` • ${selectedCrop.durationDays} days`}
                  {selectedCrop.waterRequirement && ` • ${selectedCrop.waterRequirement}`}
                </p>
              </div>
            )}

            {crops.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">No crops available. Add crops first.</p>
            )}
          </>
        )}
      </div>

      {/* Area Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-all">
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faRulerCombined} className="text-white text-sm" />
          </div>
          <span>Land Area</span>
        </label>
        <div className="relative">
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full p-3 pr-20 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
            min="0"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
            hectares
          </span>
        </div>
      </div>

      {/* Soil Type */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faMountain} className="text-white text-sm" />
          </div>
          <span>Soil Type</span>
        </label>
        <select
          name="farmSoilType"
          value={formData.farmSoilType}
          onChange={handleInputChange}
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm cursor-pointer"
        >
          <option value="">Select soil type...</option>
          <option value="Loamy">🌱 Loamy - Balanced soil</option>
          <option value="Sandy">🏖️ Sandy - Good drainage</option>
          <option value="Clay">🧱 Clay - Rich in nutrients</option>
          <option value="Silt">💧 Silt - Fine particles</option>
          <option value="Peaty">🌿 Peaty - Organic matter</option>
          <option value="Chalky">⚪ Chalky - Alkaline</option>
        </select>

        {selectedCrop && formData.farmSoilType !== selectedCrop?.recommendedSoil && formData.farmSoilType && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              <strong>Recommended:</strong> {selectedCrop?.recommendedSoil} soil for {selectedCrop?.cropName}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Dates Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Planting Date */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-all">
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendarPlus} className="text-white text-sm" />
          </div>
          <span>Planting Date</span>
        </label>
        <input
          type="date"
          name="plantingDate"
          value={formData.plantingDate}
          onChange={handleInputChange}
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm cursor-pointer"
        />
      </div>

      {/* Expected Harvest Date */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 transition-all">
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faHourglassEnd} className="text-white text-sm" />
          </div>
          <span>Expected Harvest</span>
        </label>
        <div className="space-y-2">
          <input
            type="date"
            name="expectedHarvestDate"
            value={formData.expectedHarvestDate}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm cursor-pointer"
            readOnly={!!selectedCrop?.durationDays}
          />

          {formData.expectedHarvestDate && selectedCrop?.durationDays && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                Auto-calculated: {selectedCrop.durationDays} days
                {getDaysUntilHarvest() && ` • ${getDaysUntilHarvest()} days from today`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Status Selection - Only in Edit Mode */}
    {isEditing && (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-all">
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faChartLine} className="text-white text-sm" />
          </div>
          <span>Plan Status</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm cursor-pointer"
        >
          <option value="planned">📋 Planned - Ready to start</option>
          <option value="planted">🌱 Planted - Growth phase</option>
          <option value="harvested">✅ Harvested - Completed</option>
          <option value="cancelled">❌ Cancelled - Discontinued</option>
        </select>
      </div>
    )}

    {/* Location Picker */}
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-all">
      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faLocationDot} className="text-white text-sm" />
        </div>
        <span>Farm Location</span>
      </label>
      <div className="space-y-3">
        <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-300">
          <LocationPicker location={location} setLocation={setLocation} />
        </div>
        {location.lat && location.lng && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FontAwesomeIcon icon={faCheck} className="text-green-600 text-sm" />
              <span className="text-sm text-green-800 font-bold">Location Selected</span>
            </div>
            {isLoadingAddress ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Loading address...</span>
              </div>
            ) : (
              <p className="text-xs text-green-700">{locationAddress}</p>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Device Selection */}
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 transition-all">
      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faSeedling} className="text-white text-sm" />
        </div>
        <span>Device Selection</span>
      </label>

      {devicesLoading ? (
        <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-green-600">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
            <span className="text-xs font-medium">Loading devices...</span>
          </div>
        </div>
      ) : (
        <>
          <select
            name="deviceId"
            value={formData.deviceId}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm cursor-pointer"
            disabled={availableDevices.length === 0}
          >
            <option value="">
              {availableDevices.length === 0 ? 'No devices available' : `Select device (${availableDevices.length} available)`}
            </option>
            {availableDevices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.deviceName} - {device.deviceId}
              </option>
            ))}
          </select>

          {availableDevices.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">No devices available. Add device first.</p>
          )}
        </>
      )}
    </div>

    {/* Plan Summary - Compact Grid */}
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faClipboardCheck} className="text-white text-sm" />
        </div>
        <span>Plan Summary</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Crop", value: formData.cropName || 'Not set', icon: faSeedling },
          { label: "Area", value: formData.area ? `${formData.area} ha` : '0 ha', icon: faRulerCombined },
          { label: "Status", value: formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Planned', icon: faChartLine },
          { label: "Soil", value: formData.farmSoilType || 'Not set', icon: faMountain },
          { label: "Sector", value: formData.sectorName || 'Not set', icon: faMapMarkerAlt },
          { label: "Planting", value: formData.plantingDate || 'Not set', icon: faCalendarAlt },
          { label: "Duration", value: selectedCrop ? `${selectedCrop.durationDays} days` : 'Manual', icon: faClock },
          { label: "Harvest", value: formData.expectedHarvestDate || 'Not set', icon: faClock },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-center">
              <FontAwesomeIcon icon={item.icon} className="text-green-600 text-lg mb-1" />
              <p className="text-xs font-semibold text-gray-500 mb-1">{item.label}</p>
              <p className="text-xs font-bold text-gray-800 truncate" title={item.value}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Submit Button - Compact */}
  <div className="flex justify-center pt-4">
    <button
      type="submit"
      disabled={isSubmitting || loading}
      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-3 rounded-xl font-bold text-base hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[240px]"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={isEditing ? faSave : faPlusCircle} />
          <span>{isEditing ? 'Update Plan' : 'Create Plan'}</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </div>
      )}
    </button>
  </div>
</form>
)}

                {/* Existing Plans List */}
                {(() => {
                  const plannedPlans = plans.filter(plan => plan.status === 'planned');

                  return plannedPlans.length > 0 ? (
                    <div className="grid gap-6 border-t border-gray-300 pt-6">
                      {plannedPlans.map((plan) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          weather={planWeather[plan.id]}
                          location={planLocations[plan.id]}
                          onEdit={handleEditClick}
                          onDelete={handleDeletePlan}
                          showAlerts={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🌱</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No planned cultivation plans</h3>
                      <p className="text-gray-500 mb-6">Create a new plan to get started with cultivation planning</p>
                      {/* <button
                        onClick={() => setActiveTab("crop-plan")}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-semibold"
                      >
                        Create New Plan
                      </button> */}
                    </div>
                  );
                })()}

              </div>
            )}

            {activeTab === "active crops" && (
              <div className="space-y-6 "> 
                <div className="text-center mb-8 ">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Planting Schedule & Monitoring
                  </h3>
                  <p className="text-gray-600">
                    Real-time weather insights and cultivation progress tracking
                  </p>
                </div>

                {(() => {
                  const plannedPlans = plans.filter(plan => plan.status === 'planted');

                  return plannedPlans.length > 0 ? (
                    <div className="grid gap-6" >
                      {plannedPlans.map((plan) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          weather={planWeather[plan.id]}
                          location={planLocations[plan.id]}
                          onEdit={handleEditClick}
                          onDelete={handleDeletePlan}
                          showAlerts={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🌱</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No planned cultivation plans</h3>
                      <p className="text-gray-500 mb-6">Create a new plan to get started with cultivation planning</p>
                      <button
                        onClick={() => setActiveTab("crop-plan")}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-semibold"
                      >
                        Create New Plan
                      </button>
                    </div>
                  );
                })()}

              </div>
            )}

            {activeTab === "harvested" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Harvest Management
                  </h3>
                  <p className="text-gray-600">
                    Harvest Management based on your cultivation areas for records
                  </p>
                </div>

                {(() => {
                  const plannedPlans = plans.filter(plan => plan.status === 'harvested');

                  return plannedPlans.length > 0 ? (
                    <div className="grid gap-6">
                      {plannedPlans.map((plan) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          weather={planWeather[plan.id]}
                          location={planLocations[plan.id]}
                          onEdit={() => Swal.fire({
                            title: 'Error!',
                            text: 'After harvested can not edit, this is for record purpose only',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#dc2626'
                          })}
                          onDelete={() => Swal.fire({
                            title: 'Error!',
                            text: 'After harvested can not delete, this is for record purpose only',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#dc2626'
                          })}
                          showAlerts={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🌱</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No harvested cultivations </h3>
                      <p className="text-gray-500 mb-6">Create a new plan to get started with cultivation planning</p>
                      <button
                        onClick={() => setActiveTab("crop-plan")}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-semibold"
                      >
                        Create New Plan
                      </button>
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
export default Planning;   