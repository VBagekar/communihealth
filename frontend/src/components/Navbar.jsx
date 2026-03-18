import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CrossIcon } from './MedicalIllustration';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isLinkActive = (path) => {
    return location.pathname.startsWith(path) ? 'text-primary' : 'text-gray-500 hover:text-gray-900';
  };

  return (
    <>
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-dark to-primary-light"></div>
      <nav className="bg-white/85 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[72px] flex-items-center justify-between">
            {/* Logo area */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-primary/20 group-hover:shadow-[0_4px_16px_rgba(13,148,136,0.3)] duration-300 transform group-hover:-rotate-3 group-hover:scale-105">
                  <CrossIcon className="w-6 h-6"/>
                </div>
                <span className="font-serif font-black text-2xl text-gray-800 tracking-tight group-hover:text-primary transition-colors">CommuniHealth</span>
              </Link>
            </div>
            
            {/* Center Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/dashboard" className={`text-sm font-bold tracking-wide uppercase transition-colors ${isLinkActive('/dashboard')}`}>Dashboard</Link>
              <Link to="/patients" className={`text-sm font-bold tracking-wide uppercase transition-colors ${isLinkActive('/patients') && location.pathname !== '/patients/add'}`}>Patients</Link>
              <Link to="/patients/add" className={`text-sm font-bold tracking-wide uppercase transition-colors ${isLinkActive('/patients/add')}`}>Add Patient</Link>
            </div>

            {/* Right side user info & actions */}
            <div className="flex items-center gap-6">
              {user && (
                <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-full pl-4 pr-1.5 py-1.5 border border-gray-100 shadow-inner">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{user.role?.replace('_', ' ')}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
                    {user.name?.charAt(0)}
                  </div>
                </div>
              )}
              
              <button 
                onClick={logout}
                className="text-sm px-4 py-2 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all font-bold border-2 border-transparent hover:border-red-600 hover:shadow-lg focus:outline-none"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
