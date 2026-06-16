import { useState } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Clock, CheckCircle, SkipForward } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { tokens, settings, updateSettings } = useQueueStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Settings State
  const [localSettings, setLocalSettings] = useState(settings);

  const todayTokens = tokens;
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

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div className="ml-5">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );

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
        <StatCard title="Total Patients" value={totalCount} icon={Users} colorClass="bg-blue-500" />
        <StatCard title="Waiting" value={waitingCount} icon={Clock} colorClass="bg-yellow-500" />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle} colorClass="bg-green-500" />
        <StatCard title="Skipped/Cancelled" value={skippedCount} icon={SkipForward} colorClass="bg-slate-500" />
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
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveSettings} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 shadow-sm transition-colors">
                  Save Changes
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
