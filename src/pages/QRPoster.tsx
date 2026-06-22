import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueueStore } from '../store/useQueueStore';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Smartphone, Zap, Clock } from 'lucide-react';

const QRPoster = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { hospital, initListeners } = useQueueStore();

  useEffect(() => {
    if (hospitalId) {
      initListeners(hospitalId);
    }
  }, [hospitalId, initListeners]);

  if (!hospital) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  const registerUrl = `${window.location.origin}/register/${hospital.id}`;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>

      <div className="flex w-full max-w-6xl gap-8 items-stretch relative z-10">
        
        {/* Left Side: Branding & Instructions */}
        <div className="flex-[1.5] text-white flex flex-col justify-center pr-8">
          {hospital.logo && <img src={hospital.logo} alt="Logo" className="h-20 w-auto mb-8" />}
          
          <h1 className="text-6xl font-black tracking-tight mb-4 leading-tight">
            Welcome to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">
              {hospital.hospitalName}
            </span>
          </h1>
          
          <p className="text-2xl text-slate-300 font-medium mb-12">
            Scan the QR code to join the queue and track your live status. No more waiting in lines!
          </p>

          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mr-6 border border-white/20 backdrop-blur-sm">
                <Smartphone className="w-7 h-7 text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">1. Scan the Code</h3>
                <p className="text-slate-400">Open your phone's camera and point it at the QR.</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mr-6 border border-white/20 backdrop-blur-sm">
                <Zap className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">2. Enter Details</h3>
                <p className="text-slate-400">Quickly fill in your name and phone number.</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mr-6 border border-white/20 backdrop-blur-sm">
                <Clock className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">3. Relax & Wait</h3>
                <p className="text-slate-400">Get a live token and a notification when it's your turn.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white p-12 rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.1)] relative"
          >
            <div className="absolute inset-0 border-[8px] border-primary-100 rounded-[3rem] pointer-events-none transform -rotate-3 transition-transform hover:rotate-0 duration-500"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-block bg-primary-100 text-primary-800 px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm mb-4">
                Scan Here
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 relative z-10">
              <QRCodeSVG
                value={registerUrl}
                size={320}
                level="H"
                includeMargin={false}
                fgColor="#0f172a"
              />
            </div>
            
            <p className="text-center mt-8 text-slate-500 font-bold uppercase tracking-wider relative z-10">
              {registerUrl.replace(/^https?:\/\//, '')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QRPoster;
