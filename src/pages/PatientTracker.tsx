import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueStore } from '../store/useQueueStore';
import { Clock, Users, ArrowLeft, CheckCircle, Volume2, Activity } from 'lucide-react';
import { format } from 'date-fns';

const PatientTracker = () => {
  const { hospitalId, tokenId } = useParams<{ hospitalId: string, tokenId: string }>();
  const { tokens, hospital, initListeners } = useQueueStore();
  const [isActivated, setIsActivated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedServing = useRef(false);

  useEffect(() => {
    if (hospitalId) {
      initListeners(hospitalId);
    }
  }, [hospitalId, initListeners]);

  const handleActivation = () => {
    // 1. Request Notification Permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    // 2. Initialize Audio Context by playing a silent or actual sound on tap
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0; // Silent play just to unlock context
    audio.play().then(() => {
      audio.pause();
      audio.volume = 1; // Reset volume for later
      audioRef.current = audio;
    }).catch(console.error);

    // 3. Vibrate briefly to confirm activation
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    setIsActivated(true);
  };

  const today = new Date().toDateString();
  const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);
  const token = todayTokens.find(t => t.tokenId === tokenId);

  // Trigger Notifications when token turns to serving
  useEffect(() => {
    if (token && token.status === 'serving' && !notifiedServing.current && isActivated) {
      notifiedServing.current = true;
      
      // 1. Play Audio (Now unlocked because of user interaction)
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
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
  }, [token, hospital, isActivated]);

  if (!hospital) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Token Not Found</h2>
          <Link to={`/register/${hospitalId}`} className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Link>
        </div>
      </div>
    );
  }

  // Pre-activation screen
  if (!isActivated && token.status !== 'completed' && token.status !== 'cancelled') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] text-center max-w-sm w-full relative z-10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Volume2 className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Enable Live Alerts</h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            Please tap the button below to allow this screen to play a sound and vibrate your phone when it's your turn.
          </p>
          <button 
            onClick={handleActivation}
            className="w-full bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform active:scale-95"
          >
            Activate Live Tracking
          </button>
        </motion.div>
      </div>
    );
  }

  const peopleAhead = token.status === 'waiting' 
    ? todayTokens.filter(t => t.status === 'waiting' && t.department === token.department && t.timestamp < token.timestamp).length 
    : 0;

  const estimatedWaitTime = token.estimatedWaitTimeMins || (peopleAhead * 5); 

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Premium Background Elements */}
      <div className="fixed top-0 inset-x-0 h-64 bg-gradient-to-b from-primary-600 to-primary-900 rounded-b-[4rem] shadow-xl z-0 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 mt-6">
        
        <div className="text-center mb-6 text-white">
          <h1 className="text-xl font-bold tracking-tight">{hospital.hospitalName?.trim() ? hospital.hospitalName : 'Our Premium Clinic'}</h1>
          <p className="text-primary-200 text-sm font-medium flex items-center justify-center mt-1">
            <Activity className="w-4 h-4 mr-1 animate-pulse" /> Live Tracking Active
          </p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-white relative overflow-hidden border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Your Token</h2>
            <motion.div 
              key={token.tokenId}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-7xl font-black text-slate-900 tracking-tighter drop-shadow-sm"
            >
              {token.tokenId}
            </motion.div>
            <p className="mt-4 text-xl font-bold text-slate-800">{token.patientName}</p>
            {token.department && <p className="mt-2 inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">{token.department}</p>}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {token.status === 'serving' ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-8 text-center shadow-[0_10px_30px_rgba(52,211,153,0.4)] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-1000"></div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 shadow-inner"
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-black text-white mb-2">It's Your Turn!</h3>
                  <p className="text-emerald-50 font-medium text-lg leading-relaxed">
                    Please proceed immediately to<br/>
                    <span className="text-2xl font-black text-white bg-black/10 px-4 py-2 rounded-xl mt-3 inline-block border border-white/20 backdrop-blur-sm shadow-sm">{token.servedBy || 'Counter'}</span>
                  </p>
                </motion.div>
              ) : token.status === 'completed' ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center"
                >
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Consultation Completed</h3>
                  <p className="text-slate-500 font-medium">Thank you for visiting {hospital.hospitalName}. Wishing you good health!</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4 border border-indigo-100">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">People Ahead</p>
                        <p className="text-2xl font-black text-slate-900">{peopleAhead}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mr-4 border border-orange-100">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Wait</p>
                        <p className="text-2xl font-black text-slate-900">~{estimatedWaitTime} <span className="text-base font-bold text-slate-500">mins</span></p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Generated {format(token.timestamp, 'hh:mm a')}</span>
              <span className={token.status === 'serving' ? 'text-emerald-500 font-black' : 'text-primary-500'}>
                {token.status}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientTracker;
