import { useDiseases } from "../../contexts/DiseaseContext";
import { Plus, Search, Filter, Download, RefreshCw } from "lucide-react";
import { useCrops } from "../../contexts/CropContext";
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  Droplet,
  Sun,
  Save
} from 'lucide-react';
import {
  Loader2,
  Edit3,
  Trash2,
  AlertCircle,
  ClipboardList,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Minus,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import LoadingSpinner from "../common/LoadingSpinner";
import { toast } from 'react-toastify';

const DiseasesAdmin = ({ refreshTrigger }) => {
  const {
    diseases,
    loading,
    error,
    addDisease,
    editDisease,
    handleDelete,
    fetchDiseases,
    deletingId,
  } = useDiseases();

  const [newDisease, setNewDisease] = useState({
    diseaseName: "",
    cause: "",
    symptoms: "",
    treatment: "",
    severity: "",
    cropId: "",
    prevention: "",
    imageUrl: "",
    spreadRate: "",
  });
  
  const [editingDisease, setEditingDisease] = useState(null);
  const [showDiseaseForm, setShowDiseaseForm] = useState(false);
  const [expandedDiseaseId, setExpandedDiseaseId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    severity: "all",
    cropId: "all",
    spreadRate: "all",
    sortBy: "diseaseName",
    sortOrder: "asc"
  });

  // Crop state
  const { crops, loading: cropsLoading, error: cropsError } = useCrops();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    fetchDiseases();
  }, [refreshTrigger]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Filter and sort diseases
  const filteredDiseases = useMemo(() => {
    let filtered = [...diseases];

    // Text search
    if (debouncedSearch.trim() !== "") {
      const searchTerm = debouncedSearch.toLowerCase();
      filtered = filtered.filter(disease =>
        disease.diseaseName?.toLowerCase().includes(searchTerm) ||
        disease.symptoms?.toLowerCase().includes(searchTerm) ||
        disease.cause?.toLowerCase().includes(searchTerm) ||
        disease.treatment?.toLowerCase().includes(searchTerm)
      );
    }

    // Severity filter
    if (filters.severity !== "all") {
      filtered = filtered.filter(disease => disease.severity === filters.severity);
    }

    // Crop filter
    if (filters.cropId !== "all") {
      filtered = filtered.filter(disease => disease.cropId === filters.cropId);
    }

    // Spread rate filter
    if (filters.spreadRate !== "all") {
      filtered = filtered.filter(disease => disease.spreadRate === filters.spreadRate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "diseaseName":
          aValue = a.diseaseName?.toLowerCase() || "";
          bValue = b.diseaseName?.toLowerCase() || "";
          break;
        case "severity":
          const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
          break;
        case "cropName":
          const cropA = crops.find(c => c.id === a.cropId);
          const cropB = crops.find(c => c.id === b.cropId);
          aValue = cropA?.cropName?.toLowerCase() || "";
          bValue = cropB?.cropName?.toLowerCase() || "";
          break;
        default:
          aValue = a.diseaseName?.toLowerCase() || "";
          bValue = b.diseaseName?.toLowerCase() || "";
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [diseases, debouncedSearch, filters.severity, filters.cropId, filters.spreadRate, filters.sortBy, filters.sortOrder, crops]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDisease((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "cropId") {
      const crop = crops.find((c) => c.id === value);
      setSelectedCrop(crop || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDisease) {
        const result = await editDisease(editingDisease.id, newDisease);
        if (result.success) {
          toast.success('Disease updated successfully');
        } else {
          toast.error(result.error || 'Failed to update disease');
        }
      } else {
        const result = await addDisease(newDisease);
        if (result.success) {
          toast.success('Disease added successfully');
        } else {
          toast.error(result.error || 'Failed to add disease');
        }
      }
      setNewDisease({
        diseaseName: "",
        cause: "",
        symptoms: "",
        treatment: "",
        severity: "",
        cropId: "",
        prevention: "",
        imageUrl: "",
        spreadRate: ""
      });
      setSelectedCrop(null);
      setExpandedDiseaseId(null);
      setShowDiseaseForm(false);
      setEditingDisease(null);
      fetchDiseases();
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleEdit = (disease) => {
    setEditingDisease(disease);
    setShowDiseaseForm(true);
    setExpandedDiseaseId(null);
    setNewDisease({
      diseaseName: disease.diseaseName,
      cause: disease.cause,
      symptoms: disease.symptoms,
      treatment: disease.treatment,
      severity: disease.severity,
      cropId: disease.cropId,
      prevention: disease.prevention,
      imageUrl: disease.imageUrl,
      spreadRate: disease.spreadRate
    });
    const crop = crops.find((c) => c.id === disease.cropId);
    setSelectedCrop(crop || null);
  };

  const handleViewDetails = (disease) => {
    if (expandedDiseaseId === disease.id) {
      setExpandedDiseaseId(null);
    } else {
      setExpandedDiseaseId(disease.id);
    }
  };

  const handleCancelEdit = () => {
    setEditingDisease(null);
    setNewDisease({
      diseaseName: "",
      cause: "",
      symptoms: "",
      treatment: "",
      severity: "",
      cropId: "",
      prevention: "",
      imageUrl: "",
      spreadRate: ""
    });
    setSelectedCrop(null);
    setShowDiseaseForm(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      severity: "all",
      cropId: "all",
      spreadRate: "all",
      sortBy: "diseaseName",
      sortOrder: "asc"
    });
  };

  const refreshDiseases = async () => {
    try {
      await fetchDiseases();
      toast.success('Diseases refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh diseases');
    }
  };

  const exportDiseases = () => {
    const csvContent = [
      ['Disease Name', 'Severity', 'Spread Rate', 'Crop', 'Symptoms', 'Treatment', 'Prevention','imageUrl'],
      ...filteredDiseases.map(disease => {
        const crop = crops.find(c => c.id === disease.cropId);
        return [
          disease.diseaseName,
          disease.severity,
          disease.spreadRate || 'N/A',
          crop?.cropName || 'Unknown Crop',
          disease.symptoms?.substring(0, 100) + '...',
          disease.treatment?.substring(0, 100) + '...',
          disease.prevention?.substring(0, 100) + '...',
          disease.imageUrl || 'N/A'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diseases-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Diseases exported successfully');
  };

  const hasActiveFilters = filters.search || filters.severity !== "all" || filters.cropId !== "all" || filters.spreadRate !== "all";

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
             Disease Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage disease records, treatments, and prevention methods
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={refreshDiseases}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowDiseaseForm(!showDiseaseForm);
              if (showDiseaseForm) {
                handleCancelEdit();
              }
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${showDiseaseForm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
          >
            {showDiseaseForm ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={18} />
                Add New Disease
              </>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Add / Edit Disease Form */}
      {showDiseaseForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingDisease ? "✏️ Edit Disease" : "➕ Add New Disease"}
            </h2>
            {editingDisease && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                <span>Cancel Edit</span>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Disease Name */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Disease Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="diseaseName"
                placeholder="e.g., Powdery Mildew, Leaf Rust"
                value={newDisease.diseaseName}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                required
              />
            </div>

            {/* Severity Level */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <select
                name="severity"
                value={newDisease.severity}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 appearance-none cursor-pointer"
                required
              >
                <option value="">Select severity level</option>
                <option value="Low" className="text-green-600">🟢 Low - Minor impact</option>
                <option value="Medium" className="text-yellow-600">🟡 Medium - Moderate impact</option>
                <option value="High" className="text-red-600">🔴 High - Critical impact</option>
              </select>
            </div>

            {/* Spread Rate */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Spread Rate
              </label>
              <select
                name="spreadRate"
                value={newDisease.spreadRate}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
              >
                <option value="">Select spread rate</option>
                <option value="Slow">Slow</option>
                <option value="Moderate">Moderate</option>
                <option value="Rapid">Rapid</option>
              </select>
            </div>

            {/* Crop Selection */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Affected Crop <span className="text-red-500">*</span>
              </label>

              {cropsLoading ? (
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                    Loading available crops...
                  </div>
                </div>
              ) : (
                <>
                  <select
                    name="cropId"
                    value={newDisease.cropId}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 appearance-none cursor-pointer"
                  
                  >
                    <option value="">
                      {crops.length === 0 ? "No crops available - Add crops first" : "Select affected crop..."}
                    </option>
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.cropName} {crop.variety && `- ${crop.variety}`}
                      </option>
                    ))}
                  </select>

                  {/* Selected Crop Details */}
                  {newDisease.cropId && selectedCrop && (
                    <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-green-800">Selected Crop:</span>
                        <span className="text-green-700">{selectedCrop.cropName}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-green-700">
                        {selectedCrop.durationDays && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{selectedCrop.durationDays} days cycle</span>
                          </div>
                        )}
                        {selectedCrop.waterRequirement && (
                          <div className="flex items-center gap-1">
                            <Droplet size={14} />
                            <span>Water: {selectedCrop.waterRequirement}</span>
                          </div>
                        )}
                        {selectedCrop.season && (
                          <div className="flex items-center gap-1">
                            <Sun size={14} />
                            <span>Season: {selectedCrop.season}</span>
                          </div>
                        )}
                        {selectedCrop.soilType && (
                          <div className="flex items-center gap-1">
                            <Sprout size={14} />
                            <span>Soil: {selectedCrop.soilType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cause */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cause & Conditions <span className="text-red-500">*</span>
              </label>
              <textarea
                name="cause"
                placeholder="Describe environmental conditions, pathogens, or factors that cause this disease..."
                value={newDisease.cause}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-vertical"
                required
              />
            </div>

            {/* Symptoms */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Symptoms & Identification <span className="text-red-500">*</span>
              </label>
              <textarea
                name="symptoms"
                placeholder="Describe visible symptoms, patterns, and how to identify this disease..."
                value={newDisease.symptoms}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-vertical"
                required
              />
            </div>

            {/* Treatment */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Treatment & Control <span className="text-red-500">*</span>
              </label>
              <textarea
                name="treatment"
                placeholder="Provide treatment methods, pesticides, organic solutions, and prevention measures..."
                value={newDisease.treatment}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-vertical"
                required
              />
            </div>

            {/* Prevention */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prevention Measures
              </label>
              <textarea
                name="prevention"
                placeholder="Provide preventive measures to avoid this disease..."
                value={newDisease.prevention}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-vertical"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image URL (Optional)
              </label>
              <input
                type="text"
                name="imageUrl"
                placeholder="https://example.com/disease-image.jpg"
                value={newDisease.imageUrl}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
              />
              <p className="text-xs text-gray-500">
                Provide a direct link to an image of the disease for identification
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Fields marked with <span className="text-red-500">*</span> are required
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {editingDisease ? 'Updating...' : 'Adding...'}
                </>
              ) : editingDisease ? (
                <>
                  <Save size={18} />
                  Update Disease
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Disease to Database
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Quick Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Diseases</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{diseases.length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {diseases.filter(d => d.severity === 'High').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Severity</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {diseases.filter(d => d.severity === 'Medium').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Severity</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {diseases.filter(d => d.severity === 'Low').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search diseases by name, symptoms, or treatment..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange("severity", e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
            >
              <option value="all">All Severity</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={filters.cropId}
              onChange={(e) => handleFilterChange("cropId", e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
            >
              <option value="all">All Crops</option>
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>{crop.cropName}</option>
              ))}
            </select>

            <button
              onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
            >
              {filters.sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              onClick={exportDiseases}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex flex-wrap items-center gap-2 text-sm text-green-800">
              <Filter size={14} />
              <span>Active filters:</span>
              {filters.search && (
                <span className="bg-green-100 px-3 py-1 rounded-full text-sm">Search: "{filters.search}"</span>
              )}
              {filters.severity !== "all" && (
                <span className="bg-green-100 px-3 py-1 rounded-full text-sm">Severity: {filters.severity}</span>
              )}
              {filters.cropId !== "all" && (
                <span className="bg-green-100 px-3 py-1 rounded-full text-sm">
                  Crop: {crops.find(c => c.id === filters.cropId)?.cropName}
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-green-600 hover:text-green-800 underline ml-2"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Disease List */}
      {loading ? (
        <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-600 mt-3">Loading diseases data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
          <p className="text-red-700 font-medium mb-2">Failed to load diseases</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Table Header with Stats */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Disease Database</h2>
                <p className="text-green-100 text-sm mt-1">
                  {filteredDiseases.length} disease{filteredDiseases.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                  High: {diseases.filter(d => d.severity === 'High').length}
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                  Medium: {diseases.filter(d => d.severity === 'Medium').length}
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                  Low: {diseases.filter(d => d.severity === 'Low').length}
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Disease Information
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Affected Crop
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Symptoms
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiseases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ClipboardList size={48} className="mb-3 opacity-50" />
                        <p className="text-lg font-medium text-gray-500 mb-2">No diseases found</p>
                        <p className="text-sm text-gray-400 max-w-md">
                          {hasActiveFilters 
                            ? "No diseases match your search criteria. Try adjusting your filters."
                            : "Start by adding the first disease to your database. Click the 'Add Disease' button above."}
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearAllFilters}
                            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDiseases.map((disease) => (
                    <React.Fragment key={disease.id}>
                      <tr className="hover:bg-green-50 transition-all duration-200 group">
                        {/* Disease Information */}
                        <td className="py-4 px-6">
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${disease.severity === 'High' ? 'bg-red-500' :
                              disease.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                {disease.diseaseName}
                              </h3>
                              {disease.cause && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                  {disease.cause}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${disease.severity === 'High'
                            ? 'bg-red-100 text-red-800'
                            : disease.severity === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            }`}>
                            {disease.severity === 'High' && '🔴'}
                            {disease.severity === 'Medium' && '🟡'}
                            {disease.severity === 'Low' && '🟢'}
                            {disease.severity}
                            {disease.spreadRate && ` • ${disease.spreadRate}`}
                          </span>
                        </td>

                        {/* Affected Crop */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Sprout size={16} className="text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-900">
                              {crops.find((c) => c.id === disease.cropId)?.cropName || (
                                <span className="text-red-500 italic">Crop not found</span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Symptoms Preview */}
                        <td className="py-4 px-6">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {disease.symptoms || "No symptoms recorded"}
                            </p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-2">
                            {/* View Details Button */}
                            <button
                              onClick={() => handleViewDetails(disease)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              title={expandedDiseaseId === disease.id ? "Hide Details" : "View Details"}
                            >
                              {expandedDiseaseId === disease.id ? <Minus size={16} /> : <Eye size={16} />}
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(disease)}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              title="Edit Disease"
                            >
                              <Edit3 size={16} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${disease.diseaseName}"?`)) {
                                  handleDelete(disease.id);
                                }
                              }}
                              disabled={deletingId === disease.id}
                              className={`inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${deletingId === disease.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              title="Delete Disease"
                            >
                              {deletingId === disease.id ? (
                                <Loader2 size={16} className="animate-spin text-red-500" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedDiseaseId === disease.id && (
                        <tr className="bg-green-50">
                          <td colSpan="5" className="px-6 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <span>🔍</span> Cause & Conditions
                                  </h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-600">{disease.cause || "No cause information available"}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <span>🛡️</span> Prevention Methods
                                  </h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-600">{disease.prevention || "No prevention information available"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <span>📊</span> Disease Details
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="text-sm text-gray-500">Spread Rate</div>
                                      <div className={`font-medium ${disease.spreadRate === 'Rapid' ? 'text-red-600' :
                                        disease.spreadRate === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                        {disease.spreadRate || "Not specified"}
                                      </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="text-sm text-gray-500">Severity</div>
                                      <div className={`font-medium ${disease.severity === 'High' ? 'text-red-600' :
                                        disease.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                        {disease.severity}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {disease.imageUrl && (
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                      <span>🖼️</span> Reference Image
                                    </h4>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <img
                                        src={disease.imageUrl}
                                        alt={disease.diseaseName}
                                        className="w-full h-48 object-cover rounded-lg"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = "https://via.placeholder.com/400x200?text=Disease+Image+Not+Available";
                                        }}
                                      />
                                      <p className="text-xs text-gray-500 mt-2 text-center">Reference image for identification</p>
                                    </div>
                                </div>
                                )}

                                {/* Full Treatment Details */}
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <span>💊</span> Detailed Treatment
                                  </h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-600 whitespace-pre-line">{disease.treatment}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination/Footer */}
          {filteredDiseases.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold">{filteredDiseases.length}</span> disease{filteredDiseases.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-2">Page 1 of 1</span>
                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseasesAdmin;