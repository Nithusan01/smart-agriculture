import React from 'react';
import { useNavigate } from 'react-router-dom'


const AgriSmartSection = () => {
  const features = [
    {
      icon: 'fas fa-temperature-high',
      title: 'Real-time Monitoring',
      description: 'Track soil moisture, temperature, humidity, and light levels in real-time with wireless sensors.'
    },
    {
      icon: 'fas fa-tint',
      title: 'Automated Irrigation',
      description: 'Smart irrigation systems that activate based on soil moisture data and weather forecasts.'
    },
    {
      icon: 'fas fa-cloud-sun-rain',
      title: 'Microclimate Analysis',
      description: 'Monitor microclimates across your farm to optimize planting and resource allocation.'
    },
    {
      icon: 'fas fa-robot',
      title: 'Predictive Analytics',
      description: 'AI algorithms analyze sensor data to predict crop health issues and yield estimates.'
    }
  ];

  return (

    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative py-16">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-700/80 to-green-500/80"></div>
        </div>
        
        {/* Hero content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">IoT-Powered Smart Agriculture</h1>
            <p className="text-xl mb-8">Monitor your farm in real-time with sensor technology and AI-powered analytics</p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
              View Live Data
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-12">IoT-Enhanced Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 transition-transform"
              >
                <div className="text-green-600 text-4xl mb-6">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>

  );
};

export default AgriSmartSection;