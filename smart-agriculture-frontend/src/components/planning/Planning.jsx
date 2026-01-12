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

const Planning = () => {
  const { plans, loading, addPlan, editPlan, deletePlan, status, setStatus } = useCultivationPlan();
  const { crops, loading: cropsLoading, error: cropsError } = useCrops();
  const { fetchWeatherForPlan } = useWeather();
  const [activeTab, setActiveTab] = useState("crop-plan");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState("");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [formData, setFormData] = useState({
    sectorName: "",
    cropId: "", // Use cropId to store the selected crop ID
    cropName: "", // This will be auto-filled based on cropId
    area: "",
    farmSoilType: "",
    plantingDate: "",
    expectedHarvestDate: "",
    status: "planned"
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
      status: plan.status || "planned"
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
      status: "planned"
    });
    setLocation({ lat: null, lng: null });
    setError("");
    setStatus("");
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
       setShowPlanForm(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <section id="planning" className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-start mt-12 pt-4">
          <h2 className="text-5xl font-bold text-green-600 mb-2">
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
          <div className="flex border-b border-gray-200 bg-gray-50/50">
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
          <div className="p-8">
            {activeTab === "crop-plan" && (
              <div className="space-y-8">
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
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Sector Name */}
                      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-lg" />
                          </div>
                          <div>
                            Sector Name
                            <span className="block text-sm font-normal text-gray-500 mt-1">Unique identifier for this sector</span>
                          </div>
                        </label>
                        <input
                          type="text"
                          name="sectorName"
                          value={formData.sectorName.toUpperCase()}
                          onChange={handleInputChange}
                          placeholder="e.g., NORTH-FIELD-A"
                          className="relative w-full p-4 bg-white/50 border-2 border-cyan-100 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100/50 transition-all duration-300 text-lg font-semibold text-gray-800 placeholder-gray-400"
                          required
                        />
                      </div>

                      {/* Crop Selection - FIXED */}
                      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faSeedling} className="text-white text-lg" />
                          </div>
                          <div>
                            Crop Selection
                            <span className="block text-sm font-normal text-gray-500 mt-1">Choose from available crops</span>
                          </div>
                        </label>

                        {cropsLoading ? (
                          <div className="relative w-full p-4 bg-white/50 border-2 border-green-100 rounded-xl flex items-center justify-center">
                            <div className="flex items-center gap-3 text-green-600">
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                              <span className="text-sm font-medium">Loading crops...</span>
                            </div>
                          </div>
                        ) : (
                          <select
                            name="cropId"
                            value={formData.cropId}
                            onChange={handleInputChange}
                            className="relative w-full p-4 bg-white/50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100/50 transition-all duration-300 text-lg text-gray-800 appearance-none cursor-pointer"
                            required
                            disabled={crops.length === 0}
                          >
                            <option value="">{crops.length === 0 ? 'No crops available' : `${crops.length} crops available Select a crop...`}</option>
                            {crops.map((crop) => (
                              <option key={crop.id} value={crop.id} className="text-gray-700">
                                {getCropEmoji(crop.cropType)} {crop.cropName} - {crop.cropType}
                                {crop.durationDays && ` (${crop.durationDays} days)`}
                                {crop.waterRequirement && ` - 💧${crop.waterRequirement}`}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Selected crop info */}
                        {formData.cropId && selectedCrop && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm text-green-800">
                              <strong>Selected:</strong> {selectedCrop.cropName}
                              {selectedCrop.durationDays && ` • ${selectedCrop.durationDays} days`}
                              {selectedCrop.waterRequirement && ` • Water: ${selectedCrop.waterRequirement}`}
                            </div>
                          </div>
                        )}

                        {/* Crop count info */}
                        {!cropsLoading && crops.length > 0 && (
                          <div className="mt-3 text-xs text-green-600 font-medium">
                            {crops.length} available crops in database
                          </div>
                        )}

                        {!cropsLoading && crops.length === 0 && (
                          <div className="mt-3 text-xs text-amber-600 font-medium">
                            No crops available. Please add crops first in the admin panel.
                          </div>
                        )}
                      </div>

                      {/* Area Input */}
                      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faRulerCombined} className="text-white text-lg" />
                          </div>
                          <div>
                            Land Area
                            <span className="block text-sm font-normal text-gray-500 mt-1">Total cultivation area</span>
                          </div>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            className="relative w-full p-4 pr-20 bg-white/50 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 text-lg text-gray-800"
                            min="0"
                            step="0.1"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-lg">
                            hectares
                          </span>
                        </div>
                      </div>

                      {/* Soil Type */}
                      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faMountain} className="text-white text-lg" />
                          </div>
                          <div>
                            Soil Type
                            <span className="block text-sm font-normal text-gray-500 mt-1">Primary soil composition</span>
                          </div>
                        </label>
                        <select                                        
                          name="farmSoilType"
                          value={formData.farmSoilType}
                          onChange={handleInputChange}
                          className="relative w-full p-4 bg-white/50 border-2 border-amber-100 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100/50 transition-all duration-300 text-lg text-gray-800 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-gray-400">Select soil type...</option>
                          <option value="Loamy" className="text-gray-700">
                            <FontAwesomeIcon icon={faLayerGroup} className="mr-2 w-4 h-4" />
                            Loamy - Balanced soil
                          </option>
                          <option value="Sandy" className="text-gray-700">
                            <FontAwesomeIcon icon={faTintSlash} className="mr-2 w-4 h-4" />
                            Sandy - Good drainage
                          </option>
                          <option value="Clay" className="text-gray-700">
                            <FontAwesomeIcon icon={faCube} className="mr-2 w-4 h-4" />
                            Clay - Rich in nutrients
                          </option>
                          <option value="Silt" className="text-gray-700">
                            <FontAwesomeIcon icon={faWater} className="mr-2 w-4 h-4" />
                            Silt - Fine particles
                          </option>
                          <option value="Peaty" className="text-gray-700">
                            <FontAwesomeIcon icon={faWater} className="mr-2 w-4 h-4" />
                            Peaty - Fine particles
                          </option>
                          <option value="Chalky" className="text-gray-700">
                            <FontAwesomeIcon icon={faWater} className="mr-2 w-4 h-4" />
                            Chalky - Fine particles
                          </option>
              
                        </select>
                     {selectedCrop &&  formData.farmSoilType !== selectedCrop?.recommendedSoil && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-amber-800 text-sm">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-amber-600" />
                                <span>
                                  <strong>Recommened Soil : </strong>
                                  <span>
                                    {`${selectedCrop?.recommendedSoil} soil recommended for   ${selectedCrop?.cropName}`}
                                  </span>
                                </span>
                              </div>
                            </div>
                          )}
                           
                      </div>
                    </div>

                    {/* Dates Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Planting Date */}
                      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faCalendarPlus} className="text-white text-lg" />
                          </div>
                          <div>
                            Planting Date
                            <span className="block text-sm font-normal text-gray-500 mt-1">When to start cultivation</span>
                          </div>
                        </label>
                        <input
                          type="date"
                          name="plantingDate"
                          value={formData.plantingDate}
                          onChange={handleInputChange}
                          className="relative w-full p-4 bg-white/50 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 text-lg text-gray-800 cursor-pointer"
                        />
                      </div>

                      
                      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faHourglassEnd} className="text-white text-lg" />
                          </div>
                          <div>
                            Expected Harvest
                            <span className="block text-sm font-normal text-gray-500 mt-1">
                              {selectedCrop?.durationDays
                                ? `Automatically calculated: ${selectedCrop.durationDays} days from planting`
                                : 'Estimated completion date'
                              }
                            </span>
                          </div>
                        </label>
                        <div className="space-y-3">
                          <input
                            type="date"
                            name="expectedHarvestDate"
                            value={formData.expectedHarvestDate}
                            onChange={handleInputChange}
                            className="relative w-full p-4 bg-white/50 border-2 border-orange-100 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100/50 transition-all duration-300 text-lg text-gray-800 cursor-pointer"
                            readOnly={!!selectedCrop?.durationDays} // Make read-only if crop has duration
                          />

                          {formData.expectedHarvestDate && selectedCrop?.durationDays && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-amber-800 text-sm">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-amber-600" />
                                <span>
                                  <strong>Auto-calculated:</strong> {selectedCrop.durationDays} days from planting date
                                  {getDaysUntilHarvest() && (
                                    <span className="ml-2">
                                      • <strong>{getDaysUntilHarvest()} days</strong> from today
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}

                          {!selectedCrop?.durationDays && formData.expectedHarvestDate && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-blue-800 text-sm">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
                                <span>Manual harvest date selected</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Status Selection - Only in Edit Mode */}
                    {isEditing && (
                      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faChartLine} className="text-white text-lg" />
                          </div>
                          <div>
                            Plan Status
                            <span className="block text-sm font-normal text-gray-500 mt-1">Current progress stage</span>
                          </div>
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="relative w-full p-4 bg-white/50 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 transition-all duration-300 text-lg text-gray-800 appearance-none cursor-pointer"
                        >
                          <option value="planned" className="text-gray-700">
                            <FontAwesomeIcon icon={faClipboardList} className="mr-2 w-4 h-4" />
                            Planned - Ready to start
                          </option>
                          <option value="planted" className="text-gray-700">
                            <FontAwesomeIcon icon={faSeedling} className="mr-2 w-4 h-4" />
                            Planted - Growth phase
                          </option>
                          <option value="harvested" className="text-gray-700">
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2 w-4 h-4" />
                            Harvested - Completed
                          </option>
                          <option value="cancelled" className="text-gray-700">
                            <FontAwesomeIcon icon={faTimesCircle} className="mr-2 w-4 h-4" />
                            Cancelled - Discontinued
                          </option>
                        </select>
                      </div>
                    )}


                    {/* Location Picker - Full width at the end */}
                    <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FontAwesomeIcon icon={faLocationDot} className="text-white text-lg" />
                        </div>
                        <div>
                          Farm Location
                          <span className="block text-sm font-normal text-gray-500 mt-1">Click on the map to select your farm location</span>
                        </div>
                      </label>
                      <div className="space-y-4">
                        {/* Full width map container */}
                        <div className="w-full h-[400px] lg:h-[300px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                          <LocationPicker location={location} setLocation={setLocation} />
                        </div>
                        {location.lat && location.lng && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
                              </div>
                              <span className="text-green-800 font-bold">Location Selected</span>
                            </div>
                            {isLoadingAddress ? (
                              <div className="flex items-center gap-3 text-green-600">
                                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Loading address details...</span>
                              </div>
                            ) : (
                              <p className="text-sm text-green-700 leading-relaxed font-medium">{locationAddress}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Plan Summary */}
                    <div className="group relative bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-lg rounded-2xl border border-green-200 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <h3 className="relative text-2xl font-black text-gray-800 mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <FontAwesomeIcon icon={faClipboardCheck} className="text-white text-xl" />
                        </div>
                        <div>
                          Plan Summary
                          <span className="block text-sm font-normal text-gray-600 mt-1">Overview of your cultivation plan</span>
                        </div>
                      </h3>
                      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
                          { label: "Crop Type", value: formData.cropName || 'Not set', color: "from-green-500 to-emerald-500", icon: faSeedling },
                          { label: "Area", value: formData.area ? `${formData.area} ha` : '0 ha', color: "from-blue-500 to-cyan-500", icon: faRulerCombined },
                          { label: "Status", value: formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Planned', color: "from-purple-500 to-pink-500", icon: faChartLine },
                          { label: "Soil Type", value: formData.farmSoilType || 'Not set', color: "from-pink-500 to-red-500", icon: faMountain },
                          { label: "Sector", value: formData.sectorName || 'Not set', color: "from-emerald-500 to-green-500", icon: faMapMarkerAlt },
                          { label: "Planting", value: formData.plantingDate || 'Not set', color: "from-cyan-500 to-blue-500", icon: faCalendarAlt },
                          { label: "Duration", value: selectedCrop ? `${selectedCrop.durationDays} days` : 'Manual', color: "from-purple-500 to-pink-500",icon: faClock},
                          { label: "Harvested date", value: formData.expectedHarvestDate ? `${formData.expectedHarvestDate}` : 'Not set', color: "from-red-500 to-pink-500",icon: faClock},

                        ].map((item, index) => (
                          <div key={index} className="group/card bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center">
                              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                                <FontAwesomeIcon icon={item.icon} className="text-white text-lg" />
                              </div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{item.label}</p>
                              <p className={`text-sm font-black bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>
                                {item.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-20 py-6 rounded-2xl font-black text-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[280px] overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                      {isSubmitting ? (
                        <div className="relative flex items-center justify-center gap-4">
                          <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-bold text-lg">
                            {isEditing ? 'Updating Plan...' : 'Creating Plan...'}
                          </span>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center gap-4">
                          <FontAwesomeIcon icon={isEditing ? faSave : faPlusCircle} className="text-2xl" />
                          <span className="font-bold text-lg">
                            {isEditing ? 'Update Plan' : 'Create Plan'}
                          </span>
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="group-hover:translate-x-2 transition-transform duration-300 text-xl"
                          />
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
                    <div className="grid gap-6">
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

            {activeTab === "active crops" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
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