import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import AddDeviceModal from './AddDeviceModal';
import DeviceCard from './DeviceCard';
import DeviceLivePanel from './DeviceLivePanel';
import { useDeviceAuth } from '../../contexts/DeviceAuthContext';
import DeviceInfoModal from './DeviceInfoModel';
import useDeviceRealtime from '../hooks/useDeviceRealtime';

const DevicesDashboard = () => {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'details'
  const { devices, stats, fetchUserDevices, loading, setSelectedDevice, selectedDevice,handleRemoveDevice,showAddModal,setShowAddModal,handleAddDevice,getSelectedDeviceInfo } = useDeviceAuth();
  const { connected } = useDeviceRealtime(selectedDevice);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [formData, setFormData] = useState({
  deviceId: '',
  // other form fields
});

// Update both when device is selected
const handleDeviceSelect = (deviceId) => {
  setFormData({...formData, deviceId});
  const device = devices.find(d => d.id === deviceId);
  setSelectedDevice(device.deviceId);
};

// Initialize selectedDevice from formData on component mount
useEffect(() => {
  if (formData.deviceId && devices.length > 0) {
    const device = devices.find(d => d.id === formData.deviceId);
    setSelectedDevice(device.deviceId);
  }
}, [devices]); // Run when devices are loaded

  // const handleAddDevice = async (deviceData) => {
  //   try {
  //     const response = await api.post('/device/add-to-user', deviceData);
  //     if (response.data.success) {
  //       setShowAddModal(false);
  //       fetchUserDevices();
  //       alert('✅ Device added successfully!');
  //     }
  //   } catch (error) {
  //     alert(error.response?.data?.message || '❌ Failed to add device');
  //   }
  // };

  // const getSelectedDeviceInfo = () => {
  //   if (!selectedDevice) return null;
  //   return devices.find(d => d.deviceId === selectedDevice) || null;
  // };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">Loading Dashboard</h3>
          <p className="text-gray-500 mt-2">Fetching your IoT devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Dashboard Header */}
        <div className="mb-10 mt-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                IoT Device Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Monitor, manage, and control your agricultural IoT devices in real-time
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeView === 'overview'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-th-large"></i>
               My Devices
              </button>
              {selectedDevice && (
              <button
                onClick={() => setActiveView('details')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeView === 'details'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
                disabled={!selectedDevice}
              >
                <i className="fas fa-chart-line"></i>
                Device Details
              </button>
              )}
              {/* <button
                onClick={() => {
                   setShowAddModal(true);}}
                 className={'px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-blue-500 hover:text-white hover:shadow-lg'}
              >
                <i className="fas fa-plus-circle"></i>
                Add Device
              </button> */}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {activeView === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Device List Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Your IoT Devices</h2>
                    <p className="text-gray-600 mt-1">Manage all your connected devices</p>
                  </div>
                  <div className="flex gap-3 mt-4 sm:mt-0">
                    {devices.length > 0 && (
                    <button
                      onClick={() => fetchUserDevices()}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-sync-alt"></i>
                      Refresh
                    </button>)}
                  </div>
                </div>

                {devices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-6">
                      <i className="fas fa-microchip text-blue-500 text-4xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No devices yet</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Add your first IoT device to start monitoring your agricultural environment
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Your First Device
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {devices.map((device) => (
                      <DeviceCard
                      className="cursor-pointer "
                        key={device.id}
                        device={device}
                        isSelected={selectedDevice === device.deviceId}
                        onSelect={() => {device.status === "active" ? setSelectedDevice(device.deviceId) : alert("⚠️ This device is inactive. Please contact the admin.")}}
                        onRemove={() => handleRemoveDevice(device.deviceId)}
                       
                      />
                    ))}
                    <div className="bg-white rounded-2xl hover:shadow-lg p-8 text-center border-2 border border-gray-200 hover:border-blue-500" onClick={()=> setShowAddModal(true)}>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6  cursor-pointer " onClick={() => setShowAddModal(true)}>
                    <i className="fas fa-plus text-blue-500 text-3xl "></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Device </h3>
                  <p className="text-gray-500 mb-6">
                    Add a device here to view its data and manage settings
                  </p>
                </div>

                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Device Info & Actions */}
            <div className="space-y-8">
              {/* Selected Device Panel */}
              {selectedDevice ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <i className="fas fa-microchip text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Active Device</h3>
                      <p className="text-sm text-gray-500">Currently monitoring</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Device ID</p>
                      <p className="font-mono text-gray-800 font-semibold truncate">{selectedDevice}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveView('details')}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-chart-line"></i>
                      View Live Data
                    </button>
                    
                    <button
                      onClick={() => getSelectedDeviceInfo() && setShowInfoModal(true)}
                      className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-info-circle"></i>
                      Device Details
                    </button>
                    
                    <button
                      onClick={() => handleRemoveDevice(selectedDevice)}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-trash-alt"></i>
                      Remove Device
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-mouse-pointer text-gray-400 text-3xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Device Selected</h3>
                  <p className="text-gray-500 mb-6">
                    Select a device from the list to view its data and manage settings
                  </p>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* Device Details View */
          
 <div className="space-y-8">
  {selectedDevice ? (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        {/* Back Button and Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('overview')}
              className="
                px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 
                hover:from-gray-100 hover:to-gray-200 
                text-gray-700 rounded-xl font-medium 
                transition-all duration-200 
                border border-gray-200 hover:border-gray-300
                shadow-sm hover:shadow-md
                flex items-center gap-3
                group hover:-translate-x-1
                active:scale-[0.98]
              "
            >
              <div className="
                w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300
                flex items-center justify-center 
                group-hover:scale-110 transition-transform
              ">
                <i className="fas fa-arrow-left text-gray-600 text-sm"></i>
              </div>
              <span className="whitespace-nowrap">All Devices</span>
            </button>
            
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800">
                Live Device Data
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Real-time monitoring and analytics for {selectedDevice.deviceName || 'selected device'}
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className={`
            flex items-center gap-3 px-5 py-3 rounded-xl 
            ${connected 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-green-100/50" 
              : "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 shadow-red-100/50"
            }
            shadow-sm hover:shadow-md transition-all duration-300
            self-start sm:self-auto
          `}>
            <div className="relative">
              <div className={`
                w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}
                animate-pulse
              `}></div>
              <div className={`
                absolute inset-0 rounded-full ${connected ? "bg-green-500" : "bg-red-500"} 
                animate-ping opacity-40
              `}></div>
            </div>
            <span className={`text-sm font-semibold ${connected ? "text-green-800" : "text-red-800"}`}>
              {connected ? "Live Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Device Selector Card */}
        <div className="
          bg-gradient-to-br from-white to-gray-50 
          rounded-2xl border border-gray-200 
          shadow-sm p-6
        ">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Info Section */}
            <div className="lg:col-span-1">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Device Icon */}
                  <div className="
                    w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 
                    flex items-center justify-center flex-shrink-0 shadow-sm
                  ">
                    <i className="fas fa-microchip text-blue-600 text-lg"></i>
                  </div>

                  {/* Device Info */}
                  <div className="flex-1 min-w-0">
                    {/* ID Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="
                        text-xs px-3 py-1.5 bg-white text-gray-700 rounded-lg 
                        border border-blue-200 font-medium
                        flex items-center gap-2
                      ">
                        <i className="fas fa-fingerprint text-blue-500 text-xs"></i>
                        ID: {selectedDevice?.slice(0, 12)}...
                      </span>

                      {/* Status Badge */}
                      <span className="
                        text-xs px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 
                        text-green-700 rounded-lg border border-green-200
                        flex items-center gap-2
                      ">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        Online
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Info Button */}
                      <button
                        onClick={() => setShowInfoModal(true)}
                        className="
                          px-3 py-2 text-gray-600 hover:text-blue-600 
                          hover:bg-white rounded-lg transition-all duration-200
                          border border-transparent hover:border-blue-200
                          flex items-center gap-2 text-xs font-medium
                          hover:shadow-sm
                        "
                        title="Device Details"
                      >
                        <i className="fas fa-info-circle text-sm"></i>
                        Details
                      </button>

                      {/* Refresh Button */}
                      <button
                        onClick={() => fetchUserDevices()}
                        className="
                          px-3 py-2 text-gray-600 hover:text-green-600 
                          hover:bg-white rounded-lg transition-all duration-200
                          border border-transparent hover:border-green-200
                          flex items-center gap-2 text-xs font-medium
                          hover:shadow-sm
                        "
                        title="Refresh Data"
                      >
                        <i className="fas fa-sync-alt text-sm"></i>
                        Refresh
                      </button>

                      {/* More Actions
                      <button
                        className="
                          px-3 py-2 text-gray-600 hover:text-purple-600 
                          hover:bg-white rounded-lg transition-all duration-200
                          border border-transparent hover:border-purple-200
                          flex items-center gap-2 text-xs font-medium
                          hover:shadow-sm
                        "
                        title="More Actions"
                      >
                        <i className="fas fa-ellipsis-h text-sm"></i>
                        More
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Selector Section */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {/* Header with label and count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg 
                      className="w-4 h-4 text-green-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <label className="text-sm font-semibold text-gray-700">
                      Switch to Another Device
                    </label>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                    {devices.length} device{devices.length !== 1 ? 's' : ''} available
                  </span>
                </div>

                {/* Select Dropdown */}
                <div className="relative group">
                  <select
                    id="device-select"
                    name="deviceId"
                    value={formData.deviceId}
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                    disabled={devices.length === 0}
                    className="
                      w-full p-4 pl-12 pr-12 bg-white 
                      border-2 border-gray-200 rounded-xl 
                      focus:outline-none focus:border-green-500 
                      focus:ring-4 focus:ring-green-100/50 
                      text-gray-800 appearance-none 
                      cursor-pointer transition-all duration-200 
                      hover:border-gray-300 hover:shadow-sm
                      disabled:opacity-50 disabled:cursor-not-allowed
                      peer
                    "
                    aria-label="Select a device"
                  >
                    <option value="" disabled className="text-gray-400">
                      {devices.length === 0 ? 'No devices available' : 'Select another device...'}
                    </option>
                    {devices.map((device) => (
                      <option 
                        key={device.id} 
                        value={device.id}
                        className="py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium px-3"> {device.deviceName}</span>
                          <span className="text-gray-500 text-sm px-3"> ({ device.status})</span>
                        </div>
                      </option>
                    ))}
                  </select>

                  {/* Device Icon */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="
                      w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 
                      flex items-center justify-center
                    ">
                      <i className="fas fa-microchip text-gray-500 text-sm "></i>
                    </div>
                  </div>

                  {/* Chevron Icon */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg 
                      className="w-5 h-5 text-gray-400 peer-hover:text-gray-600 peer-focus:text-green-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </div>
                </div>

            
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Panel */}
      <div className="
        bg-gradient-to-br from-white to-gray-50 
        rounded-2xl border border-gray-200 
        shadow-sm overflow-hidden
      ">
        <DeviceLivePanel deviceId={selectedDevice} />
      </div>
    </div>
  ) : (
    /* Empty State */
    <div className="
      bg-gradient-to-br from-white to-gray-50 
      rounded-2xl border border-gray-200 
      shadow-sm p-12 text-center
      max-w-2xl mx-auto
    ">
      <div className="
        w-28 h-28 mx-auto 
        bg-gradient-to-br from-gray-100 to-gray-200 
        rounded-full flex items-center justify-center mb-8
        shadow-inner
      ">
        <i className="fas fa-microchip text-gray-400 text-5xl"></i>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        No Device Selected
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
        Select a device from your inventory to view real-time sensor data and analytics
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setActiveView('overview')}
          className="
            px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 
            hover:from-blue-600 hover:to-blue-700 
            text-white rounded-xl font-semibold 
            shadow-lg hover:shadow-xl 
            transition-all duration-200 
            hover:-translate-y-0.5
            flex items-center justify-center gap-3
            min-w-[200px]
          "
        >
          <i className="fas fa-list text-lg"></i>
          View All Devices
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="
            px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 
            hover:from-gray-200 hover:to-gray-300 
            text-gray-700 rounded-xl font-semibold 
            border border-gray-300
            shadow-sm hover:shadow-md 
            transition-all duration-200 
            hover:-translate-y-0.5
            flex items-center justify-center gap-3
            min-w-[200px]
          "
        >
          <i className="fas fa-plus text-lg text-gray-500"></i>
          Add New Device
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
          onRemove={() => {
            if (onRemove) onRemove();
            setShowInfoModal(false);
          }}
        />
      )}
  
        
      </div>
    </div>
  );
};

export default DevicesDashboard;