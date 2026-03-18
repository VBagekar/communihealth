import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-bg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin mb-4"></div>
          <p className="text-primary-dark font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Fallback check: if no context user but token exists, AuthContext might be still validating
  // (though `loading` flag handles most of this). If strictly no user and no token, boot them.
  if (!user && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
