import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, MonitorPlay, Users, QrCode, Printer } from 'lucide-react';

const DemoNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex space-x-2 bg-slate-900/90 backdrop-blur-sm p-2 rounded-2xl border border-slate-700 shadow-2xl print:hidden">
      <Link 
        to="/poster" 
        className={`p-2 rounded-xl transition-colors flex items-center ${location.pathname.includes('/poster') ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        title="Printable QR Poster"
      >
        <Printer className="w-5 h-5" />
      </Link>
      <Link 
        to="/" 
        className={`p-2 rounded-xl transition-colors flex items-center ${location.pathname === '/' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        title="Patient Token Form"
      >
        <QrCode className="w-5 h-5" />
      </Link>
      <Link 
        to="/staff" 
        className={`p-2 rounded-xl transition-colors flex items-center ${location.pathname.includes('/staff') ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        title="Staff Dashboard"
      >
        <Users className="w-5 h-5" />
      </Link>
      <Link 
        to="/tv" 
        className={`p-2 rounded-xl transition-colors flex items-center ${location.pathname.includes('/tv') ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        title="TV Display"
      >
        <MonitorPlay className="w-5 h-5" />
      </Link>
      <Link 
        to="/admin" 
        className={`p-2 rounded-xl transition-colors flex items-center ${location.pathname.includes('/admin') ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        title="Admin Dashboard"
      >
        <ShieldAlert className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default DemoNavigation;
