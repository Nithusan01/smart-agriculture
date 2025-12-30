import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Edit,
  Trash2,
  Power,
  Search,
  Copy,
  Eye,
  EyeOff,
  Key,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
import { useDeviceAuth } from "../../contexts/DeviceAuthContext";
import { toast } from 'react-toastify';

const DeviceAdminPage = () => {
  const { 
    devices, 
    register, 
    deleteDevice, 
    fetchAllDevices, 
    updateDeviceStatus,
    updateDevice,
    regenerateSecretKey 
  } = useDeviceAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSecretKeys, setShowSecretKeys] = useState({});
  const [editingDevice, setEditingDevice] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const [formData, setFormData] = useState({
    deviceName: "",
    description: ""
  });

  useEffect(() => {
    fetchAllDevices();
  }, []);

  // Filter devices based on search and status
  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      device.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Refresh devices
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchAllDevices();
      toast.success('Devices refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh devices');
    } finally {
      setLoading(false);
    }
  };

  // Create new device
  const handleCreateDevice = async () => {
    if (!formData.deviceName.trim()) {
      toast.error('Device name is required');
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        toast.success('Device created successfully!');
        setFormData({ deviceName: "", description: "" });
        setShowForm(false);
        await fetchAllDevices();
      } else {
        toast.error(result.error || 'Failed to create device');
      }
    } catch (error) {
      toast.error('Failed to create device');
    } finally {
      setLoading(false);
    }
  };

  // Delete device with confirmation
  const handleDeleteDevice = async (deviceId, deviceName) => {
    if (!window.confirm(`Are you sure you want to delete device "${deviceName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [deviceId]: true }));
    try {
      await deleteDevice(deviceId);
      toast.success('Device deleted successfully');
    } catch (error) { 
      toast.error('Failed to delete device');
    } finally {
      setActionLoading(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  // Toggle device status
  const handleToggleStatus = async (device) => {
    const newStatus = device.status === 'active' ? 'inactive' : 'active';
    
    setActionLoading(prev => ({ ...prev, [device.id]: true }));
    try {
      const result = await updateDeviceStatus(device.id, newStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to update device status');
      }
    } catch (error) {
      toast.error('Failed to update device status');
    } finally {
      setActionLoading(prev => ({ ...prev, [device.id]: false }));
    }
  };

  // Regenerate secret key
  const handleRegenerateSecretKey = async (device) => {
    if (!window.confirm(`Are you sure you want to regenerate the secret key for "${device.deviceName}"? This will invalidate the current key.`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [device.id]: true }));
    try {
      const result = await regenerateSecretKey(device.id);
      if (result.success) {
        toast.success(result.message);
        // Hide the secret key after regeneration
        setShowSecretKeys(prev => ({ ...prev, [device.id]: false }));
      } else {
        toast.error(result.error || 'Failed to regenerate secret key');
      }
    } catch (error) {
      toast.error('Failed to regenerate secret key');
    } finally {
      setActionLoading(prev => ({ ...prev, [device.id]: false }));
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Toggle secret key visibility
  const toggleSecretKeyVisibility = (deviceId) => {
    setShowSecretKeys(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Never";
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return "bg-green-100 text-green-800 border border-green-200";
      case 'inactive':
        return "bg-red-100 text-red-800 border border-red-200";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className="inline mr-1" />;
      case 'inactive':
        return <X size={14} className="inline mr-1" />;
      case 'pending':
        return <Clock size={14} className="inline mr-1" />;
      default:
        return <AlertCircle size={14} className="inline mr-1" />;
    }
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setFormData({
      deviceName: device.deviceName,
      description: device.description || ""
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDevice(null);
    setFormData({
      deviceName: "",
      description: ""
    });
  };

  const handleUpdateDevice = async () => {
    if (!formData.deviceName.trim()) {
      toast.error('Device name is required');
      return;
    }

    setLoading(true);
    try {
      const result = await updateDevice(editingDevice.id, formData);
      if (result.success) {
        toast.success('Device updated successfully!');
        handleCancelForm();
        await fetchAllDevices();
      } else {
        toast.error(result.error || 'Failed to update device');
      }
    } catch (error) {
      toast.error('Failed to update device');
    } finally {
      setLoading(false);
    }
  };

  // Export devices to CSV
  const handleExportDevices = () => {
    const csvContent = [
      ['Device Name', 'Device ID', 'Status', 'Last Seen', 'Created At'],
      ...devices.map(device => [
        device.deviceName,
        device.deviceId,
        device.status,
        formatLastSeen(device.last_seen),
        new Date(device.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Devices exported successfully');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Device Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your IoT devices and monitor their status
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => {
              setEditingDevice(null);
              setFormData({ deviceName: "", description: "" });
              setShowForm(!showForm);
            }}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
              showForm
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {showForm ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={18} />
                Add New Device
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Device Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingDevice ? "✏️ Edit Device" : "➕ Register New Device"}
            </h2>
            {editingDevice && (
              <button
                type="button"
                onClick={handleCancelForm}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                <span>Cancel Edit</span>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Device Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter device name (e.g., Field Sensor 01)"
                value={formData.deviceName}
                onChange={(e) =>
                  setFormData({ ...formData, deviceName: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter device description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Fields marked with <span className="text-red-500">*</span> are required
            </div>

            <button
              onClick={editingDevice ? handleUpdateDevice : handleCreateDevice}
              disabled={loading}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {editingDevice ? 'Updating...' : 'Creating...'}
                </>
              ) : editingDevice ? (
                <>
                  <CheckCircle size={18} />
                  Update Device
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Device
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{devices.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {devices.filter(d => d.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {devices.filter(d => d.status === 'inactive').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <X className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {devices.filter(d => d.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search devices by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <button
              onClick={handleExportDevices}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Device Database</h2>
              <p className="text-green-100 text-sm mt-1">
                {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                Active: {devices.filter(d => d.status === 'active').length}
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-1 text-white text-sm">
                Inactive: {devices.filter(d => d.status === 'inactive').length}
              </div>
            </div>
          </div>
        </div>

        {filteredDevices.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-500 mb-2">No devices found</p>
            <p className="text-gray-400">
              {devices.length === 0 
                ? "Start by adding your first device."
                : "Try adjusting your search or filter criteria."}
            </p>
            {devices.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-green-600 hover:text-green-700 underline"
              >
                Add your first device
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Device Information
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Secret Key
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-green-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {device.deviceName}
                        </div>
                        <div className="text-sm text-gray-500 font-mono mt-1">
                          ID: {device.deviceId}
                        </div>
                        {device.description && (
                          <div className="text-sm text-gray-500 mt-2">
                            {device.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          Created: {new Date(device.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <code className="block bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono truncate">
                            {showSecretKeys[device.id]
                              ? device.secretKey
                              : "•".repeat(16)}
                          </code>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => toggleSecretKeyVisibility(device.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={showSecretKeys[device.id] ? "Hide secret key" : "Show secret key"}
                          >
                            {showSecretKeys[device.id] ? (
                              <EyeOff size={14} className="text-gray-600" />
                            ) : (
                              <Eye size={14} className="text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyToClipboard(device.secretKey, "Secret Key")}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy secret key"
                          >
                            <Copy size={14} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleRegenerateSecretKey(device)}
                            disabled={actionLoading[device.id]}
                            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                            title="Regenerate secret key"
                          >
                            <Key size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(device.status)}`}>
                        {getStatusIcon(device.status)}
                        {device.status}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={14} />
                        {formatLastSeen(device.last_seen)}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(device)}
                          disabled={actionLoading[device.id]}
                          className={`p-2 rounded-lg transition-colors ${
                            device.status === "active"
                              ? "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                              : "text-green-600 hover:bg-green-50 hover:text-green-700"
                          } disabled:opacity-50`}
                          title={device.status === "active" ? "Deactivate device" : "Activate device"}
                        >
                          <Power size={16} />
                        </button>

                        <button
                          onClick={() => handleEditDevice(device)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50"
                          title="Edit device"
                          disabled={actionLoading[device.id]}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteDevice(device.id, device.deviceName)}
                          disabled={actionLoading[device.id]}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Delete device"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceAdminPage;