import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CultivationPlanProvider } from './contexts/CultivationPlanContext'
import PrivateRoute from './components/auth/PrivateRoute'
import Header from './components/layout/Header'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './components/dashboard/Dashboard'
import { WeatherProvider } from './contexts/WeatherContext';


import './index.css'
import Footer from './components/layout/Footer'
import AgriSmartSection from './components/agriSmartSection/AgriSmartSection'
import Planning from './components/planning/planning'

function App() {
  return (
    <AuthProvider>
      <WeatherProvider>
      <CultivationPlanProvider>
      <Router>
        <div className="App">
          <Header />  
          <main className="main-content">
            <Routes>
              <Route path="/" element={<AgriSmartSection />} />
              {/* <Route path="/dashboard"  element={<Navigate to="/dashboard" replace />} />  */}
              <Route path="/login" element={<Login /> } />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/planning" 
                element={
                  <PrivateRoute>
                    <Planning />
                  </PrivateRoute>
                } 
              />

            </Routes>
          </main>
          <Footer/>
        </div>
      </Router>
        </CultivationPlanProvider>
        </WeatherProvider>
    </AuthProvider>
  )
}

export default App