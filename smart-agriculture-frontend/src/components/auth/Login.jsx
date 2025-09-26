import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Swal from 'sweetalert2'


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
      navigate('/dashboard')
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

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className='text-green-700 text-xl'>Login to Your Farm Account</h2>
        {error && <div className="bg-red-100 border-red-200 text-yellow-800 py-1 pl-2 mb-3">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text" 
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary btn-block"
          >
            {isLoading ? 'Logging in...' : 'Login'}
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