import React from 'react';

const DeviceInfoModal = ({ isOpen, onClose, device, onRemove }) => {
  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">{device.name || 'Device Info'}</h2>

        <div className="space-y-2">
          <p><span className="font-semibold">Device ID:</span> {device.deviceId}</p>
          {device.deviceName && <p><span className="font-semibold">Device Name:</span> {device.deviceName}</p>}
          {device.secretKey && <p><span className="font-semibold">key:</span> {device.secretKey}</p>}
          {device.status && <p><span className="font-semibold">Status:</span> {device.status}</p>}
          {device.createdAt && <p><span className="font-semibold">Last Active:</span> {device.createdAt}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={onRemove}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Remove Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceInfoModal;
