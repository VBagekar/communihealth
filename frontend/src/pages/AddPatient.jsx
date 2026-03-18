import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const AddPatient = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Female', village: '', district: '', phone: '', bloodGroup: ''
  });
  
  const conditionsList = ['Diabetes', 'Hypertension', 'Asthma', 'Tuberculosis', 'Thyroid', 'Anemia'];
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [notes, setNotes] = useState('');
  
  const [vaccines, setVaccines] = useState([]);
  const [vInput, setVInput] = useState({ name: '', date: '', status: 'completed' });

  // Handlers
  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const toggleCondition = (cond) => {
    if (medicalHistory.includes(cond)) {
      setMedicalHistory(medicalHistory.filter(c => c !== cond));
    } else {
      setMedicalHistory([...medicalHistory, cond]);
    }
  };

  const addVaccine = () => {
    if (!vInput.name || !vInput.date) return;
    setVaccines([...vaccines, vInput]);
    setVInput({ name: '', date: '', status: 'completed' });
  };

  const removeVaccine = (idx) => {
    const newV = [...vaccines];
    newV.splice(idx, 1);
    setVaccines(newV);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const finalHistory = [...medicalHistory];
      if (notes.trim()) finalHistory.push(`Notes: ${notes}`);

      const payload = {
        ...formData,
        age: parseInt(formData.age),
        medicalHistory: finalHistory,
        vaccines
      };

      await api.post('/api/patients', payload);
      setSuccess(true);
      setTimeout(() => navigate('/patients'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
      setLoading(false);
    }
  };

  // UI Components
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-12 relative w-full max-w-lg mx-auto">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
      
      <div className="flex justify-between w-full relative z-10">
        {[1, 2, 3].map(num => (
          <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
            step >= num ? 'bg-primary text-white shadow-[0_0_15px_rgba(13,148,136,0.6)]' : 'bg-white text-gray-400 border-2 border-gray-200'
          }`}>
            {num}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-bg pb-20 font-sans">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 mt-12">
        
        {success ? (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-500 animate-[stroke_1s_ease-out_forwards]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-800">Patient Added Successfully!</h2>
            <p className="text-gray-500 mt-2">Redirecting to directory...</p>
          </div>
        ) : (
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <h1 className="text-3xl font-serif font-bold text-center text-gray-800 mb-2">Add New Patient</h1>
            <p className="text-center text-gray-500 mb-10 text-sm">Fill in the details below to register a new beneficiary.</p>
            
            <StepIndicator />
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="form-group relative">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="Enter patient's full name" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="form-group relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Age</label>
                    <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="Years" />
                  </div>
                  <div className="form-group relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1-5 block">Gender</label>
                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 mt-1.5">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button key={g} onClick={() => setFormData({...formData, gender: g})} type="button" className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.gender === g ? 'bg-white text-primary shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="form-group relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Village</label>
                    <input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="Village name" />
                  </div>
                  <div className="form-group relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">District</label>
                    <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="District name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="form-group relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Phone (Optional)</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="+91" />
                  </div>
                  <div className="form-group relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Blood Group</label>
                    <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white">
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Pre-existing Conditions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {conditionsList.map(cond => {
                    const active = medicalHistory.includes(cond);
                    return (
                      <div key={cond} onClick={() => toggleCondition(cond)} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${active ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-white text-gray-600 hover:border-primary/30'}`}>
                        <span className="font-bold text-sm">{cond}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                          {active && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-8">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex justify-between">
                    <span>Medical Notes</span>
                    <span className="text-gray-400 font-normal">{notes.length}/200</span>
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value.substring(0, 200))} rows="4" className="w-full mt-2 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none" placeholder="Add any additional medical history or lifestyle notes..."></textarea>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-primary-dark mb-4 filter drop-shadow-sm">Add Vaccination Record</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Vaccine Name</label>
                      <input type="text" value={vInput.name} onChange={e => setVInput({...vInput, name: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 outline-none text-sm" placeholder="e.g. Polio" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Date Administered</label>
                      <input type="date" value={vInput.date} onChange={e => setVInput({...vInput, date: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Status</label>
                      <select value={vInput.status} onChange={e => setVInput({...vInput, status: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 outline-none text-sm bg-white">
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={addVaccine} className="px-5 py-2.5 bg-white border border-primary/30 text-primary font-bold rounded-lg text-sm hover:bg-primary/10 transition-colors shadow-sm w-full md:w-auto">
                    + Add Vaccine
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 block mb-2">Vaccines Added ({vaccines.length})</label>
                  {vaccines.length === 0 ? (
                    <p className="text-sm text-gray-400 italic p-4 text-center border border-dashed border-gray-200 rounded-xl">No vaccines added yet.</p>
                  ) : (
                    vaccines.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div>
                          <p className="font-bold text-gray-800">{v.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{new Date(v.date).toLocaleDateString()} • <span className={`capitalize ${v.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>{v.status}</span></p>
                        </div>
                        <button onClick={() => removeVaccine(i)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center relative z-10">
              {step > 1 ? (
                <button type="button" onClick={handlePrev} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                  Back
                </button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button type="button" onClick={handleNext} disabled={!formData.name || !formData.age || !formData.village} className="px-8 py-3 btn-primary font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                  Next Step
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading} className="px-10 py-3 btn-primary font-bold rounded-xl flex items-center justify-center min-w-[160px]">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Patient'}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddPatient;
