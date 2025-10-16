import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";


const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await login(credentials)
    
    if (result.success) {
      navigate('/')
    }
     else {
      setError(result.error)
      Swal.fire({
        title: 'Error!',
        text: result.error,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#648bdfff',
        background: '#f8f9fa'

      });
    }
    
    setIsLoading(false)
  }

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl   w-full  max-w-md">
        <h2 className='text-green-700 text-xl text-center py-6 '>Login to Your Farm Account</h2>
        {error && <div className="bg-red-100 border-red-200 text-yellow-800 py-1 pl-2 mb-3">{error}</div>}
        

<form onSubmit={handleSubmit} className="space-y-6">
  <div className="relative w-full max-w-sm">
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <input
      type="text" 
      id="username"
      name="username"
      value={credentials.username}
      onChange={handleChange}
      required
      placeholder='Username or email'
      className='shadow-lg rounded-2xl border border-gray-200 px-12 py-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300'
    />
  </div>
  
  <div className="relative w-full max-w-sm"> 
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      name="password"
      value={credentials.password}
      onChange={handleChange}
      required
      onPaste={e => e.preventDefault()}
      className='shadow-lg rounded-2xl border border-gray-200 px-12 py-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300'
      placeholder='Password'
    />
    <button
      type="button"
      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors duration-200 focus:outline-none"
      onClick={() => setShowPassword(!showPassword)}
    >
      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
    </button>
  </div>
  
  <button 
    type="submit" 
    disabled={isLoading}
    className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Logging in...
      </div>
    ) : 'Login'}
  </button>
</form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register" className='text-[#0e46bfff] font-semibold hover:text-[#648bdfff]'>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login