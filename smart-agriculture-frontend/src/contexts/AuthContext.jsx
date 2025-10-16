import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users,setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false)


  

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])
  

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setCurrentUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setIsLoading(false)
    }
  }
  

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setCurrentUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed server error'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setCurrentUser(user)


      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setCurrentUser(null)
    
  }

  const fetchAllUsers = async () => {
    // Check if user is admin
    if (currentUser?.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin access required'
      }
    }

    try {
      const response = await api.get('/auth/')
      setUsers(response.data.data)
      return {
        success: true,
        message: 'Users fetched successfully'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users'
      console.error('Error fetching users:', error)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const deleteUser = async (id)=>{

    if (!id) {
        throw new Error('user ID is required');
    }
    
    const response = await api.delete(`auth/${id}`);
    
    // Optional: Add logging for debugging
    console.log(`user ${id} deleted successfully`);
    
    return response;

  }

  const value = {
    currentUser,
    fetchUser,
    isLoading,
    login,
    register,
    users,
    setUsers,
    fetchAllUsers,
    deleteUser,
    logout

  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}