import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ diagnosis: '', followUpDate: '' });
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [pInput, setPInput] = useState({ medicine: '', dosage: '', duration: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.get(`/api/patients/${id}`),
        api.get(`/api/consultations/patient/${id}`)
      ]);
      setPatient(pRes.data);
      setConsultations(cRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddSymptom = (e) => {
    if (e.key === 'Enter' && symptomInput.trim()) {
      e.preventDefault();
      if (!symptoms.includes(symptomInput.trim())) setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const addPrescription = () => {
    if (!pInput.medicine) return;
    setPrescriptions([...prescriptions, pInput]);
    setPInput({ medicine: '', dosage: '', duration: '' });
  };

  const removeSymptom = (s) => setSymptoms(symptoms.filter(x => x !== s));
  const removePrescription = (i) => {
    const arr = [...prescriptions];
    arr.splice(i, 1);
    setPrescriptions(arr);
  };

  const submitConsultation = async () => {
    if (!formData.diagnosis) return;
    setSaving(true);
    try {
      const payload = {
        patient: id,
        diagnosis: formData.diagnosis,
        symptoms,
        prescription: prescriptions,
        ...(formData.followUpDate ? { followUpDate: formData.followUpDate } : {})
      };
      await api.post('/api/consultations', payload);
      setIsModalOpen(false);
      
      // Reset form & Refresh
      setFormData({ diagnosis: '', followUpDate: '' });
      setSymptoms([]);
      setPrescriptions([]);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-base-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full border-t-primary animate-spin"></div>
      </div>
    </div>
  );

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-base-bg font-sans pb-24 relative">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Col: Info & Vaccines */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Patient Card */}
          <div className="glass-card p-8 border border-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors border border-gray-200 shadow-sm" title="Edit Patient">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white font-serif font-bold text-4xl flex items-center justify-center shadow-lg border-4 border-white mb-4">
                {patient.name.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold font-serif text-gray-800 tracking-tight">{patient.name}</h1>
              <span className="text-xs font-bold text-primary tracking-widest uppercase mt-1 mb-6 bg-primary/10 px-3 py-1 rounded-md">{patient.patientId}</span>
              
              <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-gray-100 pt-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Age / Gender</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{patient.age} • {patient.gender}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Village</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{patient.village}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Blood Group</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{patient.bloodGroup || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Phone</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{patient.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Med History summary */}
          {patient.medicalHistory?.length > 0 && (
            <div className="glass-card p-6 border border-white">
               <h3 className="font-bold text-gray-800 mb-4 font-serif">Medical History</h3>
               <div className="flex flex-wrap gap-2">
                 {patient.medicalHistory.map((item, i) => (
                   item.startsWith('Notes:') ? (
                     <p key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic w-full mt-2">{item.replace('Notes:', '')}</p>
                   ) : (
                     <span key={i} className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase">{item}</span>
                   )
                 ))}
               </div>
            </div>
          )}

          {/* Vaccines */}
          <div className="glass-card overflow-hidden border border-white">
            <div className="p-6 pb-4 border-b border-gray-100">
               <h3 className="font-bold text-gray-800 font-serif">Vaccination Record</h3>
            </div>
            
            <div className="flex flex-col">
              {patient.vaccines?.length > 0 ? (
                patient.vaccines.map((v, i) => {
                  let leftC = 'border-emerald-500';
                  let bgC = 'bg-emerald-50/30';
                  let txtC = 'text-emerald-700';
                  
                  if (v.status === 'pending') { leftC = 'border-amber-400'; bgC = 'bg-amber-50/50'; txtC = 'text-amber-700'; }
                  if (v.status === 'overdue') { leftC = 'border-red-500 animate-[pulse_2s_ease-in-out_infinite]'; bgC = 'bg-red-50/80'; txtC = 'text-red-700'; }

                  return (
                    <div key={i} className={`p-4 border-l-4 ${leftC} border-b border-gray-100 flex justify-between items-center ${bgC} transition-colors`}>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{v.name}</p>
                        <p className="text-xs text-gray-500 font-medium">Recorded: {new Date(v.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white rounded-md shadow-sm border border-black/5 ${txtC}`}>
                        {v.status}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-sm text-gray-500 italic">No vaccines recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Consultations Timeline */}
        <div className="w-full lg:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-serif text-gray-800">Consultation History</h2>
            <div className="text-sm font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
              {consultations.length} Visits
            </div>
          </div>

          <div className="relative border-l-2 border-primary/20 ml-4 md:ml-8 space-y-12 pb-10">
            {consultations.length === 0 ? (
              <div className="ml-8 glass-card p-10 text-center border-dashed border-2 border-gray-200">
                <p className="text-gray-500">No consultations found for this patient.</p>
              </div>
            ) : (
              consultations.map((cons, i) => (
                <div key={cons._id} className="relative ml-8 md:ml-12 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] md:-left-[57px] top-4 w-6 h-6 rounded-full bg-primary border-4 border-white shadow-md group-hover:scale-125 group-hover:bg-primary-dark transition-all duration-300 z-10"></div>
                  
                  {/* Card */}
                  <div className="glass-card p-6 border border-white hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="bg-primary/10 text-primary-dark font-bold text-sm px-3 py-1.5 rounded-lg">
                           {new Date(cons.consultationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                         </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200 shadow-inner">
                           {cons.healthWorker?.name?.charAt(0) || 'U'}
                         </div>
                         <div>
                           <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Attended By</p>
                           <p className="text-sm font-bold text-gray-800 mt-0.5">{cons.healthWorker?.name}</p>
                         </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-serif font-bold text-gray-800 mb-4 flex items-center">
                      <span className="bg-red-500 w-2 h-6 rounded-full mr-3"></span>
                      {cons.diagnosis}
                    </h3>

                    {cons.symptoms?.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Reported Symptoms</p>
                        <div className="flex flex-wrap gap-2">
                          {cons.symptoms.map((sym, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded border border-gray-200">{sym}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cons.prescription?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Prescription</p>
                        <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100/80 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Medicine</th>
                                <th className="px-4 py-3">Dosage</th>
                                <th className="px-4 py-3">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {cons.prescription.map((rx, idx) => (
                                <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 font-semibold text-gray-800">{rx.medicine}</td>
                                  <td className="px-4 py-3 font-medium text-gray-600">{rx.dosage}</td>
                                  <td className="px-4 py-3 font-medium text-gray-600">{rx.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {cons.followUpDate && (
                      <div className="mt-4 flex items-center text-sm font-bold text-primary bg-primary/5 p-3 rounded-xl border border-primary/20 w-max">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Follow up: {new Date(cons.followUpDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Add Consultation Button */}
      {(user?.role === 'admin' || user?.role === 'health_worker') && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-10 right-10 flex items-center gap-3 bg-gradient-to-tr from-primary to-primary-dark text-white px-6 py-4 rounded-full shadow-[0_12px_30px_rgba(13,148,136,0.4)] hover:shadow-[0_16px_40px_rgba(13,148,136,0.6)] hover:-translate-y-1 transition-all group font-bold font-serif text-lg border-2 border-white z-40"
        >
          <span className="text-2xl font-sans mb-0.5 filter drop-shadow-sm group-hover:rotate-90 transition-transform">+</span> 
          Add Visit
        </button>
      )}

      {/* Complete Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-800">New Consultation</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{patient.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              
              <div className="form-group">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Primary Diagnosis <span className="text-red-500">*</span></label>
                <input type="text" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Malaria, Typhoid, Viral Fever" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1 block mb-1.5">Symptoms (Press Enter)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {symptoms.map((s, idx) => (
                    <span key={idx} className="bg-primary/10 text-primary-dark px-3 py-1.5 rounded-lg text-sm font-bold flex items-center border border-primary/20">
                      {s} <button onClick={() => removeSymptom(s)} className="ml-2 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
                <input type="text" value={symptomInput} onChange={e => setSymptomInput(e.target.value)} onKeyDown={handleAddSymptom} className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white" placeholder="Add symptom and press Enter..." />
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                 <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Prescribe Medicine</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                   <input type="text" placeholder="Medicine Name" value={pInput.medicine} onChange={e => setPInput({...pInput, medicine: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-medium" />
                   <input type="text" placeholder="Dosage (500mg)" value={pInput.dosage} onChange={e => setPInput({...pInput, dosage: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-medium" />
                   <input type="text" placeholder="Duration (5 days)" value={pInput.duration} onChange={e => setPInput({...pInput, duration: e.target.value})} className="p-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-medium" />
                 </div>
                 <button onClick={addPrescription} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl text-sm hover:border-primary hover:text-primary transition-all shadow-sm">
                   + Add Item
                 </button>

                 {prescriptions.length > 0 && (
                   <ul className="mt-4 space-y-2">
                     {prescriptions.map((rx, idx) => (
                       <li key={idx} className="flexjustify-between p-3 bg-white border border-gray-100 rounded-lg text-sm font-medium flex items-center justify-between shadow-sm">
                         <span><span className="font-bold text-primary">{rx.medicine}</span> — {rx.dosage} for {rx.duration}</span>
                         <button onClick={() => removePrescription(idx)} className="text-gray-400 hover:text-red-500 font-bold text-lg leading-none">&times;</button>
                       </li>
                     ))}
                   </ul>
                 )}
              </div>

              <div className="form-group">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1 block mb-1.5">Follow Up Date (Optional)</label>
                <input type="date" value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} className="w-full md:w-1/2 p-4 rounded-xl border border-gray-200 focus:border-primary outline-none bg-gray-50 focus:bg-white" />
              </div>

            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={submitConsultation}
                disabled={!formData.diagnosis || saving}
                className="px-8 py-3 rounded-xl font-bold btn-primary min-w-[140px] flex justify-center disabled:opacity-50"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Record'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
