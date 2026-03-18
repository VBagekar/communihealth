import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { VillageIcon } from '../components/MedicalIllustration';

const COLORS = ['#0d9488', '#f59e0b', '#f43f5e', '#a855f7', '#64748b'];

const StatCard = ({ title, value, gradientStr, icon }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const endStr = typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value;
    const end = parseFloat(endStr) || 0;
    const isPercentage = typeof value === 'string' && value.includes('%');

    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }

    const duration = 1200;
    const frameRate = 16;
    const totalFrames = duration / frameRate;
    let frame = 0;

    const easeOutOut = (t) => 1 - Math.pow(1 - t, 3);

    const timer = setInterval(() => {
      frame++;
      const progress = easeOutOut(frame / totalFrames);
      const current = Math.round(end * progress);
      
      setCount(isPercentage ? `${current}%` : current);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(value);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`rounded-[20px] p-6 text-white relative overflow-hidden glass-card transition-all duration-300 hover:-translate-y-2 hover:shadow-lift w-full ${gradientStr}`}>
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-[30px]"></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-6">
          <p className="font-bold text-white/95 text-[11px] uppercase tracking-widest">{title}</p>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-sm">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-4xl md:text-5xl font-bold font-serif filter drop-shadow-sm">{count}</h3>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/stats/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full border-t-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  // Placeholder LineChart Data (Simulating new patient registrations)
  const lineData = [
    { name: 'Oct', patients: Math.floor(stats?.totalPatients * 0.1) || 12 },
    { name: 'Nov', patients: Math.floor(stats?.totalPatients * 0.15) || 19 },
    { name: 'Dec', patients: Math.floor(stats?.totalPatients * 0.12) || 15 },
    { name: 'Jan', patients: Math.floor(stats?.totalPatients * 0.25) || 25 },
    { name: 'Feb', patients: Math.floor(stats?.totalPatients * 0.18) || 22 },
    { name: 'Mar', patients: Math.floor(stats?.totalPatients * 0.2) || 30 },
  ];

  const pieData = stats?.topDiagnoses?.length > 0 ? stats.topDiagnoses : [{ name: 'None', count: 1 }];

  return (
    <div className="min-h-screen bg-base-bg pb-16 relative overflow-visible font-sans">
      <VillageIcon className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] text-primary/5 pointer-events-none" />
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-800 tracking-tight">Overview</h1>
            <p className="text-gray-500 mt-2 font-medium">Here's what's happening today in your clinics.</p>
          </div>
          <div className="text-xs text-gray-600 font-bold bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 uppercase tracking-widest text-center">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Hero stat cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Patients" 
            value={stats?.totalPatients || 0} 
            gradientStr="bg-gradient-to-br from-teal-500 to-teal-700"
            icon={<span className="text-2xl filter drop-shadow-sm pointer-events-none">👥</span>}
          />
          <StatCard 
            title="Consultations" 
            value={stats?.totalConsultations || 0} 
            gradientStr="bg-gradient-to-br from-amber-400 to-amber-600"
            icon={<span className="text-2xl filter drop-shadow-sm pointer-events-none">🩺</span>}
          />
          <StatCard 
            title="Villages Covered" 
            value={stats?.villagesCovered || 0} 
            gradientStr="bg-gradient-to-br from-green-500 to-green-700"
            icon={<span className="text-2xl filter drop-shadow-sm pointer-events-none">🏘️</span>}
          />
          <StatCard 
            title="Vaccination Rate" 
            value={`${stats?.vaccinationCoverage || 0}%`} 
            gradientStr="bg-gradient-to-br from-purple-500 to-purple-700"
            icon={<span className="text-2xl filter drop-shadow-sm pointer-events-none">💉</span>}
          />
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Bar Chart */}
          <div className="glass-card p-8 lg:col-span-2 relative overflow-hidden flex flex-col justify-between">
            <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif">Patients by Village</h3>
            <div className="h-72 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.patientsByVillage || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="village" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#cad5e2', fontSize: 13}} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(13, 148, 136, 0.05)'}}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.95)', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} maxBarSize={60} animationDuration={2000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass-card p-8 flex flex-col justify-between relative overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-2 font-serif">Top Diagnoses</h3>
            <div className="h-64 w-full relative -mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="count"
                    animationDuration={2000}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Label */}
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-4xl font-black text-gray-800 font-serif">{stats?.totalConsultations}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Total Cases</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center text-[11px] uppercase tracking-wider text-gray-600 font-bold bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md cursor-default hover:-translate-y-0.5">
                  <div className="w-2.5 h-2.5 rounded-full mr-2 shadow-inner" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name}
                  <span className="ml-2 text-gray-400 font-medium">({entry.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full width Linechart */}
        <div className="glass-card p-8 mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-8 font-serif">New Registrations</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 13}} />
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="patients" stroke="#0d9488" strokeWidth={4} fillOpacity={1} fill="url(#colorPatients)" animationDuration={2500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent consultations table */}
        <div className="glass-card overflow-hidden shadow-soft border border-white/60">
          <div className="p-8 border-b border-gray-100/80 bg-white/40 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 font-serif">Recent Consultations</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-dark transition-colors px-4 py-2 bg-primary/5 rounded-lg hover:bg-primary/10">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100/80">
                  <th className="px-8 py-4 font-bold">Patient Details</th>
                  <th className="px-8 py-4 font-bold">Consultation Date</th>
                  <th className="px-8 py-4 font-bold">Primary Diagnosis</th>
                  <th className="px-8 py-4 font-bold">Health Worker</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {stats?.recentActivity?.length > 0 ? (
                  stats.recentActivity.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-white/80 transition-all duration-300 overflow-hidden group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors">{activity.patient?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{activity.patient?.village} • {activity.patient?.patientId}</p>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">
                        {new Date(activity.consultationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-gray-100 text-gray-700 shadow-sm border border-gray-200">
                          {activity.diagnosis}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                            {activity.healthWorker?.name?.charAt(0) || 'U'}
                          </div>
                          {activity.healthWorker?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 relative border border-emerald-100 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">
                      No recent activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
