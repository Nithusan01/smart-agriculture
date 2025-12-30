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
      
    } else {
      setError(result.error || 'Registration failed')
    }

    setIsLoading(false)
  }

  return (
    <div className="relative bg-[url('/agri.jpg')] bg-cover bg-center min-h-screen flex items-center justify-center pt-12">
  {/* Gradient + Blur Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-green-600/50 to-green-600/50 "></div>

  {/* Form Container */}
  <div className="relative z-10 rounded-3xl bg-white/30 backdrop-blur-lg shadow-2xl py-3 px-10 w-full max-w-lg">
    <h2 className="py-3 pb-4 text-center font-bold text-white text-2xl">
      Create Your Farm Account
    </h2>
    {error && <div className="bg-red-700/50 border-red-200 text-white py-1 pl-2 mb-3">{error}</div>}

    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Name Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="gray"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0"
            />
          </svg>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="First Name"
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>

        {/* Last Name */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="gray"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0"
            />
          </svg>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="Last Name"
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Username */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="gray"
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232a4 4 0 1 1 5.536 5.536M4.5 19.5l7.5-7.5 3 3 7.5-7.5"
          />
        </svg>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Username"
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="gray"
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25ZM3 6.75l9 6.75 9-6.75"
          />
        </svg>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Email Address"
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      {/* Password Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="gray"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V7.5a4.5 4.5 0 0 0-9 0v3m-3 0h15v10.5H4.5V10.5Z"
            />
          </svg>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create Password"
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="gray"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V7.5a4.5 4.5 0 0 0-9 0v3m-3 0h15v10.5H4.5V10.5Z"
            />
          </svg>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm Password"
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Farm Name */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="gray"
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-9 9 9M4 10v10h16V10" />
        </svg>
        <input
          type="text"
          id="farmName"
          name="farmName"
          value={formData.farmName}
          onChange={handleChange}
          required
          placeholder="Farm Name"
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full group bg-yellow-600 text-white font-bold py-4 px-3 rounded-2xl transition-all duration-300 shadow-lg hover:bg-yellow-600/80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Setting up your farm...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">Start Smart Farming</span>
            <span className="group-hover:translate-x-1 transition-transform">🚜</span>
          </div>
        )}
      </button>
    </form>

    <p className="flex items-center justify-center px-4 py-4 ">
      Already have an account?{"  "}
      <Link to="/login" className="text-blue-600 hover:text-blue-400">
        Sign in
      </Link>
    </p>
  </div>
</div>

  )
}

export default Register
