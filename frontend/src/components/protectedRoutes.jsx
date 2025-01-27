import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    // Redirect to the login screen if not authenticated
    return <Navigate to="/users/LoginScreen" replace />;
  }

  // Render the child components if authenticated
  return children;
};

export default ProtectedRoute;
