import React, { createContext, useContext, useState, useEffect } from 'react'
import {api} from '../services/api'
import { useAuth } from './AuthContext';

const DeviceAuthContext = createContext()

export const useDeviceAuth = () => {
    return useContext(DeviceAuthContext)
}

export const DeviceAuthProvider = ({ children }) => {
    const [currentDevice, setCurrentDevice] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const { currentUser } = useAuth();
    const [devices, setDevices] = useState([]);
     const [stats, setStats] = useState({
        totalDevices: 0,
        activeDevices: 0,
        totalReadings: 0
      });
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState(null);
      
    

    //const [usersLoading, setUsersLoading] = useState(false)


    useEffect(() => {
        // Fetch devices only if currentUser is logged in and devices list is empty
        if (!currentUser || devices.length === 0){
            setIsLoading(false);
            setCurrentDevice(null);
            return;
        }
        fetchAllDevices();
       // fetchDevice();
    }, [devices.length,currentUser]);

    const fetchDevice = async () => {
        try {
            const response = await api.get('/device/me')
            setCurrentDevice(response.data.user)
        } catch (error) {
           
        } finally {
            setIsLoading(false)
        }
    }


    const login = async (credentials) => {
        try {
            const response = await api.post('/device/login', credentials)
            const { token, device } = response.data


            return { success: true, data: device }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'device Login failed server error'
            }
        }
    }

    const register = async (userData) => {
        try {
            const response = await api.post('/device/register', userData)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            }
        }
    }

    //   const logout = () => {
    //     localStorage.removeItem('token')
    //     delete api.defaults.headers.common['Authorization']
    //     setCurrentUser(null)



    //   }

    const fetchAllDevices = async () => {
        // Check if user is admin
        if (currentUser?.role !== 'admin') {
            return {
                success: false,
                error: 'Unauthorized: Admin access required'
            }
        }

        try {
            const response = await api.get('/device/')
            setDevices(response.data.data)
            return {
                success: true,
                message: 'device fetched successfully'
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch devices'
            console.error('Error fetching devices:', error)
            return {
                success: false,
                error: errorMessage
            }
        }
    }

    const deleteDevice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this disease?')) {
                return;
            }

        try {
        if (!id) {
            throw new Error('user ID is required');
        }

        const response = await api.delete(`device/${id}`);

        // Optional: Add logging for debugging
        console.log(`user ${id} deleted successfully`);

        return response;
    } catch (error) {
        console.error('Failed to delete device:', error);
        throw error;

    }
    }
     // Update device status
    const updateDeviceStatus = async (id, status) => {
        try {
            const response = await api.patch(`/device/${id}/status`, { status})
            
            // Update local state immediately for better UX
            setDevices(prevDevices => 
                prevDevices.map(device => 
                    device.id === id 
                        ? { ...device, status: status }
                        : device
                )
            )
            
            return { 
                success: true, 
                data: response.data,
                message: `Device ${status === 'active' ? 'activated' : 'deactivated'} successfully`
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update device status'
            console.error('Error updating device status:', error)
            return {
                success: false,
                error: errorMessage
            }
        }
    }

    // Update device information
    const updateDevice = async (id, updateData) => {
        try {
            const response = await api.put(`/device/${id}`, updateData)
            
            // Update local state
            setDevices(prevDevices => 
                prevDevices.map(device => 
                    device.id === id 
                        ? { ...device, ...updateData }
                        : device
                )
            )
            
            return { 
                success: true, 
                data: response.data,
                message: 'Device updated successfully'
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update device'
            console.error('Error updating device:', error)
            return {
                success: false,
                error: errorMessage
            }
        }
    }

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
            {response.data.devices.status === 'active' ? setSelectedDevice(response.data.devices[0]?.deviceId) : setSelectedDevice(null)}
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


    

    const value = {
        currentDevice,
        isLoading,
        login,
        register,
        devices,
        fetchAllDevices,
        deleteDevice,
        updateDevice,
        updateDeviceStatus,
        loading,
        stats,
        fetchUserDevices,
        selectedDevice,
        setSelectedDevice


    }

    return (
        <DeviceAuthContext.Provider value={value}>
            {children}
        </DeviceAuthContext.Provider>
    )
}