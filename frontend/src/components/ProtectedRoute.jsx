import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const role = sessionStorage.getItem('role');

  // ❌ Not logged in
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Wrong role
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;