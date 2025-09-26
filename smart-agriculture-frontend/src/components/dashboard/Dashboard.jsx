import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'


const Dashboard = () => {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    activeSensors: 0,
    systemHealth: 0,
    alerts: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // // Fetch sensor data
      // const sensorsResponse = await api.get('/sensors')
      // const activeSensors = sensorsResponse.data.filter(sensor => sensor.isActive).length

      // // Fetch alerts
      // const alertsResponse = await api.get('/alerts?resolved=false')
      // const activeAlerts = alertsResponse.data.length

      // Calculate system health (mock calculation)
      const systemHealth = Math.floor(Math.random() * 40) + 60 // Random between 60-100

      // setStats({
      //   activeSensors,
      //   systemHealth,
      //   alerts: activeAlerts
      // })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div><LoadingSpinner/></div>
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-12">Farm Dashboard</h2>
          <p>Welcome back to {currentUser?.farmName || null}</p>
        </div>

        <div className=" bg-white p-6 pt-10 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-100 p-11 rounded-lg z-10 text-green-700 font-bold text-xl text-center">
            <h3 className='pb-8'>Total Area</h3>
            <p>{currentUser?.farmTotalArea || 0 } ha</p>
          </div>
          <div className="bg-gray-100 p-11 rounded-lg z-10 text-green-700 font-bold text-xl text-center ">
            <h3 className='pb-8'> Active Sensors</h3>
            <p> {stats?.activeSensors || null}</p>
          </div>
          <div className="bg-gray-100 p-11 rounded-lg z-10 text-green-700 font-bold text-xl text-center">
            <h3 className='pb-8'>System Health</h3>
            <p>{stats?.systemHealth || null}%</p>
          </div>
          <div className="bg-gray-100 p-11 rounded-lg z-10 text-green-700 font-bold text-xl text-center">
            <h3 className='pb-8'>Active Alerts</h3>
            <p>{stats?.alerts || null}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard