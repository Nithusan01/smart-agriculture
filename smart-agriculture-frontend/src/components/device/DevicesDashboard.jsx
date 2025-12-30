import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import AddDeviceModal from './AddDeviceModal';
import DeviceCard from './DeviceCard';
import DeviceLivePanel from './DeviceLivePanel';
//import DeviceInfoModal from '../components/DeviceInfoModal';

const DevicesDashboard = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalReadings: 0
  });
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    if (currentUser) {
      fetchUserDevices();
    }
  }, [currentUser]);

  const fetchUserDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get('device/user-devices');
      if (response.data.success) {
        setDevices(response.data.devices || []);
        calculateStats(response.data.devices);
        setSelectedDevice(response.data.devices[0]?.deviceId || null);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const calculateStats = (deviceList) => {
    setStats({
      totalDevices: deviceList.length,
      activeDevices: deviceList.filter(d => d.status === 'active').length,
      totalReadings: deviceList.reduce((sum, d) => sum + (d.dataCount || 0), 0)
    });
  };

  const fetchDeviceData = async (deviceId) => {
    try {
      const response = await api.get(`/sensor/${deviceId}/latest`);
      if (response.data.success) {
        setSensorData(response.data.data || []);
        setSelectedDevice(deviceId);
      }
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  };

  const handleAddDevice = async (deviceData) => {
    try {
      const response = await api.post('/device/add-to-user', deviceData);
      if (response.data.success) {
        setShowAddModal(false);
        fetchUserDevices();
        alert('✅ Device added successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || '❌ Failed to add device');
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to remove this device?')) return;
    
    try {
      await api.patch(`/device/${deviceId}/remove-from-user`);
      fetchUserDevices();
      if (selectedDevice === deviceId) {
        setSelectedDevice(null);
        //setSensorData([]);
      }
      alert('✅ Device removed successfully!');
    } catch (error) {
      alert('❌ Failed to remove device');
      console.error('Error removing device:', error);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (selectedDevice) {
      fetchDeviceData(selectedDevice, range);
    }
  };

  const getSelectedDeviceInfo = () => {
    return devices.find(d => d.id === selectedDevice) || null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-16 mt-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-green-700">IoT Device Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, <span className="font-semibold text-blue-600">{currentUser?.username || currentUser?.email}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Device
          </button>
        </div>
      </div>
    {selectedDevice && (
      <DeviceLivePanel 
               className="mb-8"
                key={selectedDevice}
                deviceId={selectedDevice}
                
                />
    )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-10">
        {/* Left Column - Device Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Your IoT Devices</h2>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => fetchUserDevices()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {devices.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700">No devices yet</h3>
                <p className="text-gray-500 mt-2 mb-6">Add your first IoT device to start monitoring</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Add Your First Device
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    isSelected={selectedDevice === device.deviceId}
                    onSelect={() => fetchDeviceData(device.deviceId)}
                    onRemove={() => handleRemoveDevice(device.deviceId)}
                    onViewInfo={() => {
      
                      setSelectedDevice(device.deviceId);
                      setShowInfoModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
         
        {/* Right Column - Data Visualization */}
        
      </div>
      

       { /* Add Device Modal */} 
      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDevice}
      />

      {/* Device Info Modal */}
      {/* {selectedDevice && (
        <DeviceInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          device={getSelectedDeviceInfo()}
          onRemove={() => {
            handleRemoveDevice(selectedDevice);
            setShowInfoModal(false);
          }}
        />
      )}  */}
      
    </div>
  );
};

export default DevicesDashboard;