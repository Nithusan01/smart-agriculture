import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AddDeviceModal from './AddDeviceModal';
import DeviceCard from './DeviceCard';
import DeviceLivePanel from './DeviceLivePanel';
import { useDeviceAuth } from '../../contexts/DeviceAuthContext';
import DeviceInfoModal from './DeviceInfoModel';
import useDeviceRealtime from '../hooks/useDeviceRealtime';

const DevicesDashboard = () => {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('overview');
  const { 
    devices, 
    fetchUserDevices, 
    loading, 
    setSelectedDevice, 
    selectedDevice,
    handleRemoveDevice,
    showAddModal,
    setShowAddModal,
    handleAddDevice,
    getSelectedDeviceInfo 
  } = useDeviceAuth();
  const { connected, latest } = useDeviceRealtime(selectedDevice);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [formData, setFormData] = useState({ deviceId: '' });
  const [isLoading, setIsLoading] = useState(true);

  const handleDeviceSelect = (deviceId) => {
    setFormData({...formData, deviceId});
    const device = devices.find(d => d.id === deviceId);
    setSelectedDevice(device.deviceId);
  };

  useEffect(() => {
    if (formData.deviceId && devices.length > 0) {
      const device = devices.find(d => d.id === formData.deviceId);
      setSelectedDevice(device.deviceId);
    }
    setTimeout(() => setIsLoading(false), 500);
  }, [devices]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <h3 className="text-base font-semibold text-gray-700">Loading Devices</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Compact Header */}
        <div className="mb-6 mt-14">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IoT Devices</h1>
              <p className="text-gray-600 mt-1">Monitor and manage your devices</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeView === 'overview'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-th-large mr-2"></i>
                My Devices
              </button>
              {selectedDevice && (
                <button
                  onClick={() => setActiveView('details')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeView === 'details'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <i className="fas fa-chart-line mr-2"></i>
                  Details
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeView === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Device List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Your Devices</h2>
                    <p className="text-sm text-gray-600">Manage connected devices</p>
                  </div>
                  {devices.length > 0 && (
                    <button
                      onClick={() => fetchUserDevices()}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-sync-alt"></i>
                      Refresh
                    </button>
                  )}
                </div>

                {devices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-microchip text-blue-500 text-2xl"></i>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">No devices yet</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Add your first IoT device to start monitoring
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add First Device
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map((device) => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        isSelected={selectedDevice === device.deviceId}
                        onSelect={() => {
                          device.status === "active" 
                            ? setSelectedDevice(device.deviceId) 
                            : alert("⚠️ This device is inactive.")
                        }}
                        onRemove={() => handleRemoveDevice(device.deviceId)}
                      />
                    ))}
                    <div 
                      className="bg-white rounded-xl p-6 text-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer" 
                      onClick={() => setShowAddModal(true)}
                    >
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <i className="fas fa-plus text-blue-500 text-xl"></i>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">Add Device</h3>
                      <p className="text-xs text-gray-500">Connect a new device</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div>
              {selectedDevice ? (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <i className="fas fa-microchip text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Active Device</h3>
                      <p className="text-xs text-gray-500">Currently monitoring</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Device ID</p>
                    <p className="font-mono text-sm text-gray-800 font-semibold truncate">{selectedDevice}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveView('details')}
                      className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-chart-line"></i>
                      View Live Data
                    </button>
                    
                    <button
                      onClick={() => getSelectedDeviceInfo() && setShowInfoModal(true)}
                      className="w-full py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-info-circle"></i>
                      Device Info
                    </button>
                    
                    <button
                      onClick={() => handleRemoveDevice(selectedDevice)}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-trash-alt"></i>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-mouse-pointer text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">No Device Selected</h3>
                  <p className="text-sm text-gray-500">
                    Select a device to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Device Details View */
          <div className="space-y-4">
            {selectedDevice ? (
              <>
                {/* Header Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveView('overview')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                      >
                        <i className="fas fa-arrow-left"></i>
                        Back
                      </button>
                      
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Live Device Data</h2>
                        <p className="text-xs text-gray-500">Real-time monitoring</p>
                      </div>
                    </div>

                    {/* Connection Status */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      connected 
                        ? "bg-green-50 border border-green-200" 
                        : "bg-red-50 border border-red-200"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
                      <span className={`text-sm font-semibold ${connected ? "text-green-800" : "text-red-800"}`}>
                        {connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  {/* Device Selector */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Device Info */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-microchip text-blue-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-white text-gray-700 rounded border border-blue-200 font-medium truncate">
                              ID: {selectedDevice?.slice(0, 12)}...
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowInfoModal(true)}
                              className="px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-white rounded text-xs font-medium transition-all"
                              title="Device Details"
                            >
                              <i className="fas fa-info-circle mr-1"></i>
                              Info
                            </button>
                            <button
                              onClick={() => fetchUserDevices()}
                              className="px-2 py-1 text-gray-600 hover:text-green-600 hover:bg-white rounded text-xs font-medium transition-all"
                              title="Refresh"
                            >
                              <i className="fas fa-sync-alt mr-1"></i>
                              Refresh
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Device Selector Dropdown */}
                    <div className="lg:col-span-2">
                      <div className="relative">
                        <select
                          name="deviceId"
                          value={formData.deviceId}
                          onChange={(e) => handleDeviceSelect(e.target.value)}
                          disabled={devices.length === 0}
                          className="w-full p-3 pl-11 pr-10 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm appearance-none cursor-pointer transition-all hover:border-gray-300 disabled:opacity-50"
                        >
                          <option value="" disabled>
                            {devices.length === 0 ? 'No devices available' : 'Switch to another device...'}
                          </option>
                          {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                              {device.deviceName} ({device.status})
                            </option>
                          ))}
                        </select>
                        
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <i className="fas fa-microchip text-gray-400"></i>
                        </div>
                        
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <i className="fas fa-chevron-down text-gray-400"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Panel */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <DeviceLivePanel deviceId={selectedDevice} />
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-microchip text-gray-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Device Selected</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Select a device to view real-time data
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setActiveView('overview')}
                    className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-list"></i>
                    View Devices
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm border border-gray-300 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Add Device
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AddDeviceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddDevice}
        />
        {showInfoModal && (
          <DeviceInfoModal
            isOpen={showInfoModal}
            onClose={() => setShowInfoModal(false)}
            device={devices.find(d => d.deviceId === selectedDevice)}
          />
        )}
      </div>
    </div>
  );
};

export default DevicesDashboard;