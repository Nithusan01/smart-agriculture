import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

const PrivateRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }
  
  return currentUser ? children : <Navigate to="/login" replace/>
}

export default PrivateRoute 