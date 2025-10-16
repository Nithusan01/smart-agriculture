import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Swal from 'sweetalert2'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});



// Component for picking location on map
const LocationPicker = ({ location, setLocation }) => {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
      },
    })
    return null
  }

  return (
    <MapContainer
      center={location.lat && location.lng ? [location.lat, location.lng] : [7.8731, 80.7718]} // default Sri Lanka
      zoom={7}
      style={{ height: '300px', width: '100%', marginBottom: '1rem' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {location.lat && location.lng && <Marker position={[location.lat, location.lng]} />}
      <MapEvents />
    </MapContainer>
  )
}

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    farmName: '',
    farmTotalArea: '',
  })
  const [location, setLocation] = useState({ lat: null, lng: null }) // default Sri Lanka
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, logout } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }


    setIsLoading(true)
    setError('')

    const { confirmPassword, ...userData } = formData
    

    const result = await register(formData)

    if (result.success) {
      //alert('Registration successful! Please log in.')
      navigate('/dashboard')
      Swal.fire({
        title: 'Success!',
        text: 'Registration successful!.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#648bdfff',
        background: '#f8f9fa'
      });
      navigate('/login')
    } else {
      setError(result.error || 'Registration failed')
    }

    setIsLoading(false)
  }

  return (
    <div className=" bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 min-h-screen flex items-center justify-center mt-0 pt-12">
      <div className=" bg-white rounded  items-center justify-center py-6  px-10 mt-14 mb-10 shadow-md w-full max-w-lg z-10">
        <h2 className='py-5 text-center text-green-700'>Create Your Farm Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
  {/* Header */}
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-2">Join AgriSmart</h2>
    <p className="text-gray-600">Create your smart farming account</p>
  </div>

  {/* Name Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>👤</span>
        First Name
      </label>
      <input
        type="text"
        id="firstName"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        required
        placeholder="John"
        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>👥</span>
        Last Name
      </label>
      <input
        type="text"
        id="lastName"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        required
        placeholder="Doe"
        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>
  </div>

  {/* Username & Email */}
  <div className="space-y-6">
    <div className="space-y-2">
      <label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>🔐</span>
        Username
      </label>
      <input
        type="text"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
        placeholder="john_doe_farm"
        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>📧</span>
        Email Address
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="john@greenvalleyfarm.com"
        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>
  </div>

  {/* Password Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>🔒</span>
        Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        placeholder="Create strong password"
        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>✅</span>
        Confirm Password
      </label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        placeholder="Repeat your password"
        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
      />
    </div>
  </div>

  {/* Farm Name */}
  <div className="space-y-2">
    <label htmlFor="farmName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <span>🌾</span>
      Farm Name
    </label>
    <input
      type="text"
      id="farmName"
      name="farmName"
      value={formData.farmName}
      onChange={handleChange}
      required
      placeholder="Green Valley Organic Farm"
      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
    />
  </div>

  {/* Submit Button */}
  <button 
    type="submit" 
    disabled={isLoading}
    className="w-full group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  >
    {isLoading ? (
      <div className="flex items-center justify-center space-x-3">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg">Setting up your farm...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center space-x-3">
        <span className="text-lg">Start Smart Farming</span>
        <span className="group-hover:translate-x-1 transition-transform">🚜</span>
      </div>
    )}
  </button>
</form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
