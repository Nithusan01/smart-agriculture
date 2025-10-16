import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedAdminRoute = ({ children }) => {
  const { currentUser,isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />
  }
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};
export default ProtectedAdminRoute;