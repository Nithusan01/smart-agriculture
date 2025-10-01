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
    phoneNumber: '',
    farmName: '',
    farmTotalArea: '',
    farmSoilType: ''
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

    if (!location.lat || !location.lng) {
      setError('Please select your farm location on the map')
      return
    }

    setIsLoading(true)
    setError('')

    const { confirmPassword, ...userData } = formData
    const dataToSend = {
      ...userData,
      farmLat: location.lat,
      farmLng: location.lng
    }

    const result = await register(dataToSend)

    if (result.success) {
      //alert('Registration successful! Please log in.')
      logout()
      Swal.fire({
        title: 'Success!',
        text: 'Registration successful! Please log in.',
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
    <div className="auth-container">
      <div className="auth-form">
        <h2>Create Your Farm Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Username & Email */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone & Farm Name */}
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="farmName">Farm Name</label>
            <input
              type="text"
              id="farmName"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Farm Location Picker */}
          <div className="form-group">
            <label>Farm Location</label>
            <LocationPicker location={location} setLocation={setLocation} />
            {location.lat && location.lng && (
              <p>
                Selected: Latitude {location.lat}, Longitude {location.lng}
              </p>
            )}
          </div>

          {/* Farm Area & Soil Type */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="farmTotalArea">Farm Area (hectares)</label>
              <input
                type="number"
                id="farmTotalArea"
                name="farmTotalArea"
                value={formData.farmTotalArea}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="farmSoilType">Soil Type</label>
              <select
                id="farmSoilType"
                name="farmSoilType"
                value={formData.farmSoilType}
                onChange={handleChange}
              >
                <option value="">Select Soil Type</option>
                <option value="loamy">Loamy</option>
                <option value="sandy">Sandy</option>
                <option value="clay">Clay</option>
                <option value="silt">Silt</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} className="btn btn-primary btn-block">
            {isLoading ? 'Creating Account...' : 'Create Account'}
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
