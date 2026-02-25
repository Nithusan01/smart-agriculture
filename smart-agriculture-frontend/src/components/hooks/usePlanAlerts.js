import { useMemo } from 'react';
import { useDateUtils } from "../hooks/useDateUtils";
import  useDeviceRealtime  from './useDeviceRealtime';
import { useDeviceAuth } from '../../contexts/DeviceAuthContext';


export const usePlanAlerts = (plans, planWeather) => {
  const { isDateWithinDays } = useDateUtils();
  const { devices} = useDeviceAuth();
        const device = devices.find(d => d.id === plans.deviceId);
        // const { latest } = useDeviceRealtime(selectedDevice);
        // Use array of device IDs for multiple device support
        const deviceIds = useMemo(() => {
          if (!device?.deviceId) return [];
          return [device.deviceId];
        }, [device?.deviceId]);
      
        // Use the hook with device IDs array
        const { data, connected, getDeviceData } = useDeviceRealtime(deviceIds);
      
        // Get data for this specific device
        const deviceData = device?.deviceId ? getDeviceData(device.deviceId) : { latest: null, history: [] };
        const latest = deviceData.latest;
  
  const alerts = useMemo(() => {
    const alertList = [];
    const upcomingActivity = [];
    
    plans.forEach(plan => {
      const weather = planWeather[plan.id];

      
      
      if (!weather) return; // Skip if no weather data

      const planDate = new Date(plan.plantingDate);
      const today = new Date();
      const diffTime = Math.abs(today - planDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if(latest?.temperature > 30){
        alertList.push({
          id: `${plan.id}-temp`,
          type: 'high-temp',
          message: `High temperature (${Math.round(latest.temperature)}°C) alert at section (${plan.sectorName}) - Ensure adequate irrigation`,
          plan: plan,
          severity: 'high'
        });
      }
      if(latest?.humidity < 30){
        alertList.push({
          id: `${plan.id}-humidity`,
          type: 'low-humidity',
          message: `Low humidity (${latest.humidity}%) alert at section (${plan.sectorName}) - Monitor soil moisture`,
          plan: plan,
          severity: 'medium'
        });
      }

      

      // Upcoming activity alert
      if (diffDays <= 3 && plan.status === 'planned') {
        upcomingActivity.push({
          id: `${plan.id}-upcoming`,  
          type: 'upcoming-activity',
          message: `Upcoming planting activity in section (${plan.sectorName}) on ${plan.plantingDate}`,
          plan: plan,
          date: plan.plantingDate
        });
      }

      // Harvest alert - fixed logic
      if (plan.status === 'planted' && plan.expectedHarvestDate) {
        const harvestDate = new Date(plan.expectedHarvestDate);
        const daysToHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysToHarvest <= 7 && daysToHarvest >= 0) {
          upcomingActivity.push({    
            id: `${plan.id}-harvest`,
            type: 'harvest',
            message: `Harvest time approaching in section (${plan.sectorName}). Expected harvest date: ${plan.expectedHarvestDate}`,
            plan: plan,
            date: plan.expectedHarvestDate
          });
        }
      }

      // High temp alert
      if (weather.main.temp > 20 && plan.status === 'planted') { // More realistic threshold
        alertList.push({
          id: `${plan.id}-temp`,
          type: 'high-temp',
          message: `High temperature (${Math.round(weather.main.temp)}°C) alert at section (${plan.sectorName}) - Ensure adequate irrigation`,
          plan: plan,
          severity: 'high'
        });
      }

      // Rain alert
      if (weather.weather[0].main === 'Rain' && plan.status === 'planted') {
        alertList.push({
          id: `${plan.id}-rain`,
          type: 'rain',
          message: `Rain expected at section (${plan.sectorName}) - Adjust irrigation schedule`,
          plan: plan,
          severity: 'medium'
        });
      }

      // Low humidity alert
      if (weather.main.humidity < 40 && plan.status === 'planted') {
        alertList.push({
          id: `${plan.id}-humidity`,
          type: 'low-humidity',
          message: `Low humidity (${weather.main.humidity}%) at section (${plan.sectorName}) - Monitor soil moisture`,
          plan: plan,
          severity: 'medium'
        });
      }
    });

    // Sort activities by date
    upcomingActivity.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Sort alerts by severity
    alertList.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });

    return { 
      alerts: alertList, 
      activities: upcomingActivity 
    };
  }, [plans, planWeather, isDateWithinDays]);

  return alerts;
};