import { useEffect, useState, useMemo } from 'react';
import { removeCrop, getCrops } from '../../services/cropApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from "../common/LoadingSpinner.jsx"

const CropList = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const { currentUser } = useAuth();

    // Advanced search states
    const [filters, setFilters] = useState({
        search: "",
        cropType: "all",
        season: "all",
        waterRequirement: "all",
        soilType: "all",
        sortBy: "cropName",
        sortOrder: "asc"
    })

    const [debouncedSearch, setDebouncedSearch] = useState("");

    const fetchCrops = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCrops();
            setCrops(response?.data?.data || []);
        } catch (error) {
            console.error('Error fetching crops:', error);
            setError('Failed to fetch crops');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrops();
        const handleCropsUpdate = () => fetchCrops();
        window.addEventListener('cropsUpdated', handleCropsUpdate);
        
        return () => {
            window.removeEventListener('cropsUpdated', handleCropsUpdate);
        }
    }, []);

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

    const handleDelete = async (cropId) => {
        if (!window.confirm('Are you sure you want to delete this crop?')) {
            return;
        }
        
        try {
            setDeletingId(cropId);
            setError(null);
            await removeCrop(cropId);
            setCrops((prevCrops) => prevCrops.filter((crop) => crop.id !== cropId));
        } catch (error) {
            console.error('Failed to delete crop:', error);
            setError('Failed to delete crop');
        } finally {
            setDeletingId(null);
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

    const hasActiveFilters = filters.search || filters.cropType !== "all" || filters.season !== "all" || filters.waterRequirement !== "all" || filters.soilType !== "all";

    // Get unique values for filter options
    const cropTypes = [...new Set(crops.map(crop => crop.cropType).filter(Boolean))];
    const seasons = [...new Set(crops.map(crop => crop.season).filter(Boolean))];
    const waterRequirements = [...new Set(crops.map(crop => crop.waterRequirement).filter(Boolean))];
    const soilTypes = [...new Set(crops.map(crop => crop.recommendedSoil).filter(Boolean))];

    // Show loading state
    if (loading) {
        return <div className="p-4"><LoadingSpinner /></div>;
    }

    // Check permissions
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="p-4 text-red-600">
                Access denied. Administrator privileges required to view this page.
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header with Search and Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Crop Management ({filteredCrops.length} of {crops.length} crops)
                </h2>

                {/* Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 lg:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search crops by name, type, season..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleFilterChange("search", "")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
                            >
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={filters.cropType}
                            onChange={(e) => handleFilterChange("cropType", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            <option value="all">All Types</option>
                            {cropTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select
                            value={filters.season}
                            onChange={(e) => handleFilterChange("season", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            <option value="all">All Seasons</option>
                            {seasons.map(season => (
                                <option key={season} value={season}>{season}</option>
                            ))}
                        </select>

                        <select
                            value={filters.waterRequirement}
                            onChange={(e) => handleFilterChange("waterRequirement", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            <option value="all">All Water Needs</option>
                            {waterRequirements.map(water => (
                                <option key={water} value={water}>{water}</option>
                            ))}
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            <option value="cropName">Sort by Name</option>
                            <option value="durationDays">Sort by Duration</option>
                            <option value="cropType">Sort by Type</option>
                            <option value="season">Sort by Season</option>
                        </select>

                        <button
                            onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Results Info */}
            {hasActiveFilters && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-green-800">
                        <span>Active filters:</span>
                        {filters.search && (
                            <span className="bg-green-100 px-2 py-1 rounded">Search: "{filters.search}"</span>
                        )}
                        {filters.cropType !== "all" && (
                            <span className="bg-green-100 px-2 py-1 rounded">Type: {filters.cropType}</span>
                        )}
                        {filters.season !== "all" && (
                            <span className="bg-green-100 px-2 py-1 rounded">Season: {filters.season}</span>
                        )}
                        {filters.waterRequirement !== "all" && (
                            <span className="bg-green-100 px-2 py-1 rounded">Water: {filters.waterRequirement}</span>
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

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="flex justify-between items-center">
                        <span>{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            className="font-bold text-red-800 hover:text-red-900"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Crops Table */}
            {filteredCrops.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    {hasActiveFilters ? (
                        <>
                            <div className="text-gray-400 text-lg mb-2">No crops match your search criteria</div>
                            <div className="text-gray-500 text-sm">Try adjusting your filters or search terms</div>
                            <button
                                onClick={clearAllFilters}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                Clear All Filters
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-gray-400 text-lg mb-2">No crops found</div>
                            <div className="text-gray-500 text-sm">Crops will appear here once added</div>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleFilterChange("sortBy", "cropName")}>
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleFilterChange("sortBy", "cropType")}>
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleFilterChange("sortBy", "season")}>
                                        Season
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleFilterChange("sortBy", "durationDays")}>
                                        Duration (Days)
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Water Requirement
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Recommended Soil
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCrops.map((crop, index) => (
                                    <tr
                                        key={crop.id}
                                        className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {crop.cropName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {crop.cropType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                crop.season === 'Yala' 
                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                    : crop.season === 'Maha'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {crop.season}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {crop.durationDays} days
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                crop.waterRequirement === 'Low' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : crop.waterRequirement === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {crop.waterRequirement}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {crop.recommendedSoil}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(crop.id)}
                                                disabled={deletingId === crop.id}
                                                className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingId === crop.id ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Deleting
                                                    </span>
                                                ) : (
                                                    'Delete'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropList;