import React from 'react';
import { useDeviceAuth } from '../../contexts/DeviceAuthContext';
import useDeviceRealtime from '../hooks/useDeviceRealtime';
import { useCultivationPlan } from '../../contexts/CultivationPlanContext';

const DeviceCard = ({ device, isSelected, onSelect, onViewInfo, onRemove }) => {
  const { selectedDevice } = useDeviceAuth();
  const { latest } = useDeviceRealtime(selectedDevice);
  const {plans}=useCultivationPlan();
  const plan = plans.find(p => p.id === device.planId);
  
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const last = new Date(lastSeen);
    const diffMs = now - last;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const isOnline = (device.deviceId === selectedDevice) && (latest);

  return (
    <div 
      className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg overflow-hidden ${
        isSelected 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-md' 
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      )}
      
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
              isSelected 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : isOnline
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-gray-500 to-gray-600'
            }`}>
              <span className={`text-xl ${isSelected || isOnline ? 'text-white' : 'text-gray-100'}`}>
                {isOnline ? '📶' : '📱'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{device.deviceName || device.deviceId}</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">{device.deviceId}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(device.status)}`}>
            {device.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        
        {/* Status Indicators */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className={isOnline ? 'text-green-600 font-medium' : 'text-gray-600'}>
                {isOnline ? 'Online • Live Data' : 'Offline'}
              </span>
            </div>
           
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <i className="fas fa-clock text-gray-500 text-xs"></i>
            </div>
            <div>
              <div className="text-xs text-gray-500">Last seen</div>
              <div className="font-medium text-gray-800">{getLastSeenText(device.lastSeen)}</div>
            </div>
          </div>
           <div className='lex items-center gap-2 text-sm text-gray-600'> 
            <div>
              <span className="font-medium">Plan:  </span>
              {plan?.cropName || 'Unnamed Plan'} 
              {plan?.sectorName && ` - Sector ${plan.sectorName}`}
              </div>
            
            </div>
          
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
              isSelected 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-eye"></i>
                Viewing
              </span>
            ) : 'View Data'}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewInfo();
            }}
            className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-info-circle"></i>
            Info
          </button>
          
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;