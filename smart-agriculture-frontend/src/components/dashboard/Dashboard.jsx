import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'


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
      // Fetch sensor data
      const sensorsResponse = await api.get('/sensors')
      const activeSensors = sensorsResponse.data.filter(sensor => sensor.isActive).length
      
      // Fetch alerts
      const alertsResponse = await api.get('/alerts?resolved=false')
      const activeAlerts = alertsResponse.data.length
      
      // Calculate system health (mock calculation)
      const systemHealth = Math.floor(Math.random() * 40) + 60 // Random between 60-100
      
      setStats({
        activeSensors,
        systemHealth,
        alerts: activeAlerts
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Farm Dashboard</h1>
          <p>Welcome back to {currentUser?.farmName}</p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Area</h3>
            <p>{currentUser?.farmTotalArea || 0} ha</p>
          </div>
          <div className="stat-card">
            <h3>Active Sensors</h3>
            <p>{stats.activeSensors}</p>
          </div>
          <div className="stat-card">
            <h3>System Health</h3>
            <p>{stats.systemHealth}%</p>
          </div>
          <div className="stat-card">
            <h3>Active Alerts</h3>
            <p>{stats.alerts}</p>
          </div>
        </div>        
      </div>
    </div>
  )
}

export default Dashboard