import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

const PrivateRoute = ({ children }) => {
  const { currentUser, isLoading,logout } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }
  if (currentUser?.role !== "farmer"){
    logout();
    return <Navigate to="/login" replace/>
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  return children ;
}

export default PrivateRoute 