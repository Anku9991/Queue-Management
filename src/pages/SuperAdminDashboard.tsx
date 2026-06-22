import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Building, Plus, Users, LayoutDashboard } from 'lucide-react';
import type { Hospital } from '../types';

const SuperAdminDashboard = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHospital, setNewHospital] = useState({
    hospitalName: '',
    prefix: '',
    adminEmail: ''
  });

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      if (!db) return;
      const querySnapshot = await getDocs(collection(db, 'hospitals'));
      const hList: Hospital[] = [];
      querySnapshot.forEach((docSnap) => {
        hList.push({ id: docSnap.id, ...docSnap.data() } as Hospital);
      });
      setHospitals(hList);
    } catch (e) {
      console.error("Error fetching hospitals", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospital.hospitalName || !newHospital.prefix || !db) return;
    
    try {
      // 1. Create Hospital Document
      const hospitalData: Partial<Hospital> = {
        hospitalName: newHospital.hospitalName,
        prefix: newHospital.prefix.toUpperCase(),
        resetTime: '00:00',
        departments: ['General OPD'],
        counters: ['Counter 1', 'Counter 2'],
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'hospitals'), hospitalData);
      
      // We cannot create Auth users directly from client easily without Firebase Admin SDK
      // For now, we will instruct the super admin to have the hospital admin sign up
      // and then super admin can assign the role manually, or we handle it via Cloud Functions.
      
      alert(`Hospital Created! ID: ${docRef.id}. The assigned admin can now sign up and you can assign them the hospital_admin role for this ID.`);
      setIsAdding(false);
      setNewHospital({ hospitalName: '', prefix: '', adminEmail: '' });
      fetchHospitals();
    } catch (e: any) {
      alert("Failed to create hospital: " + e.message);
    }
  };

  if (loading) return <div className="text-center py-12">Loading SaaS Platform...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <LayoutDashboard className="mr-3 h-8 w-8 text-primary-600" />
          PihNexa Global Administration
        </h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5 mr-1" /> Register Hospital
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Onboard New Hospital</h2>
          <form onSubmit={handleAddHospital} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Hospital/Clinic Name</label>
                <input 
                  type="text" required
                  value={newHospital.hospitalName}
                  onChange={e => setNewHospital({...newHospital, hospitalName: e.target.value})}
                  className="mt-1 block w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Token Prefix (e.g., MED, APOLLO)</label>
                <input 
                  type="text" required
                  value={newHospital.prefix}
                  onChange={e => setNewHospital({...newHospital, prefix: e.target.value})}
                  className="mt-1 block w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Onboard Tenant</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-primary-100 rounded-xl mr-4">
            <Building className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Tenants</p>
            <p className="text-3xl font-black text-slate-900">{hospitals.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-emerald-100 rounded-xl mr-4">
            <Users className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Active Users</p>
            <p className="text-3xl font-black text-slate-900">N/A</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Tenant Directory</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Hospital ID / Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Prefix</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Departments</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {hospitals.map(h => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{h.hospitalName}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">{h.id}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-bold">{h.prefix}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{h.departments?.length || 0} Depts</td>
                <td className="px-6 py-4 text-right">
                  <a href={`/register/${h.id}`} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm font-medium mr-4">
                    View Portal
                  </a>
                  <button className="text-slate-400 hover:text-slate-600">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
