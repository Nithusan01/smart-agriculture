import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Load user from token on initial render
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
      setCurrentUser(null) // ✅ Clear current user on error
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

      return { success: true, data: user }
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
    setUsers([]) // ✅ Clear users on logout
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
      setUsersLoading(true) // ✅ Set loading state
      const response = await api.get('/auth/')
      setUsers(response.data.data || []) // ✅ Ensure it's an array
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
    } finally {
      setUsersLoading(false) // ✅ Reset loading state
    }
  }

  const deleteUser = async (id) => {
    try {
      if (!id) {
        throw new Error('User ID is required')
      }

      const response = await api.delete(`auth/${id}`)
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== id))

      return {
        success: true,
        data: response.data,
        message: 'User deleted successfully'
      }
    } catch (error) {
      console.error('Delete user error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      }
    }
  }

  // Update user 
  const updateUser = async (id, data) => {
    try {
      if (!id) {
        throw new Error('User ID is required')
      }
      
      const response = await api.put(`auth/${id}`, data)
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...response.data.data } : user
      ))
      
      // If current user is updated, update currentUser state as well
      if (currentUser?.id === id) {
        setCurrentUser(prev => ({ ...prev, ...response.data.data }))
      }

      return {
        success: true,
        data: response.data.data,
        message: 'User updated successfully'
      }
    } catch (error) {
      console.error('Update user API error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      }
    }
  }

  // Create user by admin
  const createUserByAdmin = async (userData) => {
    try {
      // ✅ Ensure role is set, default to "farmer"
      const dataToSend = {
        ...userData,
        role: userData.role || "farmer"
      }
      
      const response = await api.post('/auth/create-user', dataToSend)
      
      // Update local state
      if (response.data.data) {
        setUsers(prev => [...prev, response.data.data])
      }

      return {
        success: true,
        data: response.data.data,
        message: 'User created successfully'
      }
    } catch (error) {
      console.error('Create user API error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user'
      }
    }
  }

  // ✅ Add a function to refresh current user data
  const refreshCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setCurrentUser(response.data.user)
      return { success: true, data: response.data.user }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      return { success: false, error: 'Failed to refresh user data' }
    }
  }

  const value = {
    currentUser,
    fetchUser,
    isLoading,
    usersLoading,
    login,
    register,
    users,
    setUsers,
    fetchAllUsers,
    deleteUser,
    logout,
    updateUser,
    createUserByAdmin,
    refreshCurrentUser // ✅ Export the new function
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}