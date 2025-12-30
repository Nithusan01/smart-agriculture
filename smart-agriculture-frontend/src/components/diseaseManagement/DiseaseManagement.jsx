import React from 'react';
import ChatBot from './ChatBot';

const DiseaseManagement = () => {
  return (
    <div className=" min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-2">
          🌾 Agriculture Disease Management
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AI-powered assistant for plant disease identification and treatment
        </p>
        
        <div className="flex justify-center">
          <ChatBot />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold">Disease Identification</h3>
            <p className="text-sm text-gray-600">Identify diseases from symptoms</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">💊</div>
            <h3 className="font-semibold">Treatment Guidance</h3>
            <p className="text-sm text-gray-600">Organic and chemical solutions</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-semibold">Prevention Tips</h3>
            <p className="text-sm text-gray-600">Keep your crops healthy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiseaseManagement;