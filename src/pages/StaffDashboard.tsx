import { useState, useEffect } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { Play, SkipForward, CheckCircle, XCircle, RotateCcw, AlertTriangle, Building, PauseCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { QueueStatus, PriorityLevel } from '../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const StaffDashboard = () => {
  const { tokens, hospital, callNext, updateStatus, updatePriority } = useQueueStore();
  const [activeCounter, setActiveCounter] = useState(hospital?.counters?.[0] || 'Counter 1');
  const [activeDepartment, setActiveDepartment] = useState(hospital?.departments?.[0] || '');

  useEffect(() => {
    if (hospital?.counters && !hospital.counters.includes(activeCounter)) {
      setActiveCounter(hospital.counters[0] || 'Counter 1');
    }
    if (hospital?.departments && !hospital.departments.includes(activeDepartment)) {
      setActiveDepartment(hospital.departments[0] || '');
    }
  }, [hospital, activeCounter, activeDepartment]);

  const handleCallNext = async () => {
    try {
      const nextToken = await callNext(activeCounter, activeDepartment);
      if (!nextToken) {
        toast('No more patients waiting in the queue!', { icon: '🙌' });
      } else {
        toast.success(`Calling Token ${nextToken.tokenId}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to call next patient. Check permissions.');
    }
  };

  const handleStatusUpdate = async (id: string, status: QueueStatus) => {
    try {
      await updateStatus(id, status);
      if (status === 'completed') toast.success('Consultation Completed');
      if (status === 'hold') toast('Patient put on hold', { icon: '⏸️' });
      if (status === 'waiting') toast.success('Recalled to Queue');
      if (status === 'serving') toast.success('Now Serving Patient');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const handlePriorityUpdate = async (id: string, priority: PriorityLevel) => {
    try {
      await updatePriority(id, priority);
      toast.success('Priority updated');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update priority.');
    }
  };

  const getStatusBadge = (status: QueueStatus) => {
    const styles = {
      'waiting': 'bg-amber-100 text-amber-800 border-amber-200',
      'serving': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'skipped': 'bg-slate-100 text-slate-800 border-slate-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'hold': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    const styleClass = styles[status] || styles['serving'];
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styleClass}`}>{status.replace('-', ' ')}</span>;
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    if (priority === 'normal') return null;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 ml-2 uppercase tracking-wide">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {priority}
      </span>
    );
  };

  const today = new Date().toDateString();
  const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);

  const currentToken = todayTokens.find(t => t.status === 'serving' && t.servedBy === activeCounter && t.department === activeDepartment);
  const holdTokens = todayTokens.filter(t => t.status === 'hold' && (!activeDepartment || t.department === activeDepartment));

  if (!hospital) {
    return <div className="text-center py-12 text-slate-500 font-medium">Loading Hospital Context...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Workspace</h1>
          <div className="flex space-x-3 mt-3">
            <a href={`/tv/${hospital.id || 'H001'}`} target="_blank" rel="noreferrer" className="text-xs font-bold bg-primary-100 text-primary-700 px-4 py-2 rounded-xl hover:bg-primary-200 flex items-center transition-all shadow-sm border border-primary-200">
              <Play className="w-3 h-3 mr-1.5" /> Open TV Display
            </a>
            <a href={`/poster/${hospital.id || 'H001'}`} target="_blank" rel="noreferrer" className="text-xs font-bold bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-200 flex items-center transition-all shadow-sm border border-emerald-200">
              <Building className="w-3 h-3 mr-1.5" /> Open QR Poster
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-md p-2.5 rounded-2xl shadow-sm border border-slate-200/60">
          
          {hospital.departments && hospital.departments.length > 0 && (
            <div className="flex items-center pl-2">
              <Building className="w-4 h-4 text-slate-400 mr-1" />
              <select 
                value={activeDepartment}
                onChange={(e) => setActiveDepartment(e.target.value)}
                className="block pl-2 pr-8 py-2 text-sm font-semibold border-none focus:ring-0 text-slate-700 bg-transparent cursor-pointer"
              >
                {hospital.departments.map((dept: string) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}

          <div className="h-6 border-l border-slate-200 hidden sm:block"></div>

          <select 
            value={activeCounter}
            onChange={(e) => setActiveCounter(e.target.value)}
            className="block pl-4 pr-10 py-2.5 text-sm font-semibold border-none focus:ring-0 text-slate-700 bg-transparent cursor-pointer"
          >
            {hospital.counters?.map((counter: string) => (
              <option key={counter} value={counter}>{counter}</option>
            ))}
          </select>
          <button
            onClick={handleCallNext}
            disabled={!!currentToken}
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg shadow-primary-500/30 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            <Play className="mr-2 h-4 w-4 fill-current" /> Call Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {currentToken && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] shadow-2xl overflow-hidden relative border border-slate-700/50"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-500 opacity-20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="px-8 py-5 flex justify-between items-center border-b border-white/10 bg-white/5 backdrop-blur-sm">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                Currently Serving
              </h2>
              <div className="flex gap-2">
                {currentToken.department && (
                  <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold border border-white/10 backdrop-blur-md">
                    {currentToken.department}
                  </span>
                )}
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold border border-white/10 backdrop-blur-md">
                  {activeCounter}
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
              <div className="text-center sm:text-left">
                <div className="text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">{currentToken.tokenId}</div>
                <p className="text-2xl font-bold text-slate-200">{currentToken.patientName}</p>
                <p className="text-sm text-slate-400 mt-2 font-medium bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/10">
                  {currentToken.mobile} • {currentToken.purpose}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <button
                  onClick={() => handleStatusUpdate(currentToken.id as string, 'completed')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-transparent shadow-lg shadow-emerald-500/20 text-sm font-black rounded-2xl text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-all transform active:scale-95"
                >
                  <CheckCircle className="mr-2 h-5 w-5" /> Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate(currentToken.id as string, 'hold')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-white/20 shadow-lg text-sm font-bold rounded-2xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all transform active:scale-95"
                >
                  <PauseCircle className="mr-2 h-5 w-5" /> Hold
                </button>
                <button
                  onClick={() => handleStatusUpdate(currentToken.id as string, 'skipped')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-rose-500/30 shadow-lg text-sm font-bold rounded-2xl text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 backdrop-blur-md transition-all transform active:scale-95"
                >
                  <SkipForward className="mr-2 h-5 w-5" /> Skip
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {holdTokens.length > 0 && (
        <div className="bg-purple-50 shadow-sm rounded-2xl border border-purple-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-purple-100 bg-purple-100/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center">
              <PauseCircle className="w-4 h-4 mr-2" /> Patients On Hold ({holdTokens.length})
            </h3>
          </div>
          <div className="p-4 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {holdTokens.map(token => (
              <div key={token.id} className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-black text-purple-900 text-lg">{token.tokenId}</div>
                  <div className="text-sm font-medium text-slate-700">{token.patientName}</div>
                </div>
                <button
                  onClick={() => handleStatusUpdate(token.id as string, 'waiting')}
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  Recall
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Today's Queue <span className="text-slate-400 font-medium">({activeDepartment || 'All'})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-white">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Token</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {todayTokens
                .filter(t => !activeDepartment || t.department === activeDepartment)
                .slice().reverse().map((token) => (
                <tr key={token.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-black text-slate-900">{token.tokenId}</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900 flex items-center">
                      {token.patientName}
                      {getPriorityBadge(token.priority)}
                    </div>
                    <div className="text-sm text-slate-500 font-medium mt-0.5">{token.mobile}</div>
                    {token.department && <div className="text-xs text-slate-400 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-md">{token.department}</div>}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                    {format(token.timestamp, 'hh:mm a')}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    {getStatusBadge(token.status)}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {token.status === 'waiting' && (
                        <button
                          onClick={() => handleStatusUpdate(token.id as string, 'serving')}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                          title="Serve Now"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {(token.status === 'skipped' || token.status === 'hold') && (
                        <button
                          onClick={() => handleStatusUpdate(token.id as string, 'waiting')}
                          className="text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 p-2 rounded-lg transition-colors"
                          title="Recall to Queue"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {token.status === 'waiting' && (
                        <button
                          onClick={() => handleStatusUpdate(token.id as string, 'cancelled')}
                          className="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors"
                          title="Cancel Token"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <select
                        value={token.priority}
                        onChange={(e) => handlePriorityUpdate(token.id as string, e.target.value as PriorityLevel)}
                        className="text-xs font-semibold text-slate-600 bg-slate-50 border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 border py-1.5 px-2"
                      >
                        <option value="normal">Normal</option>
                        <option value="senior">Senior</option>
                        <option value="emergency">Emergency</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {todayTokens.filter(t => !activeDepartment || t.department === activeDepartment).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium">
                    No patients in the queue for this department today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
