import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueueStore } from '../store/useQueueStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Clock, VolumeX } from 'lucide-react';
import { format } from 'date-fns';

const TVDisplay = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { tokens, hospital, initListeners } = useQueueStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (hospitalId) {
      initListeners(hospitalId);
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [hospitalId, initListeners]);

  const today = new Date().toDateString();
  const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);

  const servingTokens = todayTokens.filter(t => t.status === 'serving').sort((a, b) => (b.servedAt || 0) - (a.servedAt || 0));
  const waitingTokens = todayTokens.filter(t => t.status === 'waiting').slice(0, 8); // Show next 8

  // Audio queueing system
  useEffect(() => {
    if (!audioEnabled) return;
    
    const recentlyCalled = servingTokens[0];
    if (recentlyCalled && recentlyCalled.servedAt && (Date.now() - recentlyCalled.servedAt < 5000)) {
      const text = `Token number ${recentlyCalled.tokenId}, Please proceed to ${recentlyCalled.servedBy}`;
      const hindiText = `Token number ${recentlyCalled.tokenId}, kripya ${recentlyCalled.servedBy} par jaayein`;
      
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'en-IN';
      speech.rate = 0.9;
      
      const hindiSpeech = new SpeechSynthesisUtterance(hindiText);
      hindiSpeech.lang = 'hi-IN';
      hindiSpeech.rate = 0.9;

      window.speechSynthesis.speak(speech);
      window.speechSynthesis.speak(hindiSpeech);
    }
  }, [servingTokens, audioEnabled]);

  const enableAudio = () => {
    setAudioEnabled(true);
    const utterance = new SpeechSynthesisUtterance("Audio announcements enabled");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  };

  if (!hospital) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center">
          {hospital.logo && <img src={hospital.logo} alt="Logo" className="h-12 w-auto mr-4" />}
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{hospital.hospitalName}</h1>
            <p className="text-primary-400 font-medium">Live Queue Status</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {!audioEnabled && (
            <button onClick={enableAudio} className="flex items-center bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-slate-300 transition-colors border border-white/10">
              <VolumeX className="w-5 h-5 mr-2 text-rose-400" /> Enable Audio
            </button>
          )}
          {audioEnabled && (
            <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20">
              <Volume2 className="w-5 h-5 mr-2 animate-pulse" /> Audio Active
            </div>
          )}
          <div className="text-right bg-white/5 px-6 py-2 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-white tracking-widest">{format(currentTime, 'HH:mm:ss')}</div>
            <div className="text-sm text-slate-400 font-medium uppercase">{format(currentTime, 'EEEE, dd MMM yyyy')}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex p-8 gap-8 relative z-10">
        
        {/* Left Column: Now Serving */}
        <div className="flex-[3] flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            Now Serving
          </h2>
          
          {servingTokens.length === 0 ? (
            <div className="flex-1 rounded-[2rem] border border-white/5 bg-white/5 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-2xl font-medium">Waiting for next patient...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-rows-3 gap-6">
              {/* Highlight the most recently called token */}
              <AnimatePresence>
                {servingTokens.slice(0, 1).map(token => (
                  <motion.div 
                    key={token.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="row-span-2 rounded-[2rem] bg-gradient-to-br from-primary-900/80 to-indigo-900/80 border border-primary-500/30 p-12 flex flex-col justify-center relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                  >
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-500/20 rounded-full blur-[80px]"></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-primary-300 mb-2 uppercase tracking-widest">Token Number</p>
                        <h3 className="text-9xl font-black text-white tracking-tighter drop-shadow-lg">{token.tokenId}</h3>
                        <p className="text-3xl text-slate-300 mt-4 font-medium">{token.patientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-300 mb-4 uppercase tracking-widest">Proceed To</p>
                        <div className="inline-block bg-white text-slate-900 text-5xl font-black px-10 py-6 rounded-3xl shadow-xl transform rotate-1">
                          {token.servedBy}
                        </div>
                        {token.department && <p className="text-2xl text-slate-400 mt-6 font-medium">{token.department}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Other currently serving tokens (if multiple counters) */}
              {servingTokens.length > 1 && (
                <div className="grid grid-cols-2 gap-6">
                  {servingTokens.slice(1, 3).map(token => (
                    <motion.div 
                      key={token.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-3xl bg-white/5 border border-white/10 p-6 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Token</p>
                        <h4 className="text-5xl font-black text-white">{token.tokenId}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Counter</p>
                        <div className="text-3xl font-bold text-primary-400">{token.servedBy}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Up Next */}
        <div className="flex-[1] flex flex-col gap-6 bg-slate-900/40 rounded-[2rem] border border-white/5 p-8">
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em]">Up Next</h2>
          
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {waitingTokens.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">
                No one waiting
              </div>
            ) : (
              <AnimatePresence>
                {waitingTokens.map((token, idx) => (
                  <motion.div 
                    key={token.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-3xl font-black text-white">{token.tokenId}</h4>
                      {token.department && <p className="text-sm text-slate-400 mt-1">{token.department}</p>}
                    </div>
                    {token.priority !== 'normal' && (
                      <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-rose-500/20">
                        {token.priority}
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          
          {todayTokens.filter(t => t.status === 'waiting').length > 8 && (
            <div className="text-center text-slate-500 font-medium pt-4 border-t border-white/10">
              + {todayTokens.filter(t => t.status === 'waiting').length - 8} more waiting
            </div>
          )}
        </div>
      </main>

      {/* Decorative background glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px]"></div>
      </div>
    </div>
  );
};

export default TVDisplay;
