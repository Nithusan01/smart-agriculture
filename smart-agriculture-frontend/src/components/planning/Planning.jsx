// src/pages/Planning.jsx
import { useState } from "react";
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
  faWheatAwn, // Alternative for wheat
  faLeaf, // Alternative for crops
  faLayerGroup,
  faTintSlash,
  faCube,
  faWater,
  faMountainSun, // Alternative for terrain
  faLocationDot,
  faRuler
} from "@fortawesome/free-solid-svg-icons";


const Planning = () => {
  const { plans, loading, addPlan, editPlan, deletePlan, status, setStatus } = useCultivationPlan();
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
    expectedHarvestDate: "",
    status: "planned"
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Custom reusable hooks
  const planLocations = usePlanLocations(plans);
  const planWeather = usePlanWeather(plans, fetchWeatherForPlan);
  const { locationAddress, isLoadingAddress } = useLocation(location.lat, location.lng)
  const { isDateWithinDays, isDateToday, formatDate } = useDateUtils();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Start editing a plan
  const handleEditClick = (plan) => {
    setEditingPlan(plan.id);
    setIsEditing(true);

    setFormData({
      sectorName: plan.sectorName || "",
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

    if (!formData.sectorName || !formData.cropName) {
      setError("Sector Name and Crop Type are required");
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
      setError(error || 'An unexpected error occurred');
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

  // // Helper function to get status color
  // const getStatusColor = (status) => {
  //   const statusLower = status?.toLowerCase();
  //   switch (statusLower) {
  //     case "planned": return "bg-amber-100 text-amber-800 border-amber-200";
  //     case "planted": return "bg-blue-100 text-blue-800 border-blue-200";
  //     case "growing": return "bg-emerald-100 text-emerald-800 border-emerald-200";
  //     case "harvested": return "bg-green-100 text-green-800 border-green-200";
  //     case "cancelled": return "bg-red-100 text-red-800 border-red-200";
  //     default: return "bg-gray-100 text-gray-800 border-gray-200";
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 py-8">
      <section id="planning" className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mt-12 mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Cultivation Planning
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {isEditing ? 'Edit Crop Plan' : 'Create New Crop Plan'}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {isEditing
                        ? 'Update your cultivation plan details'
                        : 'Fill in the details to create a new cultivation plan'
                      }
                    </p>
                  </div>
                  {isEditing && (
                    <div className="flex gap-3">
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

      {/* Crop Selection */}
      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faSeedling} className="text-white text-lg" />
          </div>
          <div>
            Crop Type
            <span className="block text-sm font-normal text-gray-500 mt-1">Select primary crop for this sector</span>
          </div>
        </label>
        <select
          name="cropName"
          value={formData.cropName}
          onChange={handleInputChange}
          className="relative w-full p-4 bg-white/50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100/50 transition-all duration-300 text-lg text-gray-800 appearance-none cursor-pointer"
          required
        >
          <option value="" className="text-gray-400">Choose crop type...</option>
          <option value="wheat" className="text-gray-700">
            <FontAwesomeIcon icon={faWheatAwn} className="mr-2 w-4 h-4" />
            Wheat - Grain cereal
          </option>
          <option value="corn" className="text-gray-700">
            <FontAwesomeIcon icon={faSeedling} className="mr-2 w-4 h-4" />
            Corn - Maize crop
          </option>
          <option value="rice" className="text-gray-700">
            <FontAwesomeIcon icon={faLeaf} className="mr-2 w-4 h-4" />
            Rice - Paddy crop
          </option>
          <option value="soybean" className="text-gray-700">
            <FontAwesomeIcon icon={faSeedling} className="mr-2 w-4 h-4" />
            Soybean - Legume crop
          </option>
        </select>
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
          <option value="loamy" className="text-gray-700">
            <FontAwesomeIcon icon={faLayerGroup} className="mr-2 w-4 h-4" />
            Loamy - Balanced soil
          </option>
          <option value="sandy" className="text-gray-700">
            <FontAwesomeIcon icon={faTintSlash} className="mr-2 w-4 h-4" />
            Sandy - Good drainage
          </option>
          <option value="clay" className="text-gray-700">
            <FontAwesomeIcon icon={faCube} className="mr-2 w-4 h-4" />
            Clay - Rich in nutrients
          </option>
          <option value="silt" className="text-gray-700">
            <FontAwesomeIcon icon={faWater} className="mr-2 w-4 h-4" />
            Silt - Fine particles
          </option>
        </select>
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

      {/* Expected Harvest Date */}
      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <label className="relative block text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faHourglassEnd} className="text-white text-lg" />
          </div>
          <div>
            Expected Harvest
            <span className="block text-sm font-normal text-gray-500 mt-1">Estimated completion date</span>
          </div>
        </label>
        <input
          type="date"
          name="expectedHarvestDate"
          value={formData.expectedHarvestDate}
          onChange={handleInputChange}
          className="relative w-full p-4 bg-white/50 border-2 border-orange-100 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100/50 transition-all duration-300 text-lg text-gray-800 cursor-pointer"
        />
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
      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Crop Type", value: formData.cropName || 'Not set', color: "from-green-500 to-emerald-500", icon: faSeedling },
          { label: "Area", value: formData.area ? `${formData.area} ha` : '0 ha', color: "from-blue-500 to-cyan-500", icon: faRulerCombined },
          { label: "Status", value: formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Planned', color: "from-purple-500 to-pink-500", icon: faChartLine },
          { label: "Soil Type", value: formData.farmSoilType || 'Not set', color: "from-amber-500 to-orange-500", icon: faMountain },
          { label: "Sector", value: formData.sectorName || 'Not set', color: "from-indigo-500 to-purple-500", icon: faMapMarkerAlt },
          { label: "Planting", value: formData.plantingDate || 'Not set', color: "from-cyan-500 to-blue-500", icon: faCalendarAlt }
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