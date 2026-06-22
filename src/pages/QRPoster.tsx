import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useQueueStore } from '../store/useQueueStore';

const QRPoster = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { hospital, initListeners } = useQueueStore();
  
  useEffect(() => {
    if (hospitalId) initListeners(hospitalId);
  }, [hospitalId, initListeners]);

  // Get the current origin (e.g., http://localhost:5173 or the deployed domain)
  const patientPortalUrl = window.location.origin + `/register/${hospitalId || ''}`;

  if (!hospital) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 print:p-0 print:bg-white">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none border border-slate-100 print:border-none text-center">
        
        <div className="bg-[#002D62] px-8 py-12 text-white relative overflow-hidden border-b-8 border-[#8CC63F]">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#8CC63F] opacity-20 rounded-full blur-2xl"></div>
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-[#8CC63F] p-4 mb-4">
              <img src={hospital.logo || "/logo.png"} alt="Logo" className="h-full w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight relative z-10 text-white">
            {hospital.hospitalName}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-blue-100 font-medium relative z-10">
            Scan to get your Queue Token
          </p>
        </div>

        <div className="p-12 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blue-50/30">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-[#002D62]/10 relative">
            <div className="absolute -top-3 -right-3 h-8 w-8 bg-[#8CC63F] rounded-full animate-ping opacity-75"></div>
            <div className="absolute -top-3 -right-3 h-8 w-8 bg-[#8CC63F] rounded-full"></div>
            <QRCodeSVG 
              value={patientPortalUrl} 
              size={300}
              level="H"
              includeMargin={true}
              className="rounded-xl"
            />
          </div>
          
          <div className="mt-10 space-y-4">
            <h2 className="text-3xl font-bold text-[#002D62]">No more waiting in line!</h2>
            <div className="flex justify-center space-x-6 text-slate-600 font-medium text-lg">
              <span className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-[#002D62] text-white flex items-center justify-center mr-3 font-bold shadow-md border-2 border-[#8CC63F]">1</span>
                Scan QR Code
              </span>
              <span className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-[#002D62] text-white flex items-center justify-center mr-3 font-bold shadow-md border-2 border-[#8CC63F]">2</span>
                Fill Details
              </span>
              <span className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-[#002D62] text-white flex items-center justify-center mr-3 font-bold shadow-md border-2 border-[#8CC63F]">3</span>
                Get Token
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 py-6 border-t border-slate-100 print:hidden">
          <button 
            onClick={() => window.print()} 
            className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-colors"
          >
            Print Poster
          </button>
        </div>

      </div>
    </div>
  );
};

export default QRPoster;
