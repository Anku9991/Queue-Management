import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { Hospital, Building, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [hospitalName, setHospitalName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const fetchHospitals = async () => {
    try {
      if (!db) throw new Error("Firebase not initialized");
      const q = query(collection(db, 'hospitals'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setHospitals(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load hospitals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create Hospital Document
      const hospitalId = 'H' + Math.random().toString().substring(2, 8).toUpperCase();
      const newHospital = {
        hospitalName,
        prefix: prefix.toUpperCase(),
        subscriptionPlan: 'enterprise',
        status: 'active',
        createdAt: Date.now(),
        counters: ['Counter 1'],
        departments: ['General'],
        logo: 'https://cdn-icons-png.flaticon.com/512/4320/4320337.png'
      };

      if (!db) throw new Error("Firebase not initialized");
      await setDoc(doc(db, 'hospitals', hospitalId), newHospital);

      // 2. Assign Admin User Role in Users Collection
      // Note: We're doing this by email. When the user logs in, the Layout component will pick this up if they match email.
      // Alternatively, we create a user document where ID = email (for easy lookup).
      if (adminEmail && db) {
        await setDoc(doc(db, 'users', adminEmail.toLowerCase()), {
          email: adminEmail.toLowerCase(),
          role: 'hospital_admin',
          hospitalId: hospitalId
        });
      }

      toast.success('Hospital & Admin Created Successfully!');
      setHospitalName('');
      setPrefix('');
      setAdminEmail('');
      fetchHospitals();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create hospital.');
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;
    try {
      if (!db) throw new Error("Firebase not initialized");
      await deleteDoc(doc(db, 'hospitals', id));
      toast.success('Hospital Deleted');
      fetchHospitals();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete hospital.');
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500 font-medium">Loading Hospitals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-900 to-primary-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Super Admin Platform</h1>
          <p className="text-indigo-200 font-medium">Manage multi-tenant hospitals, subscriptions, and system administrators.</p>
        </div>
        <Shield className="w-16 h-16 text-indigo-300 opacity-50 relative z-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Hospital className="w-5 h-5 mr-2 text-primary-600" /> Onboard New Hospital
            </h3>
            <form onSubmit={handleAddHospital} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full border-slate-200 bg-slate-50 rounded-xl font-medium focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Apollo Hospitals"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Token Prefix</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={prefix}
                  onChange={e => setPrefix(e.target.value)}
                  className="w-full border-slate-200 bg-slate-50 rounded-xl font-medium focus:ring-primary-500 focus:border-primary-500 uppercase"
                  placeholder="e.g. APO"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Admin Email (Google Login)</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  className="w-full border-slate-200 bg-slate-50 rounded-xl font-medium focus:ring-primary-500 focus:border-primary-500"
                  placeholder="admin@apollo.com"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary-500/30 transition-transform active:scale-95"
              >
                Create Hospital Workspace
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-600" /> Active Hospitals
              </h3>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">{hospitals.length} Total</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {hospitals.map(h => (
                <div key={h.id} className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center">
                    <img src={h.logo || 'https://cdn-icons-png.flaticon.com/512/4320/4320337.png'} alt="logo" className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 mr-4" />
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">{h.hospitalName}</h4>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">ID: {h.id} • Prefix: {h.prefix}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1 ${h.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {h.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium uppercase">{h.subscriptionPlan}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteHospital(h.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Hospital"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {hospitals.length === 0 && (
                <div className="p-12 text-center text-slate-400 font-medium">
                  No hospitals configured yet. Create one to get started.
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
