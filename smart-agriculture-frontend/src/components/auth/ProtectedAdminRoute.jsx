import {  Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();

  // Wait until auth state is resolved
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized admin
  return children;
};
export default ProtectedAdminRoute;