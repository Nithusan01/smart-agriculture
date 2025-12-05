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
import AdminPage from './components/admin/AdminPage'
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute'
import { CropProvider } from './contexts/CropContext'
import { DiseaseProvider } from './contexts/DiseaseContext'


import './index.css'
import Footer from './components/layout/Footer'
import AgriSmartSection from './components/agriSmartSection/AgriSmartSection'
import Planning from './components/planning/planning'
import DiseaseManagement from './components/diseaseManagement/DiseaseManagement'
import { DeviceAuthProvider } from './contexts/DeviceAuthContext'
import DevicesDashboard from './components/device/DevicesDashboard'

function App() {
  return (

    <AuthProvider>

      <CropProvider>
        <DiseaseProvider>
          <WeatherProvider>
            <CultivationPlanProvider>
              <DeviceAuthProvider>
                <Router>
                  <div className="App">
                    <Header />
                    <main className="main-content">
                      <Routes>

                        {/* <Route path="/dashboard"  element={<Navigate to="/dashboard" replace />} />  */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<AgriSmartSection />} />

                        <Route
                          path="/dashboard"
                          element={
                            <PrivateRoute>
                              <Dashboard />
                            </PrivateRoute>
                          }
                        />


                        <Route
                          path="/admin"
                          element={
                            <ProtectedAdminRoute>
                              <AdminPage />
                            </ProtectedAdminRoute>
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
                        <Route
                          path="/chatbot"
                          element={
                            <PrivateRoute>
                              <DiseaseManagement />
                            </PrivateRoute>
                          }
                        />

                        <Route
                          path="/device-management"
                          element={
                            <PrivateRoute>
                              <DevicesDashboard />
                            </PrivateRoute>
                          }
                        />

                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </Router>
              </DeviceAuthProvider>
            </CultivationPlanProvider>
          </WeatherProvider>
        </DiseaseProvider>
      </CropProvider>

    </AuthProvider>

  )
}

export default App