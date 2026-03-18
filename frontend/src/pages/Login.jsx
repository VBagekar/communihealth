import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (role) => {
    if (role === 'admin') {
      setEmail('admin@communihealth.org');
      setPassword('Admin@123');
    } else if (role === 'worker') {
      setEmail('worker@communihealth.org');
      setPassword('Worker@123');
    } else {
      setEmail('viewer@communihealth.org');
      setPassword('Viewer@123');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fef9f0]">
      {/* Absolute Decorative SVGs */}
      
      {/* Left Panel */}
      <div className="w-3/5 p-8 md:p-16 flex flex-col justify-center relative z-10 min-h-screen">
        {/* Large Decorative Circle */}
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl text-primary-dark font-serif font-bold mb-6 leading-tight">
            Healthcare for every village
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Supporting ASHA workers across rural India with modern, accessible tools.
          </p>

          <div className="flex flex-col gap-5 mt-4">
            <div className="glass-card px-6 py-4 flex items-center gap-4 w-max transform hover:scale-105 transition-all">
              <span className="text-3xl filter drop-shadow-sm">🏥</span>
              <span className="font-semibold text-gray-800 text-lg">Patient Records</span>
            </div>
            <div className="glass-card px-6 py-4 flex items-center gap-4 w-max transform hover:scale-105 transition-all ml-8">
              <span className="text-3xl filter drop-shadow-sm">💉</span>
              <span className="font-semibold text-gray-800 text-lg">Vaccine Tracking</span>
            </div>
            <div className="glass-card px-6 py-4 flex items-center gap-4 w-max transform hover:scale-105 transition-all ml-16">
              <span className="text-3xl filter drop-shadow-sm">📊</span>
              <span className="font-semibold text-gray-800 text-lg">Health Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-2/5 flex items-center justify-center p-12">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          
          <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-primary-light rounded-full blur-[40px] opacity-60 z-0 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 0H11.5V8.5H20V11.5H11.5V20H8.5V11.5H0V8.5H8.5V0Z" fill="#0d9488"/>
              </svg>
              <span className="text-xl font-bold font-serif text-[#0d9488]">CommuniHealth</span>
            </div>
            <h2 className="text-3xl text-gray-800 font-serif font-bold mb-2">Welcome back</h2>
            <p className="text-gray-500">Sign in to CommuniHealth</p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 animate-pulse">
                {error}
              </div>
            )}
            
            <div className="mb-5 relative group">
              <label className="absolute -top-2.5 left-3 bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-gray-500 group-focus-within:text-primary transition-colors shadow-sm border border-gray-100">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white/50 focus:bg-white"
                required
              />
            </div>
            
            <div className="mb-8 relative group">
              <label className="absolute -top-2.5 left-3 bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-gray-500 group-focus-within:text-primary transition-colors shadow-sm border border-gray-100">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white/50 focus:bg-white"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg btn-primary mb-6 flex justify-center items-center shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Sign in'}
            </button>
            
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-[11px] text-center text-gray-400 mb-4 font-bold uppercase tracking-widest">Demo Credentials</p>
              <div className="flex justify-center gap-2 flex-wrap">
                <button type="button" onClick={() => autofill('admin')} className="text-xs px-4 py-2 rounded-lg bg-gray-50 hover:bg-primary/10 hover:text-primary text-gray-600 transition-all border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow">Admin</button>
                <button type="button" onClick={() => autofill('worker')} className="text-xs px-4 py-2 rounded-lg bg-gray-50 hover:bg-primary/10 hover:text-primary text-gray-600 transition-all border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow">Worker</button>
                <button type="button" onClick={() => autofill('viewer')} className="text-xs px-4 py-2 rounded-lg bg-gray-50 hover:bg-primary/10 hover:text-primary text-gray-600 transition-all border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow">Viewer</button>
              </div>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
