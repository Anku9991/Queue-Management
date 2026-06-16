import { useState, useEffect } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Clock, CheckCircle, SkipForward, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, colorClass, gradient }: any) => (
  <div className={`relative overflow-hidden bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:scale-[1.02]`}>
    <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none ${gradient}`}></div>
    <div className={`p-4 rounded-2xl shadow-inner relative z-10 ${colorClass}`}>
      <Icon className="h-8 w-8 text-white" />
    </div>
    <div className="ml-6 relative z-10">
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-4xl font-black text-slate-900 tracking-tight mt-1">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { tokens, settings, updateSettings } = useQueueStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Settings State
  const [localSettings, setLocalSettings] = useState(settings);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', email: '' });

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const today = new Date().toDateString();
  const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);
  const completedCount = todayTokens.filter(t => t.status === 'completed').length;
  const waitingCount = todayTokens.filter(t => t.status === 'waiting').length;
  const skippedCount = todayTokens.filter(t => t.status === 'skipped').length;
  const totalCount = todayTokens.length;

  const chartData = [
    { time: '09:00', patients: 12 },
    { time: '10:00', patients: 25 },
    { time: '11:00', patients: 38 },
    { time: '12:00', patients: 45 },
    { time: '13:00', patients: 30 },
    { time: '14:00', patients: 20 },
    { time: '15:00', patients: 42 },
  ];

  const handleExportCSV = () => {
    const headers = ['Token ID', 'Patient Name', 'Mobile', 'Status', 'Priority', 'Generated At'];
    const rows = tokens.map(t => [
      t.tokenId,
      t.patientName,
      t.mobile,
      t.status,
      t.priority,
      format(t.timestamp, 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `queue_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Admin Analytics</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportCSV} className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
            Export CSV
          </button>
          <button onClick={handlePrint} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
            Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={totalCount} icon={Users} colorClass="bg-blue-600" gradient="bg-blue-500" />
        <StatCard title="Waiting" value={waitingCount} icon={Clock} colorClass="bg-amber-500" gradient="bg-amber-400" />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle} colorClass="bg-emerald-500" gradient="bg-emerald-400" />
        <StatCard title="Skipped/Cancel" value={skippedCount} icon={SkipForward} colorClass="bg-slate-700" gradient="bg-slate-500" />
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden print:hidden">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Peak Hours
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              System Settings
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'staff'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Staff Directory
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="h-80">
              <h3 className="text-lg font-medium text-slate-900 mb-6">Patient Flow Today</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="patients" stroke="#22c55e" fill="#dcfce7" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium text-slate-900">Hospital Details</h3>
                <p className="mt-1 text-sm text-slate-500">Update your hospital branding and settings.</p>
              </div>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-slate-700">Hospital Name</label>
                  <input 
                    type="text" 
                    value={localSettings.hospitalName} 
                    onChange={e => setLocalSettings({...localSettings, hospitalName: e.target.value})}
                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Token Prefix</label>
                  <input 
                    type="text" 
                    value={localSettings.prefix} 
                    onChange={e => setLocalSettings({...localSettings, prefix: e.target.value})}
                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Reset Time</label>
                  <input 
                    type="time" 
                    value={localSettings.resetTime} 
                    onChange={e => setLocalSettings({...localSettings, resetTime: e.target.value})}
                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-slate-700">Active Counters (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={localSettings.counters?.join(', ') || ''} 
                    onChange={e => setLocalSettings({...localSettings, counters: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                  />
                  <p className="mt-1 text-xs text-slate-500">Example: Counter 1, Counter 2, Reception</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveSettings} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 shadow-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-slate-900">Staff Management</h3>
                <p className="mt-1 text-sm text-slate-500">Manage hospital staff records and roles.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Staff Name"
                  value={newStaff.name}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Doctor, Receptionist)"
                  value={newStaff.role}
                  onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newStaff.email}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    if (!newStaff.name) return;
                    const updatedStaff = [...(localSettings.staffList || []), { ...newStaff, id: Date.now().toString() }];
                    setLocalSettings({...localSettings, staffList: updatedStaff});
                    setNewStaff({ name: '', role: '', email: '' });
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Staff
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {(localSettings.staffList || []).map((staff: any) => (
                      <tr key={staff.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{staff.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{staff.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{staff.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              const updatedStaff = localSettings.staffList.filter((s: any) => s.id !== staff.id);
                              setLocalSettings({...localSettings, staffList: updatedStaff});
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!localSettings.staffList || localSettings.staffList.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No staff members added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={handleSaveSettings} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-sm transition-colors">
                  Save Directory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
