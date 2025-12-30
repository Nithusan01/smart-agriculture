import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCrops } from '../../contexts/CropContext.jsx';
import CropForm from './CropForm.jsx';
import {
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Save,
  XCircle,
  Calendar,
  Droplet,
  Sun,
  Sprout,
  Loader2,
  AlertCircle,
  Download,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  Shield,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import { toast } from 'react-toastify';

const CropList = ({ refreshTrigger }) => {
    const { currentUser } = useAuth();
    const { crops, setError, loading, error, handleDelete, deletingId, editCrop, fetchCrops } = useCrops();
    const [showCropForm, setShowCropForm] = useState(false);


    // Advanced search states
    const [filters, setFilters] = useState({
        search: "",
        cropType: "all",
        season: "all",
        waterRequirement: "all",
        soilType: "all",
        sortBy: "cropName",
        sortOrder: "asc"
    });

    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [editingCrop, setEditingCrop] = useState(null);
    const [editFormData, setEditFormData] = useState({
        cropName: "",
        cropType: "",
        season: "",
        durationDays: "",
        waterRequirement: "",
        recommendedSoil: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCrops();
    }, [refreshTrigger]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.search]);

    // Filter and sort crops
    const filteredCrops = useMemo(() => {
        let filtered = [...crops];

        // Text search
        if (debouncedSearch.trim() !== "") {
            const searchTerm = debouncedSearch.toLowerCase();
            filtered = filtered.filter(crop =>
                crop.cropName?.toLowerCase().includes(searchTerm) ||
                crop.cropType?.toLowerCase().includes(searchTerm) ||
                crop.season?.toLowerCase().includes(searchTerm) ||
                crop.recommendedSoil?.toLowerCase().includes(searchTerm)
            );
        }

        // Crop type filter
        if (filters.cropType !== "all") {
            filtered = filtered.filter(crop => crop.cropType === filters.cropType);
        }

        // Season filter
        if (filters.season !== "all") {
            filtered = filtered.filter(crop => crop.season === filters.season);
        }

        // Water requirement filter
        if (filters.waterRequirement !== "all") {
            filtered = filtered.filter(crop => crop.waterRequirement === filters.waterRequirement);
        }

        // Soil type filter
        if (filters.soilType !== "all") {
            filtered = filtered.filter(crop => crop.recommendedSoil === filters.soilType);
        }

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case "cropName":
                    aValue = a.cropName?.toLowerCase() || "";
                    bValue = b.cropName?.toLowerCase() || "";
                    break;
                case "durationDays":
                    aValue = parseInt(a.durationDays) || 0;
                    bValue = parseInt(b.durationDays) || 0;
                    break;
                case "cropType":
                    aValue = a.cropType?.toLowerCase() || "";
                    bValue = b.cropType?.toLowerCase() || "";
                    break;
                case "season":
                    aValue = a.season?.toLowerCase() || "";
                    bValue = b.season?.toLowerCase() || "";
                    break;
                default:
                    aValue = a.cropName?.toLowerCase() || "";
                    bValue = b.cropName?.toLowerCase() || "";
            }

            if (filters.sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [crops, debouncedSearch, filters.cropType, filters.season, filters.waterRequirement, filters.soilType, filters.sortBy, filters.sortOrder]);

    // Edit functions
    const handleEditClick = (crop) => {
        setEditingCrop(crop.id);
        setEditFormData({
            cropName: crop.cropName || "",
            cropType: crop.cropType || "",
            season: crop.season || "",
            durationDays: crop.durationDays || "",
            waterRequirement: crop.waterRequirement || "",
            recommendedSoil: crop.recommendedSoil || ""
        });
    };

    const handleCancelEdit = () => {
        setEditingCrop(null);
        setEditFormData({
            cropName: "",
            cropType: "",
            season: "",
            durationDays: "",
            waterRequirement: "",
            recommendedSoil: ""
        });
        setIsSubmitting(false);
        setError(null);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (cropId) => {
        if (!editFormData.cropName.trim()) {
            toast.error("Crop name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await editCrop(cropId, editFormData);
            if (result.success) {
                toast.success('Crop updated successfully');
                setEditingCrop(null);
                setEditFormData({
                    cropName: "",
                    cropType: "",
                    season: "",
                    durationDays: "",
                    waterRequirement: "",
                    recommendedSoil: ""
                });
            } else {
                toast.error(result.error || "Failed to update crop");
            }
        } catch (error) {
            console.error('Failed to update crop', error);
            toast.error("Failed to update crop");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearAllFilters = () => {
        setFilters({
            search: "",
            cropType: "all",
            season: "all",
            waterRequirement: "all",
            soilType: "all",
            sortBy: "cropName",
            sortOrder: "asc"
        });
    };

    const refreshCrops = async () => {
        try {
            await fetchCrops();
            toast.success('Crops refreshed successfully');
        } catch (error) {
            toast.error('Failed to refresh crops');
        }
    };

    const exportCrops = () => {
        const csvContent = [
            ['Crop Name', 'Crop Type', 'Season', 'Duration (Days)', 'Water Requirement', 'Recommended Soil'],
            ...filteredCrops.map(crop => [
                crop.cropName,
                crop.cropType,
                crop.season,
                crop.durationDays,
                crop.waterRequirement,
                crop.recommendedSoil
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crops-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('Crops exported successfully');
    };

    const hasActiveFilters = filters.search || filters.cropType !== "all" || filters.season !== "all" || filters.waterRequirement !== "all" || filters.soilType !== "all";

    // Get unique values for filter options
    const cropTypes = [...new Set(crops.map(crop => crop.cropType).filter(Boolean))];
    const seasons = [...new Set(crops.map(crop => crop.season).filter(Boolean))];
    const waterRequirements = [...new Set(crops.map(crop => crop.waterRequirement).filter(Boolean))];
    const soilTypes = [...new Set(crops.map(crop => crop.recommendedSoil).filter(Boolean))];

    // Get season badge style
    const getSeasonBadge = (season) => {
        switch (season) {
            case 'Yala':
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            case 'Maha':
                return "bg-blue-100 text-blue-800 border border-blue-200";
            case 'Both':
                return "bg-purple-100 text-purple-800 border border-purple-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    // Get water requirement badge style
    const getWaterBadge = (water) => {
        switch (water) {
            case 'Low':
                return "bg-green-100 text-green-800 border border-green-200";
            case 'Medium':
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            case 'High':
                return "bg-red-100 text-red-800 border border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-3">Loading crops data...</p>
                </div>
            </div>
        );
    }

    // Check permissions
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
                <p className="text-red-700 font-medium mb-2">Access Denied</p>
                <p className="text-red-600 text-sm">Administrator privileges required to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
        <div className="space-y-6">
  {/* Header with Buttons */}
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Crop Management</h2>
      <p className="text-gray-600 mt-1">Manage your crop database and varieties</p>
    </div>
    
    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
      <button
        onClick={refreshCrops}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
      >
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        Refresh
      </button>
      
      <button
        onClick={() => setShowCropForm(!showCropForm)}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
          showCropForm 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {showCropForm ? (
          <>
            <X size={18} />
            Cancel
          </>
        ) : (
          <>
            <Plus size={18} />
            Add New Crop
          </>
        )}
      </button>
    </div>
  </div>

  {/* Crop Form (shown conditionally) */}
  {showCropForm && (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200 animate-fade-in">
      <CropForm 
    //   onSuccess={handleCropAdded}
       />
    </div>
  )}

  {/* Rest of your content goes here */}
  {/* For example, the CropList component or other content */}
</div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Crops</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{crops.length}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Sprout className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Seasonal Crops</p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                                {crops.filter(c => c.cropType === 'Seasonal').length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Calendar className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Low Water</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                {crops.filter(c => c.waterRequirement === 'Low').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Droplet className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Maha Season</p>
                            <p className="text-2xl font-bold text-purple-600 mt-2">
                                {crops.filter(c => c.season === 'Maha').length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Sun className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search crops by name, type, season..."
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
                            value={filters.cropType}
                            onChange={(e) => handleFilterChange("cropType", e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                        >
                            <option value="all">All Types</option>
                            {cropTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select
                            value={filters.season}
                            onChange={(e) => handleFilterChange("season", e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                        >
                            <option value="all">All Seasons</option>
                            {seasons.map(season => (
                                <option key={season} value={season}>{season}</option>
                            ))}
                        </select>

                        <select
                            value={filters.waterRequirement}
                            onChange={(e) => handleFilterChange("waterRequirement", e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                        >
                            <option value="all">All Water Needs</option>
                            {waterRequirements.map(water => (
                                <option key={water} value={water}>{water}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                        >
                            {filters.sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <button
                            onClick={exportCrops}
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
                            {filters.cropType !== "all" && (
                                <span className="bg-green-100 px-3 py-1 rounded-full text-sm">Type: {filters.cropType}</span>
                            )}
                            {filters.season !== "all" && (
                                <span className="bg-green-100 px-3 py-1 rounded-full text-sm">Season: {filters.season}</span>
                            )}
                            {filters.waterRequirement !== "all" && (
                                <span className="bg-green-100 px-3 py-1 rounded-full text-sm">Water: {filters.waterRequirement}</span>
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

            {/* Crops Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Crop Database</h2>
                            <p className="text-green-100 text-sm mt-1">
                                {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                                Total: {crops.length}
                            </div>
                            <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                                Seasonal: {crops.filter(c => c.cropType === 'Seasonal').length}
                            </div>
                        </div>
                    </div>
                </div>

                {filteredCrops.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <Sprout size={48} className="mb-3 opacity-50" />
                            <p className="text-lg font-medium text-gray-500 mb-2">No crops found</p>
                            <p className="text-sm text-gray-400 max-w-md">
                                {hasActiveFilters 
                                    ? "No crops match your search criteria. Try adjusting your filters."
                                    : "Start by adding the first crop to your database."}
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
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Crop Information
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Type & Season
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Water & Soil
                                    </th>
                                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCrops.map((crop) => (
                                    <tr key={crop.id} className="hover:bg-green-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                                                        <Sprout size={20} />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    {editingCrop === crop.id ? (
                                                        <input
                                                            type="text"
                                                            name="cropName"
                                                            value={editFormData.cropName}
                                                            onChange={handleEditInputChange}
                                                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                                                            required
                                                        />
                                                    ) : (
                                                        <h4 className="text-sm font-semibold text-gray-900">
                                                            {crop.cropName}
                                                        </h4>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <div className="space-y-2">
                                                {editingCrop === crop.id ? (
                                                    <select
                                                        name="cropType"
                                                        value={editFormData.cropType}
                                                        onChange={handleEditInputChange}
                                                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                                                    >
                                                        <option value="Seasonal">Seasonal</option>
                                                        <option value="Perennial">Perennial</option>
                                                    </select>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                        {crop.cropType}
                                                    </span>
                                                )}
                                                
                                                {editingCrop === crop.id ? (
                                                    <select
                                                        name="season"
                                                        value={editFormData.season}
                                                        onChange={handleEditInputChange}
                                                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                                                    >
                                                        <option value="Yala">Yala</option>
                                                        <option value="Maha">Maha</option>
                                                        <option value="Both">Both</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSeasonBadge(crop.season)}`}>
                                                        <Sun size={12} className="inline mr-1" />
                                                        {crop.season}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            {editingCrop === crop.id ? (
                                                <input
                                                    type="number"
                                                    name="durationDays"
                                                    value={editFormData.durationDays}
                                                    onChange={handleEditInputChange}
                                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                                                    min="1"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Calendar size={14} />
                                                    <span className="font-medium">{crop.durationDays} days</span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-4 px-6">
                                            <div className="space-y-2">
                                                {editingCrop === crop.id ? (
                                                    <select
                                                        name="waterRequirement"
                                                        value={editFormData.waterRequirement}
                                                        onChange={handleEditInputChange}
                                                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getWaterBadge(crop.waterRequirement)}`}>
                                                        <Droplet size={12} className="inline mr-1" />
                                                        {crop.waterRequirement}
                                                    </span>
                                                )}
                                                
                                                {editingCrop === crop.id ? (
                                                    <select
                                                        name="recommendedSoil"
                                                        value={editFormData.recommendedSoil}
                                                        onChange={handleEditInputChange}
                                                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                                                    >
                                                        <option value="Clay">Clay</option>
                                                        <option value="Sandy">Sandy</option>
                                                        <option value="Loamy">Loamy</option>
                                                        <option value="Silty">Silty</option>
                                                        <option value="Peaty">Peaty</option>
                                                        <option value="Chalky">Chalky</option>
                                                    </select>
                                                ) : (
                                                    <div className="text-sm text-gray-700">
                                                        {crop.recommendedSoil}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <div className="flex justify-center gap-2">
                                                {editingCrop === crop.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditSubmit(crop.id)}
                                                            disabled={isSubmitting}
                                                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50"
                                                            title="Save changes"
                                                        >
                                                            {isSubmitting ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <Save size={16} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                            title="Cancel edit"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(crop)}
                                                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                            title="Edit crop"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to delete "${crop.cropName}"?`)) {
                                                                    handleDelete(crop.id);
                                                                }
                                                            }}
                                                            disabled={deletingId === crop.id}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                deletingId === crop.id 
                                                                    ? 'text-gray-400 cursor-not-allowed'
                                                                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                            }`}
                                                            title="Delete crop"
                                                        >
                                                            {deletingId === crop.id ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={16} />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer */}
                {filteredCrops.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
                            <div>
                                Showing <span className="font-semibold">{filteredCrops.length}</span> crop{filteredCrops.length !== 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                                        <ChevronUp size={16} />
                                    </button>
                                    <span className="px-2">Page 1 of 1</span>
                                    <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropList;