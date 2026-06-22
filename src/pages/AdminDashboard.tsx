import { useState } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { Users, Settings, Building2, Plus, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { hospital, activeHospitalId, updateHospital } = useQueueStore();
  
  const [newCounter, setNewCounter] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  // If we are using the mock hospital, updates are local only, 
  // but if we have firebase configured we do real updates.

  const handleAddCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !newCounter.trim() || !activeHospitalId) return;

    try {
      setLoading(true);
      const counters = [...(hospital.counters || []), newCounter.trim()];
      await updateHospital(activeHospitalId, { counters });
      toast.success('Counter Added Successfully');
      setNewCounter('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to add counter');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCounter = async (counter: string) => {
    if (!hospital || !activeHospitalId) return;
    try {
      setLoading(true);
      const counters = hospital.counters?.filter(c => c !== counter) || [];
      await updateHospital(activeHospitalId, { counters });
      toast.success('Counter Removed');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to remove counter');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !newDepartment.trim() || !activeHospitalId) return;

    try {
      setLoading(true);
      const departments = [...(hospital.departments || []), newDepartment.trim()];
      await updateHospital(activeHospitalId, { departments });
      toast.success('Department Added Successfully');
      setNewDepartment('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDepartment = async (dept: string) => {
    if (!hospital || !activeHospitalId) return;
    try {
      setLoading(true);
      const departments = hospital.departments?.filter(d => d !== dept) || [];
      await updateHospital(activeHospitalId, { departments });
      toast.success('Department Removed');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to remove department');
    } finally {
      setLoading(false);
    }
  };

  if (!hospital) return <div className="text-center py-12 text-slate-500 font-medium">Loading Hospital Settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 mr-5">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{hospital.hospitalName}</h1>
            <p className="text-slate-500 font-medium mt-1">Admin Configuration Panel</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mr-2" />
          <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Status: {hospital.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Departments Setup */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Users className="mr-2 h-5 w-5 text-indigo-500" />
              Departments
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddDepartment} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="e.g. Cardiology"
                className="flex-1 bg-slate-50 border-slate-200 rounded-xl font-medium focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <ul className="space-y-3">
              {hospital.departments?.map((dept, idx) => (
                <li key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                  <span className="font-bold text-slate-700">{dept}</span>
                  <button 
                    onClick={() => handleRemoveDepartment(dept)}
                    className="text-slate-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
              {(!hospital.departments || hospital.departments.length === 0) && (
                <li className="text-slate-500 text-sm text-center py-4">No departments configured</li>
              )}
            </ul>
          </div>
        </div>

        {/* Counters Setup */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary-500" />
              Service Counters
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddCounter} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCounter}
                onChange={(e) => setNewCounter(e.target.value)}
                placeholder="e.g. Counter 1, Room 102"
                className="flex-1 bg-slate-50 border-slate-200 rounded-xl font-medium focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <ul className="space-y-3">
              {hospital.counters?.map((counter, idx) => (
                <li key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                  <span className="font-bold text-slate-700">{counter}</span>
                  <button 
                    onClick={() => handleRemoveCounter(counter)}
                    className="text-slate-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
              {(!hospital.counters || hospital.counters.length === 0) && (
                <li className="text-slate-500 text-sm text-center py-4">No counters configured</li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
