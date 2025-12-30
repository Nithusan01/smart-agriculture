import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-green-600 text-white py-12 pt-[3rem] pb-[2rem] w-full  bottom-0 left-0">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="footer-section">
                    <h3 className="text-xl font-bold mb-6">AgriSmart IoT</h3>
                    <p className="text-white mb-4">
                        Smart agriculture solutions with IoT technology for modern farmers. 
                        Increase yield, reduce losses, and optimize your farming operations.
                    </p>
                    <div className="flex space-x-4 mt-4">
                        <a href="#" className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white text-lg transition-colors hover:bg-opacity-20">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white text-lg transition-colors hover:bg-opacity-20">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#" className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white text-lg transition-colors hover:bg-opacity-20">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#" className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-10 rounded-full text-white text-lg transition-colors hover:bg-opacity-20">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>
                
                
                <div className="footer-section">
                    <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                    <ul className="space-y-3">
                        <li><Link to="/dashboard" className="text-gray-300 hover:text-white hover:underline">Dashboard</Link></li>
                        <li><a href="#iot-monitor" className="text-gray-300 hover:text-white hover:underline">IoT Monitoring</a></li>
                        <li><a href="#planning" className="text-gray-300 hover:text-white hover:underline">Cultivation Planning</a></li>
                        <li><a href="#disease" className="text-gray-300 hover:text-white hover:underline">Disease Management</a></li>
                    </ul>
                </div>
                
    
                <div className="footer-section">
                    <h3 className="text-xl font-bold mb-6">Contact Us</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <i className="fas fa-map-marker-alt mt-1 mr-3 text-white"></i>
                            <span className="text-white">123 Farm Road, Agricultural Zone</span>
                        </li>
                        <li className="flex items-start">
                            <i className="fas fa-phone mt-1 mr-3 text-white"></i>
                            <span className="text-white">+1 (555) 123-4567</span>
                        </li>
                        <li className="flex items-start">
                            <i className="fas fa-envelope mt-1 mr-3 text-white"></i>
                            <span className="text-white">info@agrismart-iot.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            
        
            <div className="text-center mt-12 pt-6 border-t border-white border-opacity-10">
                <p className="text-white">&copy; 2025 AgriSmart IoT. All rights reserved.</p>
            </div>
        </div>
    </footer>
  )
}

export default Footer