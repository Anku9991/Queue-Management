import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueStore } from '../store/useQueueStore';
import { Clock, Users, ArrowLeft, CheckCircle, BellRing } from 'lucide-react';
import { format } from 'date-fns';

const PatientTracker = () => {
  const { hospitalId, tokenId } = useParams<{ hospitalId: string, tokenId: string }>();
  const { tokens, hospital, initListeners } = useQueueStore();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedServing = useRef(false);

  useEffect(() => {
    if (hospitalId) {
      initListeners(hospitalId);
    }
    // Initialize Audio context early (needs user interaction ideally, but we can try)
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, [hospitalId, initListeners]);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') setPermissionGranted(true);
      });
    }
  };

  const today = new Date().toDateString();
  const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);
  const token = todayTokens.find(t => t.tokenId === tokenId);

  // Trigger Notifications when token turns to serving
  useEffect(() => {
    if (token && token.status === 'serving' && !notifiedServing.current) {
      notifiedServing.current = true;
      
      // 1. Play Audio
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // 2. Vibrate (Mobile)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
      
      // 3. Web Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("It's Your Turn!", {
          body: `Token ${token.tokenId}. Please proceed to ${token.servedBy || 'Counter'}.`,
          icon: hospital?.logo || '/logo.png'
        });
      }
    }
  }, [token, hospital]);

  if (!hospital) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Token Not Found</h2>
          <Link to={`/register/${hospitalId}`} className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Link>
        </div>
      </div>
    );
  }

  const peopleAhead = token.status === 'waiting' 
    ? todayTokens.filter(t => t.status === 'waiting' && t.department === token.department && t.timestamp < token.timestamp).length 
    : 0;

  const estimatedWaitTime = token.estimatedWaitTimeMins || (peopleAhead * 5); 

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
        {/* Ask for notification permission banner if waiting */}
        {!permissionGranted && 'Notification' in window && token.status === 'waiting' && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center text-blue-800 text-sm">
              <BellRing className="w-5 h-5 mr-3 text-blue-600" />
              Enable alerts so you don't miss your turn!
            </div>
            <button 
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Enable
            </button>
          </motion.div>
        )}

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
            {token.department && <p className="mt-1 text-sm text-blue-200">Dept: {token.department}</p>}
          </div>

          <div className="px-6 py-8 space-y-6">
            <AnimatePresence mode="wait">
              {token.status === 'serving' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse"
                >
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-900">It's Your Turn!</h3>
                  <p className="text-green-800 mt-2 font-medium text-lg">Please proceed to <b>{token.servedBy || 'Counter'}</b>.</p>
                </motion.div>
              ) : token.status === 'completed' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-slate-900">Consultation Completed</h3>
                  <p className="text-slate-600 mt-2">Thank you for visiting {hospital.hospitalName}.</p>
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
