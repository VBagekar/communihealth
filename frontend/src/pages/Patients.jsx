import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

// Helper to get vaccine status 
const getCombinedVaccineStatus = (vaccines = []) => {
  if (!vaccines || vaccines.length === 0) return { label: 'No Data', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', icon: '?' };
  
  const hasOverdue = vaccines.some(v => v.status === 'overdue');
  if (hasOverdue) return { label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500', icon: '✗' };
  
  const hasPending = vaccines.some(v => v.status === 'pending');
  if (hasPending) return { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', icon: '⚠' };
  
  return { label: 'Up to date', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', icon: '✓' };
};

// Blood group colors for top strip
const getBloodGroupColor = (bg) => {
  if (!bg) return 'bg-gray-300';
  if (bg.includes('O')) return 'bg-teal-500';
  if (bg.includes('A') && !bg.includes('AB')) return 'bg-amber-400';
  if (bg.includes('B') && !bg.includes('AB')) return 'bg-purple-400';
  if (bg.includes('AB')) return 'bg-rose-400';
  return 'bg-primary';
};

// Generate random color for initials avatar based on name string
const getAvatarColor = (name) => {
  const colors = [
    'from-teal-400 to-teal-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-indigo-400 to-indigo-600',
    'from-purple-400 to-purple-600'
  ];
  const charCode = name ? name.charCodeAt(0) : 0;
  return colors[charCode % colors.length];
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();
  const canAdd = user?.role === 'admin' || user?.role === 'health_worker';

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams({
        page,
        limit: 12,
      });
      if (searchQuery) params.append('name', searchQuery);
      if (villageFilter) params.append('village', villageFilter);
      if (genderFilter) params.append('gender', genderFilter);

      const res = await api.get(`/api/patients?${params.toString()}`);
      setPatients(res.data.patients || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchQuery, villageFilter, genderFilter]);

  // Handle Search Input Change (reset page to 1)
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-base-bg font-sans pb-24 relative">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-800 tracking-tight">Patient Directory</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage and view records across all villages.</p>
          </div>
          
          <div className="w-full md:w-auto relative group">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-[14px] h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search patients by name..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-full md:w-80 pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium relative z-0"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-gray-200/80">
          <div className="flex items-center gap-2 mr-4 bg-gray-100/50 px-3 py-1.5 rounded-lg border border-gray-200/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Filters</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select 
                value={villageFilter} 
                onChange={(e) => { setVillageFilter(e.target.value === 'All' ? '' : e.target.value); setPage(1); }}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-full pl-5 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm appearance-none font-bold cursor-pointer hover:border-primary/50 transition-colors"
              >
                <option value="">All Villages</option>
                <option value="Wardha">Wardha</option>
                <option value="Yavatmal">Yavatmal</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Amravati">Amravati</option>
                <option value="Chandrapur">Chandrapur</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select 
                value={genderFilter} 
                onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-full pl-5 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm appearance-none font-bold cursor-pointer hover:border-primary/50 transition-colors"
              >
                <option value="">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Grid */}
        {loading && patients.length === 0 ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full border-t-primary animate-spin"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center p-20 text-center border-dashed border-2 border-gray-300 bg-white/40">
             <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
               <span className="text-4xl filter grayscale opacity-60">📂</span>
             </div>
             <h3 className="text-2xl font-serif font-bold text-gray-800 mb-3">No patients found</h3>
             <p className="text-gray-500 max-w-sm font-medium">Try adjusting your filters or search query, or add a new patient to the directory.</p>
             {canAdd && (
                <button 
                  onClick={() => navigate('/patients/add')}
                  className="mt-8 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all"
                >
                  + Add New Patient
                </button>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map(patient => {
              const vStatus = getCombinedVaccineStatus(patient.vaccines);
              return (
                <div 
                  key={patient._id} 
                  onClick={() => navigate(`/patients/${patient._id}`)}
                  className="glass-card cursor-pointer overflow-hidden group flex flex-col h-full bg-white/80 border border-white/60 relative"
                >
                  {/* Top Colored Strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${getBloodGroupColor(patient.bloodGroup)} transition-all duration-300 group-hover:h-2 z-20`}></div>
                  
                  <div className="p-7 flex-1 flex flex-col pt-8 relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(patient.name)} text-white font-serif font-black text-2xl flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.1)] border-2 border-white group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-primary transition-colors tracking-tight">{patient.name}</h3>
                          <p className="text-[10px] font-bold text-primary opacity-60 uppercase tracking-widest mt-1">{patient.patientId}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="inline-flex items-center justify-center py-1 px-3 rounded-md bg-white text-gray-700 text-[11px] font-extrabold uppercase tracking-wider border border-gray-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                        {patient.age} Yrs
                      </span>
                      <span className="inline-flex items-center justify-center py-1 px-3 rounded-md bg-white text-gray-700 text-[11px] font-extrabold uppercase tracking-wider border border-gray-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                        {patient.gender}
                      </span>
                      {patient.bloodGroup && (
                        <span className="inline-flex items-center justify-center py-1 px-3 rounded-md bg-white text-gray-700 text-[11px] font-extrabold uppercase tracking-wider border border-gray-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                          <span className="text-red-500 mr-1 text-sm leading-none drop-shadow-sm">🩸</span> {patient.bloodGroup}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto space-y-3.5 pt-5 border-t border-gray-200/50">
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <div className="w-6 flex justify-center text-primary/70 mr-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        {patient.village} {patient.district && <span className="text-gray-400 font-normal">, {patient.district}</span>}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <div className="w-6 flex justify-center text-primary/70 mr-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        Registered {new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <div className="pt-3 pb-1">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${vStatus.color} shadow-sm border border-black/5 w-full`}>
                          <span className={`w-2 h-2 rounded-full ${vStatus.dot} mr-2 shadow-inner`}></span>
                          {vStatus.icon} {vStatus.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 mb-8">
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-transparent bg-white text-gray-500 hover:border-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all font-bold"
              >
                &larr;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm transition-all border-2 ${
                    page === pageNum 
                      ? 'bg-primary text-white border-primary shadow-[0_4px_16px_rgba(13,148,136,0.3)] shadow-primary/40 -translate-y-0.5' 
                      : 'bg-white border-transparent text-gray-600 hover:border-primary/30 hover:text-primary shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-transparent bg-white text-gray-500 hover:border-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all font-bold"
              >
                &rarr;
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {canAdd && (
        <button 
          onClick={() => navigate('/patients/add')}
          className="fixed bottom-10 right-10 w-[72px] h-[72px] bg-gradient-to-tr from-primary to-primary-dark text-white rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(13,148,136,0.4)] hover:shadow-[0_16px_40px_rgba(13,148,136,0.6)] hover:-translate-y-2 transition-all duration-300 z-50 group border-[3px] border-white/90"
          title="Add Patient"
        >
          <div className="absolute inset-0 rounded-full border-[6px] border-primary opacity-20 animate-ping group-hover:hidden" style={{ animationDuration: '3s' }}></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10 filter drop-shadow-md group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Patients;
