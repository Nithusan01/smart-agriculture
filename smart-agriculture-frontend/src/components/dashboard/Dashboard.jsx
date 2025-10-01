import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons'; 

const Dashboard = () => {
  const { currentUser, fetchUser } = useAuth()
  const [stats, setStats] = useState({
    activeSensors: 0,
    systemHealth: 0,
    alerts: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const systemHealth = Math.floor(Math.random() * 40) + 60
      setStats({
        systemHealth,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-green-700 mb-4">
            Farm Dashboard
          </h2>
          <p className="text-lg text-green-600 font-medium">
            Welcome back to <span className="text-green-700 font-bold">{currentUser?.farmName || 'Your Farm'}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-12">
          {/* Total Area Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-l-4 border-green-500 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌾</span>
              </div>
              <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Total Area
              </h3>
              <p className="text-3xl font-bold text-green-700 mb-1">
                {currentUser?.farmTotalArea || 0}
              </p>
              <p className="text-gray-500 text-sm">hectares</p>
            </div>
          </div>

          {/* Active Sensors Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-l-4 border-green-500 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📡</span>
              </div>
              <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Active Sensors
              </h3>
              <p className="text-3xl font-bold text-green-700 mb-1">
                {stats?.activeSensors || 40}
              </p>
              <p className="text-gray-500 text-sm">devices online</p>
            </div>
          </div>

          {/* System Health Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-l-4 border-green-500 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl"><FontAwesomeIcon
                  icon={faHeart}
                  className="text-2xl text-red-500 animate-pulse"
                /></span>
              </div>
              <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-2">
                System Health
              </h3>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <p className="text-3xl font-bold text-green-700">
                  {stats?.systemHealth || 0}%
                </p>
                <div className={`w-3 h-3 rounded-full ${stats?.systemHealth > 80 ? 'bg-green-500' : stats?.systemHealth > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              </div>
              <p className="text-gray-500 text-sm">operational status</p>
            </div>
          </div>

          {/* Active Alerts Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-l-4 border-green-500 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Active Alerts
              </h3>
              <p className="text-3xl font-bold text-green-700 mb-1">
                {stats?.alerts || 6}
              </p>
              <p className="text-gray-500 text-sm">requires attention</p>
            </div>
          </div>
        </div>

        {/* Additional Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium">
                View Sensors
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium">
                Check Alerts
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium">
                Generate Report
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium">
                System Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Sensor #12 updated soil moisture levels</p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Temperature alert triggered in North field</p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Irrigation system scheduled for 06:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard