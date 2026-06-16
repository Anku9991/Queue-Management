import { useState } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { Play, SkipForward, CheckCircle, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { QueueStatus, PriorityLevel } from '../types';

const StaffDashboard = () => {
  const { tokens, callNext, updateStatus, updatePriority } = useQueueStore();
  const [activeCounter, setActiveCounter] = useState('Counter 1');

  const handleCallNext = async () => {
    const nextToken = await callNext(activeCounter);
    if (!nextToken) {
      alert('No more patients waiting in the queue!');
    }
  };

  const getStatusBadge = (status: QueueStatus) => {
    const styles = {
      'waiting': 'bg-yellow-100 text-yellow-800',
      'in-process': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'skipped': 'bg-slate-100 text-slate-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}>{status.replace('-', ' ')}</span>;
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    if (priority === 'normal') return null;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ml-2">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {priority}
      </span>
    );
  };

  const currentToken = tokens.find(t => t.status === 'in-process' && t.servedBy === activeCounter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select 
            value={activeCounter}
            onChange={(e) => setActiveCounter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg border shadow-sm"
          >
            <option>Counter 1</option>
            <option>Counter 2</option>
            <option>Counter 3</option>
          </select>
          <button
            onClick={handleCallNext}
            disabled={!!currentToken}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="mr-2 h-4 w-4" /> Call Next
          </button>
        </div>
      </div>

      {currentToken && (
        <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden">
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-primary-900">Currently Serving</h2>
            <span className="text-2xl font-black text-primary-600">{currentToken.tokenId}</span>
          </div>
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xl font-bold text-slate-900">{currentToken.patientName}</p>
              <p className="text-sm text-slate-500 mt-1">{currentToken.mobile} • {currentToken.purpose}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => updateStatus(currentToken.tokenId, 'completed')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Complete
              </button>
              <button
                onClick={() => updateStatus(currentToken.tokenId, 'skipped')}
                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
              >
                <SkipForward className="mr-2 h-4 w-4" /> Skip
              </button>
            </div>
          </div>
        </div>
      )}

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
                          onClick={() => updateStatus(token.tokenId, 'waiting')}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                          title="Recall to Queue"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {token.status === 'waiting' && (
                        <button
                          onClick={() => updateStatus(token.tokenId, 'cancelled')}
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
