import React, { useState, useEffect } from "react";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaPowerOff, 
  FaSearch,
  FaSync,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaKey
} from "react-icons/fa";
import { X, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
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
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-600 text-white`;
      case 'inactive':
        return `${baseClasses} bg-red-600 text-white`;
      case 'pending':
        return `${baseClasses} bg-yellow-600 text-white`;
      default:
        return `${baseClasses} bg-gray-600 text-white`;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="inline mr-1" />;
      case 'inactive':
        return <X size={16} className="inline mr-1" />;
      case 'pending':
        return <Clock size={16} className="inline mr-1" />;
      default:
        return <AlertCircle size={16} className="inline mr-1" />;
    }
  };

  return (
    <div className="p-6 text-white min-h-screen bg-gray-900">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Device Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your IoT devices and monitor their status
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
              showForm
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {showForm ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <FaPlus size={18} />
                Add New Device
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Device Form */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Register New Device
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Device Name *
              </label>
              <input
                type="text"
                placeholder="Enter device name"
                value={formData.deviceName}
                onChange={(e) =>
                  setFormData({ ...formData, deviceName: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="Enter device description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div> */}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateDevice}
              disabled={loading || !formData.deviceName.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Device"}
            </button>
            
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by device name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Devices ({filteredDevices.length})
          </h3>
        </div>

        {filteredDevices.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No devices found</p>
            {devices.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 underline"
              >
                Create your first device
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4 text-left text-gray-300 font-semibold">
                    Device
                  </th>
                  <th className="p-4 text-left text-gray-300 font-semibold">
                    Secret Key
                  </th>
                  <th className="p-4 text-left text-gray-300 font-semibold">
                    Status
                  </th>
                  <th className="p-4 text-left text-gray-300 font-semibold">
                    Last Seen
                  </th>
                  <th className="p-4 text-center text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDevices.map((device) => (
                  <tr
                    key={device.id}
                    className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">
                          {device.deviceName}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">
                          {device.deviceId}
                        </div>
                        {device.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {device.description}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                          {showSecretKeys[device.id]
                            ? device.secretKey
                            : "•".repeat(16)}
                        </code>
                        <button
                          onClick={() =>
                            toggleSecretKeyVisibility(device.id)
                          }
                          className="text-gray-400 hover:text-white transition-colors"
                          title={
                            showSecretKeys[device.id]
                              ? "Hide secret key"
                              : "Show secret key"
                          }
                        >
                          {showSecretKeys[device.id] ? (
                            <FaEyeSlash size={14} />
                          ) : (
                            <FaEye size={14} />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleCopyToClipboard(
                              device.secretKey,
                              "Secret Key"
                            )
                          }
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="Copy secret key"
                        >
                          <FaCopy size={14} />
                        </button>
                        <button
                          onClick={() => handleRegenerateSecretKey(device)}
                          disabled={actionLoading[device.id]}
                          className="text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                          title="Regenerate secret key"
                        >
                          <FaKey size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={getStatusBadge(device.status)}>
                        {getStatusIcon(device.status)}
                        {device.status}
                      </span>
                    </td>

                    <td className="p-4 text-gray-300">
                      {formatLastSeen(device.last_seen)}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggleStatus(device)}
                          disabled={actionLoading[device.id]}
                          className={`p-2 rounded-lg transition-colors ${
                            device.status === "active"
                              ? "text-yellow-400 hover:bg-yellow-400 hover:text-white"
                              : "text-green-400 hover:bg-green-400 hover:text-white"
                          } disabled:opacity-50`}
                          title={
                            device.status === "active"
                              ? "Deactivate device"
                              : "Activate device"
                          }
                        >
                          <FaPowerOff size={16} />
                        </button>

                        <button
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-400 hover:text-white transition-colors disabled:opacity-50"
                          title="Edit device"
                          disabled={actionLoading[device.id]}
                        >
                          <FaEdit size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteDevice(device.id, device.deviceName)
                          }
                          disabled={actionLoading[device.id]}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400 hover:text-white transition-colors disabled:opacity-50"
                          title="Delete device"
                        >
                          <FaTrash size={16} />
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white">{devices.length}</div>
          <div className="text-gray-400 text-sm">Total Devices</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-400">
            {devices.filter(d => d.status === 'active').length}
          </div>
          <div className="text-gray-400 text-sm">Active</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-400">
            {devices.filter(d => d.status === 'inactive').length}
          </div>
          <div className="text-gray-400 text-sm">Inactive</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {devices.filter(d => d.status === 'pending').length}
          </div>
          <div className="text-gray-400 text-sm">Pending</div>
        </div>
      </div>
    </div>
  );
};

export default DeviceAdminPage;