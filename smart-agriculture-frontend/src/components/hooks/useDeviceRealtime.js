// src/hooks/useDeviceRealtime.js
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { api } from '../../services/api';

const SOCKET_URL = 'http://localhost:5000';

// Create a singleton socket instance
let globalSocket = null;
const deviceSubscribers = new Map(); // Tracks which components are subscribing to which devices

export default function useDeviceRealtime(deviceIds, { pollingFallback = true } = {}) {
  // Support both single deviceId and array of deviceIds
  const normalizedDeviceIds = useMemo(() => {
    if (!deviceIds) return [];
    return Array.isArray(deviceIds) ? deviceIds : [deviceIds];
  }, [deviceIds]);

  const socketRef = useRef(null);
  const [data, setData] = useState({}); // { deviceId: { latest, history } }
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  
  const prevDeviceIdsRef = useRef([]);

  // Initialize global socket connection
  useEffect(() => {
    if (normalizedDeviceIds.length === 0) {
      console.log('No deviceIds provided');
      setData({});
      setConnected(false);
      setError(null);
      setSubscriptions([]);
      return;
    }

    // Create or reuse global socket
    if (!globalSocket) {
      console.log('Creating global WebSocket connection...');
      globalSocket = io(SOCKET_URL, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
        multiplex: true // Allow multiple subscriptions
      });

      // Global event listeners
      globalSocket.on('connect', () => {
        console.log('✅ Global WebSocket connected successfully');
        setConnected(true);
        setError(null);
        
        // Resubscribe to all devices for this hook
        if (normalizedDeviceIds.length > 0) {
          normalizedDeviceIds.forEach(deviceId => {
            if (!deviceSubscribers.get(deviceId)?.has(socketRef)) {
              console.log(`Subscribing to device: ${deviceId}`);
              globalSocket.emit('subscribeDevice', deviceId);
            }
          });
        }
      });

      globalSocket.on('subscriptionConfirmed', (data) => {
        console.log('📢 Subscription confirmed:', data);
        setSubscriptions(prev => [...prev, data.deviceId]);
      });

      globalSocket.on('sensorUpdate', (payload) => {
        console.log('📡 Received sensor update for:', payload.deviceId, payload);
        
        setData(prev => {
          const deviceId = payload.deviceId || payload.id;
          if (!deviceId) return prev;
          
          const deviceData = prev[deviceId] || { latest: null, history: [] };
          
          // Update latest data
          const updatedDeviceData = {
            ...deviceData,
            latest: payload,
            history: [
              payload,
              ...deviceData.history.filter(item => 
                !(item.id === payload.id || item.timestamp === payload.timestamp)
              )
            ].slice(0, 500) // Keep last 500 entries
          };
          
          return {
            ...prev,
            [deviceId]: updatedDeviceData
          };
        });
      });

      globalSocket.on('connect_error', (err) => {
        console.error('❌ WebSocket connection error:', err.message);
        setError(err.message);
        setConnected(false);
      });

      globalSocket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        setConnected(false);
      });

      globalSocket.on('error', (err) => {
        console.error('⚠️ WebSocket error:', err);
        setError(err.message);
      });

      globalSocket.on('unsubscriptionConfirmed', (data) => {
        console.log('📢 Unsubscription confirmed:', data);
        setSubscriptions(prev => prev.filter(id => id !== data.deviceId));
      });
    }

    socketRef.current = globalSocket;

    // Track this hook's subscriptions
    normalizedDeviceIds.forEach(deviceId => {
      if (!deviceSubscribers.has(deviceId)) {
        deviceSubscribers.set(deviceId, new Set());
      }
      deviceSubscribers.get(deviceId).add(socketRef);
    });

    // Cleanup tracking for removed devices
    const currentSubscribers = deviceSubscribers;
    return () => {
      normalizedDeviceIds.forEach(deviceId => {
        const subscribers = currentSubscribers.get(deviceId);
        if (subscribers) {
          subscribers.delete(socketRef);
          if (subscribers.size === 0) {
            currentSubscribers.delete(deviceId);
            // Unsubscribe from server if no more subscribers
            if (globalSocket?.connected) {
              globalSocket.emit('unsubscribeDevice', deviceId);
            }
          }
        }
      });
    };
  }, [normalizedDeviceIds]);

  // Handle device ID changes and manage subscriptions
  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected || normalizedDeviceIds.length === 0) {
      return;
    }

    const prevIds = prevDeviceIdsRef.current;
    const currentIds = normalizedDeviceIds;
    
    // Find new devices to subscribe to
    const devicesToSubscribe = currentIds.filter(id => !prevIds.includes(id));
    // Find devices to unsubscribe from
    const devicesToUnsubscribe = prevIds.filter(id => !currentIds.includes(id));
    
    // Subscribe to new devices
    devicesToSubscribe.forEach(deviceId => {
      console.log(`Subscribing to new device: ${deviceId}`);
      socketRef.current.emit('subscribeDevice', deviceId);
    });
    
    // Unsubscribe from removed devices (only if no other subscribers)
    devicesToUnsubscribe.forEach(deviceId => {
      const subscribers = deviceSubscribers.get(deviceId);
      if (!subscribers || subscribers.size === 0) {
        console.log(`Unsubscribing from device: ${deviceId}`);
        socketRef.current.emit('unsubscribeDevice', deviceId);
      } else {
        console.log(`Keeping subscription to ${deviceId} - other subscribers exist`);
      }
    });
    
    prevDeviceIdsRef.current = currentIds;
  }, [normalizedDeviceIds]);

  // Fetch initial data for all devices
  useEffect(() => {
    if (normalizedDeviceIds.length === 0) return;

    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial sensor data for devices:', normalizedDeviceIds);
        
        const fetchPromises = normalizedDeviceIds.map(async (deviceId) => {
          try {
            const [latestRes, historyRes] = await Promise.all([
              api.get(`sensor/${deviceId}/latest`),
              api.get(`sensor/${deviceId}/history?limit=100`)
            ]);
            
            return {
              deviceId,
              latest: latestRes.data?.data || null,
              history: historyRes.data?.data || []
            };
          } catch (err) {
            console.warn(`Failed to fetch initial data for device ${deviceId}:`, err.message);
            return {
              deviceId,
              latest: null,
              history: []
            };
          }
        });

        const results = await Promise.all(fetchPromises);
        
        setData(prev => {
          const newData = { ...prev };
          results.forEach(result => {
            newData[result.deviceId] = {
              latest: result.latest,
              history: result.history
            };
          });
          return newData;
        });
      } catch (err) {
        console.warn('Initial fetch failed:', err.message);
      }
    };

    fetchInitialData();
  }, [normalizedDeviceIds]);

  // Polling fallback for disconnected state
  useEffect(() => {
    if (!pollingFallback || normalizedDeviceIds.length === 0 || connected) return;
    
    console.log('Starting polling fallback for devices:', normalizedDeviceIds);
    
    let isMounted = true;
    
    const pollDevice = async (deviceId) => {
      if (!isMounted || !deviceId) return;
      
      try {
        const response = await api.get(`sensor/${deviceId}/latest`);
        if (response.data?.data && isMounted) {
          setData(prev => ({
            ...prev,
            [deviceId]: {
              ...prev[deviceId],
              latest: response.data.data
            }
          }));
        }
      } catch (err) {
        console.log(`Polling error for ${deviceId}:`, err.message);
      }
    };
    
    const pollAll = () => {
      normalizedDeviceIds.forEach(deviceId => pollDevice(deviceId));
    };
    
    // Poll immediately
    pollAll();
    
    // Then every 10 seconds
    const interval = setInterval(pollAll, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [normalizedDeviceIds, pollingFallback, connected]);

  // Helper function to get data for a specific device
  const getDeviceData = useCallback((deviceId) => {
    return data[deviceId] || { latest: null, history: [] };
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup is handled in the main effect
    };
  }, []);

  // Return data based on input type
  if (Array.isArray(deviceIds)) {
    // For array input, return data for all devices
    return {
      data, // { deviceId: { latest, history } }
      connected,
      error,
      subscriptions,
      getDeviceData
    };
  } else {
    // For single deviceId input, return data for that specific device (backward compatible)
    const deviceId = deviceIds;
    const deviceData = data[deviceId] || { latest: null, history: [] };
    return {
      latest: deviceData.latest,
      history: deviceData.history,
      connected,
      error,
      subscriptions: subscriptions.includes(deviceId) ? [deviceId] : []
    };
  }
}

// Export a helper function to manually subscribe/unsubscribe
export const deviceSocket = {
  subscribe: (deviceId) => {
    if (globalSocket?.connected) {
      globalSocket.emit('subscribeDevice', deviceId);
    }
  },
  unsubscribe: (deviceId) => {
    if (globalSocket?.connected) {
      globalSocket.emit('unsubscribeDevice', deviceId);
    }
  },
  getConnection: () => globalSocket,
  isConnected: () => globalSocket?.connected || false
};