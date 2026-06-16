import { useState } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { Play, SkipForward, CheckCircle, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { QueueStatus, PriorityLevel } from '../types';

import { motion, AnimatePresence } from 'framer-motion';

const StaffDashboard = () => {
  const { tokens, callNext, updateStatus, updatePriority } = useQueueStore();
  const [activeCounter, setActiveCounter] = useState('Counter 1');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCallNext = async () => {
    try {
      setErrorMsg(null);
      const nextToken = await callNext(activeCounter);
      if (!nextToken) {
        alert('No more patients waiting in the queue!');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to call next patient. Check permissions.');
    }
  };

  const handleStatusUpdate = async (tokenId: string, status: QueueStatus) => {
    try {
      setErrorMsg(null);
      await updateStatus(tokenId, status);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update status.');
    }
  };

  const getStatusBadge = (status: QueueStatus) => {
    const styles = {
      'waiting': 'bg-amber-100 text-amber-800 border-amber-200',
      'in-process': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'skipped': 'bg-slate-100 text-slate-800 border-slate-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status]}`}>{status.replace('-', ' ')}</span>;
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

  const currentToken = tokens.find(t => t.status === 'in-process' && t.servedBy === activeCounter);

  return (
    <div className="space-y-6">
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">Error: {errorMsg}</p>
            </div>
          </div>
        </motion.div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Area</h1>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={activeCounter}
            onChange={(e) => setActiveCounter(e.target.value)}
            className="block w-full pl-4 pr-10 py-2.5 text-sm font-medium border-none focus:ring-0 text-slate-700 bg-transparent cursor-pointer"
          >
            <option>Counter 1</option>
            <option>Counter 2</option>
            <option>Counter 3</option>
          </select>
          <button
            onClick={handleCallNext}
            disabled={!!currentToken}
            className="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play className="mr-2 h-4 w-4 fill-current" /> Call Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {currentToken && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 rounded-3xl shadow-xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="px-8 py-6 flex justify-between items-center border-b border-white/10">
              <h2 className="text-sm font-bold text-primary-200 uppercase tracking-widest">Currently Serving</h2>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold border border-white/20 backdrop-blur-sm">
                {activeCounter}
              </span>
            </div>
            <div className="p-8 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
              <div>
                <div className="text-6xl font-black text-white tracking-tighter mb-2">{currentToken.tokenId}</div>
                <p className="text-2xl font-bold text-primary-100">{currentToken.patientName}</p>
                <p className="text-sm text-primary-300 mt-1 font-medium">{currentToken.mobile} • {currentToken.purpose}</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => handleStatusUpdate(currentToken.tokenId, 'completed')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-lg text-sm font-bold rounded-xl text-emerald-900 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                >
                  <CheckCircle className="mr-2 h-5 w-5" /> Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate(currentToken.tokenId, 'skipped')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-white/20 shadow-lg text-sm font-bold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                >
                  <SkipForward className="mr-2 h-5 w-5" /> Skip
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Today's Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tokens.slice().reverse().map((token) => (
                <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900">{token.tokenId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 flex items-center">
                      {token.patientName}
                      {getPriorityBadge(token.priority)}
                    </div>
                    <div className="text-sm text-slate-500">{token.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {format(token.timestamp, 'hh:mm a')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(token.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {token.status === 'skipped' && (
                        <button
                          onClick={() => handleStatusUpdate(token.tokenId, 'waiting')}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                          title="Recall to Queue"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {token.status === 'waiting' && (
                        <button
                          onClick={() => handleStatusUpdate(token.tokenId, 'cancelled')}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          title="Cancel Token"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <select
                        value={token.priority}
                        onChange={(e) => updatePriority(token.tokenId, e.target.value as PriorityLevel)}
                        className="text-xs border-slate-300 rounded ml-2 focus:ring-primary-500 focus:border-primary-500 border"
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
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No patients in the queue today.
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
