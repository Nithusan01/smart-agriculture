import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'; // Add this import
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faInfoCircle, faIdCard, faKey, faSignal, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const DeviceInfoModal = ({ isOpen, onClose, device, onRemove }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !device || !mounted) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Create portal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faInfoCircle} className="text-xl" />
              </div>
              <h2 className="text-2xl font-bold">Device Details</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <h3 className="text-lg font-semibold truncate">{device.deviceName || 'Unnamed Device'}</h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <FontAwesomeIcon icon={faIdCard} className="text-sm" />
                <span className="text-xs font-semibold">Device ID</span>
              </div>
              <p className="font-mono text-sm text-gray-800 break-all">{device.deviceId}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <FontAwesomeIcon icon={faKey} className="text-sm" />
                <span className="text-xs font-semibold">Secret Key</span>
              </div>
              <p className="font-mono text-sm text-gray-800 break-all">{device.secretKey || 'Not available'}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faSignal} className="text-blue-500" />
              <span className="font-semibold text-gray-800">Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                device.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : device.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {device.status?.toUpperCase() || 'UNKNOWN'}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                <span>Created: {formatDate(device.createdAt)}</span>
              </div>
            </div>
          </div>

          {device.lastSeen && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Last Active</div>
              <div className="text-gray-800 font-medium">{formatDate(device.lastSeen)}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
          >
            Close
          </button>
          
          {onRemove && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove this device?')) {
                  onRemove();
                }
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTrash} />
              Remove Device
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render outside current DOM hierarchy
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root') || document.body
  );
};

export default DeviceInfoModal;