// src/hooks/useDeviceRealtime.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../../services/api';

const SOCKET_URL = 'http://localhost:5000';

export default function useDeviceRealtime(deviceId, { pollingFallback = true } = {}) {
  const socketRef = useRef(null);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceId) {
      console.log('No deviceId provided');
      return;
    }
    
    console.log(`Connecting to WebSocket for device ${deviceId}...`);
    
    // Clean up any existing socket
    if (socketRef.current) {
      console.log('Cleaning up previous socket connection');
      socketRef.current.disconnect();
    }
    
    // Create new socket connection
    socketRef.current = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    // Event listeners
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      setConnected(true);
      setError(null);
      
      // Subscribe to device
      if (deviceId) {
        console.log(`Subscribing to device: ${deviceId}`);
        socketRef.current.emit('subscribeDevice', deviceId);
      }
    });
    
    socketRef.current.on('subscriptionConfirmed', (data) => {
      console.log('📢 Subscription confirmed:', data);
    });
    
    socketRef.current.on('sensorUpdate', (payload) => {
      console.log('📡 Received sensor update:', payload);
      setLatest(payload);
      setHistory(prev => {
        // Prevent duplicates based on timestamp or id
        const exists = prev.some(item => 
          item.id === payload.id || 
          item.timestamp === payload.timestamp
        );
        if (exists) return prev;
        return [payload, ...prev].slice(0, 500);
      });
    });
    
    socketRef.current.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err.message);
      setError(err.message);
      setConnected(false);
    });
    
    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setConnected(false);
    });
    
    socketRef.current.on('error', (err) => {
      console.error('⚠️ WebSocket error:', err);
      setError(err.message);
    });
    
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial sensor data...');
        const [latestRes, historyRes] = await Promise.all([
          api.get(`sensor/${deviceId}/latest`),
          api.get(`sensor/${deviceId}/history?limit=100`)
        ]);
        
        if (latestRes.data?.data) {
          setLatest(latestRes.data.data);
        }
        
        if (historyRes.data?.data) {
          setHistory(historyRes.data.data);
        }
      } catch (err) {
        console.warn('Initial fetch failed:', err.message);
      }
    };
    
    fetchInitialData();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (socketRef.current) {
        socketRef.current.emit('unsubscribeDevice', deviceId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [deviceId]);

  // Polling fallback
  useEffect(() => {
    if (!pollingFallback || !deviceId || connected) return;
    
    console.log('Starting polling fallback...');
    
    const poll = async () => {
      try {
        const response = await api.get(`sensor/${deviceId}/latest`);
        if (response.data?.data) {
          setLatest(response.data.data);
        }
      } catch (err) {
        console.log('Polling error:', err.message);
      }
    };
    
    // Poll immediately
    poll();
    
    // Then every 10 seconds
    const interval = setInterval(poll, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [deviceId, pollingFallback, connected]);

  return { latest, history, connected, error };
}