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
              <button
                onClick={() => {
                   setShowAddModal(true);}}
                 className={'px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-blue-500 hover:text-white hover:shadow-lg'}
              >
                <i className="fas fa-plus-circle"></i>
                Add Device
              </button>
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
                    <button
                      onClick={() => fetchUserDevices()}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-sync-alt"></i>
                      Refresh
                    </button>
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
                        key={device.id}
                        device={device}
                        isSelected={selectedDevice === device.deviceId}
                        onSelect={() => {device.status === "active" ? setSelectedDevice(device.deviceId) : alert("⚠️ This device is inactive. Please contact the admin.")}}
                        onRemove={() => handleRemoveDevice(device.deviceId)}
                        onViewInfo={() => {
                          getSelectedDeviceInfo();
                          setShowInfoModal(true);
                        }}
                      />
                    ))}
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
          <div>
            {selectedDevice ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveView('overview')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-arrow-left"></i>
                      Back to Devices
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Live Device Data</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      connected ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                      <span className={`text-sm font-medium ${connected ? "text-green-700" : "text-red-700"}`}>
                        {connected ? "Connected" : "Disconnected"}
                      </span>
                    </div> */}
                    <button
                      onClick={() => getSelectedDeviceInfo() && setShowInfoModal(true)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                    >
                      <i className="fas fa-cog mr-2"></i>
                      Settings
                    </button>
                  </div>
                </div>
                
                <DeviceLivePanel deviceId={selectedDevice} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-microchip text-gray-400 text-4xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No Device Selected</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Please select a device from the overview to view detailed sensor data and analytics
                </p>
                <button
                  onClick={() => setActiveView('overview')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Device List
                </button>
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

        {selectedDevice && (
          <DeviceInfoModal
            isOpen={showInfoModal}
            onClose={() => setShowInfoModal(false)}
            device={getSelectedDeviceInfo()}
            onRemove={() => {
              handleRemoveDevice(selectedDevice);
              setShowInfoModal(false);
            }}
          />
        )}
        
      </div>
    </div>
  );
};

export default DevicesDashboard;