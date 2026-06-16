import { QRCodeSVG } from 'qrcode.react';
import { useQueueStore } from '../store/useQueueStore';
import { Activity } from 'lucide-react';

const QRPoster = () => {
  const { settings } = useQueueStore();
  // Get the current origin (e.g., http://localhost:5173 or the deployed domain)
  const patientPortalUrl = window.location.origin + '/';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 print:p-0 print:bg-white">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none border border-slate-100 print:border-none text-center">
        
        <div className="bg-primary-600 px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="h-20 w-20 bg-white rounded-3xl shadow-lg flex items-center justify-center">
              <Activity className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight relative z-10">
            {settings.hospitalName}
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-primary-100 font-medium relative z-10">
            Scan to get your Queue Token
          </p>
        </div>

        <div className="p-12 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-primary-100">
            <QRCodeSVG 
              value={patientPortalUrl} 
              size={300}
              level="H"
              includeMargin={true}
              className="rounded-xl"
            />
          </div>
          
          <div className="mt-10 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">No more waiting in line!</h2>
            <div className="flex justify-center space-x-6 text-slate-600 font-medium text-lg">
              <span className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 font-bold">1</span>
                Scan QR Code
              </span>
              <span className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 font-bold">2</span>
                Fill Details
              </span>
              <span className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 font-bold">3</span>
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
