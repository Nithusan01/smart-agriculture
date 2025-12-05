import { useDiseases } from "../../contexts/DiseaseContext";
import { Plus } from "lucide-react";
import { useCrops } from "../../contexts/CropContext";
import React, { useState, useEffect } from 'react';
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
  Download,
  ChevronLeft,
  ChevronRight,
  Sprout
} from 'lucide-react';
import LoadingSpinner from "../common/LoadingSpinner";

// If you're using React Hook Form (optional enhancement)
// import { useForm } from 'react-hook-form';

const DiseasesAdmin = () => {
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
    description: "",
    symptoms: "",
    treatment: "",
    severity: "",
    cropId: "",
  });
  const [editingDisease, setEditingDisease] = useState(null);
  const [showDiseaseForm, setShowDiseaseForm] = useState(false);


  // Crop state
  const { crops, loading: cropsLoading, error: cropsError } = useCrops();
  const [selectedCrop, setSelectedCrop] = useState(null);


  useEffect(() => {
    fetchDiseases();
  }, []);

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
    if (editingDisease) {
      await editDisease(editingDisease.id, newDisease);
      setEditingDisease(null);
    } else {
      await addDisease(newDisease);
    }
    setNewDisease({
      diseaseName: "",
      description: "",
      symptoms: "",
      treatment: "",
      severity: "",
      cropId: "",
    });
    setSelectedCrop(null);
    fetchDiseases();
  };

  const handleEdit = (disease) => {
    setEditingDisease(disease);
    setShowDiseaseForm(true);
    setNewDisease({
      diseaseName: disease.diseaseName,
      description: disease.description,
      symptoms: disease.symptoms,
      treatment: disease.treatment,
      severity: disease.severity,
      cropId: disease.cropId,
    });
    const crop = crops.find((c) => c.id === disease.cropId);
    setSelectedCrop(crop || null);
  };
  const handleViewDetails = (disease) => {
    // Implement disease details view/modal
    console.log('View details:', disease);
  };


  return (
    <div className=" p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 text-green-700">
          🌿 Disease Management
        </h1>
        <button
          onClick={() => setShowDiseaseForm(!showDiseaseForm)}
          className={`flex items-center gap-2 px-6 py-3 my-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${showDiseaseForm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
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
              Add New disease
            </>
          )}
        </button>
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
                onClick={() => setEditingDisease(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                <span>Cancel Edit</span>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Disease Name */}
            <div className="space-y-2">
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

            {/* Crop Selection - Full Width */}
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
                    required
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

            {/* Symptoms */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Symptoms & Identification <span className="text-red-500">*</span>
              </label>
              <textarea
                name="symptoms"
                placeholder="Describe the visible symptoms, patterns, and how to identify this disease..."
                value={newDisease.symptoms}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-vertical"
                required
              />
              <p className="text-xs text-gray-500">
                Include details like leaf spots, discoloration, growth patterns, etc.
              </p>
            </div>

            {/* Treatment */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Treatment & Prevention <span className="text-red-500">*</span>
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
              <p className="text-xs text-gray-500">
                Include both chemical and organic treatment options
              </p>
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Information
              </label>
              <textarea
                name="description"
                placeholder="Any additional notes, environmental conditions that favor this disease, spread patterns, etc."
                value={newDisease.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-vertical"
              />
            </div>

            {/* Optional Fields */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Optimal Temperature Range
                </label>
                <input
                  type="text"
                  name="optimalTemperature"
                  placeholder="e.g., 20-30°C"
                  value={newDisease.optimalTemperature}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Humidity Conditions
                </label>
                <input
                  type="text"
                  name="humidity"
                  placeholder="e.g., High humidity"
                  value={newDisease.humidity}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                />
              </div>

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
                  Processing...
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
        </form>)}
      {/* Enhanced Disease List */}
      {loading ? (
        <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            {/* <Loader2 className="animate-spin text-green-600 mx-auto mb-3" size={40} /> */}
            <LoadingSpinner />
            <p className="text-gray-600">Loading diseases data...</p>
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
                  {diseases.length} disease{diseases.length !== 1 ? 's' : ''} registered
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
                {diseases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ClipboardList size={48} className="mb-3 opacity-50" />
                        <p className="text-lg font-medium text-gray-500 mb-2">No diseases found</p>
                        <p className="text-sm text-gray-400 max-w-md">
                          Start by adding the first disease to your database. Click the "Add Disease" button above.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  diseases.map((disease) => (
                    <tr
                      key={disease.id}
                      className="hover:bg-green-50 transition-all duration-200 group"
                    >
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
                            {disease.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {disease.description}
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
                            title="View Details"
                          >
                            <Eye size={16} />
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
                            onClick={() => handleDelete(disease.id)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination/Footer */}
          {diseases.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold">{diseases.length}</span> disease{diseases.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
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
