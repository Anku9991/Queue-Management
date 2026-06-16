import { useEffect, useState } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Clock } from 'lucide-react';

const TVDisplay = () => {
  const { tokens, settings } = useQueueStore();
  const today = new Date().toDateString();
  const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);
  const [time, setTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const servingTokens = todayTokens.filter(t => t.status === 'in-process');
  const waitingTokens = todayTokens
    .filter(t => t.status === 'waiting')
    .sort((a, b) => {
      const priorityWeight: Record<string, number> = { vip: 5, emergency: 4, pregnant: 3, senior: 2, disabled: 1, normal: 0 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return a.timestamp - b.timestamp;
    });

  const servingTokenIds = servingTokens.map(t => t.id).join(',');

  // Play sound when new token is called
  useEffect(() => {
    if (soundEnabled && servingTokens.length > 0) {
      const latestToken = servingTokens[servingTokens.length - 1];
      
      // Format token for better pronunciation
      const tokenNumber = latestToken.tokenId.split('-')[1];
      const tokenLetter = latestToken.tokenId.split('-')[0];
      const tokenStrEn = `${tokenLetter} ${tokenNumber.split('').join(' ')}`;
      const tokenStrHi = `${tokenLetter} ${tokenNumber.split('').join(' ')}`;
      
      const englishMsg = new SpeechSynthesisUtterance(`Token number ${tokenStrEn}, please proceed to ${latestToken.servedBy}`);
      const hindiMsg = new SpeechSynthesisUtterance(`टोकन नंबर ${tokenStrHi}, कृपया ${latestToken.servedBy} पर जाएँ`);
      
      // Set properties
      englishMsg.rate = 0.9;
      hindiMsg.rate = 0.9;
      
      // Try to find Indian voices
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN');
      const englishVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN' || v.name.includes('India'));
      
      if (englishVoice) englishMsg.voice = englishVoice;
      if (hindiVoice) hindiMsg.voice = hindiVoice;

      // Ensure voices are loaded before speaking, or just fallback to default
      window.speechSynthesis.speak(englishMsg);
      window.speechSynthesis.speak(hindiMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servingTokenIds, soundEnabled]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{settings.hospitalName}</h1>
          <span className="ml-4 px-3 py-1 bg-primary-900 text-primary-400 rounded-full text-sm font-medium border border-primary-800">
            Live Queue Status
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full ${soundEnabled ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            {soundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>
          <div className="flex items-center text-2xl font-medium text-slate-300">
            <Clock className="w-6 h-6 mr-2 text-primary-500" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-row">
        {/* Left Side: Now Serving */}
        <div className="w-2/3 p-8 border-r border-slate-800 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest mb-8">Now Serving</h2>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <AnimatePresence>
              {servingTokens.map((token) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-800 border border-slate-700 rounded-3xl p-8 flex justify-between items-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
                  <div>
                    <div className="text-8xl font-black text-white tracking-tighter mb-2">{token.tokenId}</div>
                    <div className="text-2xl text-slate-400 font-medium">Proceed to <span className="text-primary-400 font-bold">{token.servedBy}</span></div>
                  </div>
                  {/* Optional: Add animated pulse for active state */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
                </motion.div>
              ))}
              {servingTokens.length === 0 && (
                <div className="text-center text-slate-500 text-2xl font-medium">
                  Waiting for next patient...
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Waiting List */}
        <div className="w-1/3 bg-slate-800/50 flex flex-col">
          <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/80">
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Next in Queue</h2>
          </div>
          <div className="flex-1 overflow-hidden p-8">
            <div className="space-y-4">
              <AnimatePresence>
                {waitingTokens.slice(0, 8).map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between items-center bg-slate-800 rounded-2xl p-5 border border-slate-700"
                  >
                    <div className="text-3xl font-bold text-white">{token.tokenId}</div>
                    {token.priority !== 'normal' && (
                      <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-bold rounded uppercase tracking-wider">
                        {token.priority}
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {waitingTokens.length === 0 && (
                <div className="text-center text-slate-500 py-12">
                  No one waiting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVDisplay;
