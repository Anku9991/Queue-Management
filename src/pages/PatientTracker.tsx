import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueStore } from '../store/useQueueStore';
import { Clock, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const PatientTracker = () => {
  const { id } = useParams(); // this is the tokenId
  const { tokens, settings } = useQueueStore();
  const [peopleAhead, setPeopleAhead] = useState(0);

  const token = tokens.find(t => t.tokenId === id);

  useEffect(() => {
    if (token && token.status === 'waiting') {
      const ahead = tokens.filter(t => t.status === 'waiting' && t.timestamp < token.timestamp).length;
      setPeopleAhead(ahead);
    } else {
      setPeopleAhead(0);
    }
  }, [tokens, token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Token Not Found</h2>
          <Link to="/" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Link>
        </div>
      </div>
    );
  }

  const estimatedWaitTime = peopleAhead * 5; // assume 5 mins per patient

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        >
          <div className="bg-primary-600 px-6 py-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
            
            <h2 className="text-sm font-medium uppercase tracking-wider opacity-80">Your Token Number</h2>
            <motion.div 
              key={token.tokenId}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mt-4 text-6xl font-extrabold tracking-tight"
            >
              {token.tokenId}
            </motion.div>
            <p className="mt-4 text-lg font-medium">{token.patientName}</p>
          </div>

          <div className="px-6 py-8 space-y-6">
            <AnimatePresence mode="wait">
              {token.status === 'in-process' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center"
                >
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900">It's Your Turn!</h3>
                  <p className="text-green-700 mt-2">Please proceed to {token.servedBy || 'the Doctor'}.</p>
                </motion.div>
              ) : token.status === 'completed' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-slate-900">Consultation Completed</h3>
                  <p className="text-slate-600 mt-2">Thank you for visiting {settings.hospitalName}.</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center">
                      <Users className="h-6 w-6 text-primary-500 mr-3" />
                      <div>
                        <p className="text-sm text-slate-500 font-medium">People Ahead</p>
                        <p className="text-2xl font-bold text-slate-900">{peopleAhead}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Estimated Wait</p>
                        <p className="text-2xl font-bold text-slate-900">~{estimatedWaitTime} mins</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6 border-t border-slate-100 flex justify-between text-sm text-slate-500">
              <span>Generated at {format(token.timestamp, 'hh:mm a')}</span>
              <span className="capitalize font-medium">Status: {token.status.replace('-', ' ')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientTracker;
