import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Activity, Users, MonitorPlay, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useQueueStore } from '../store/useQueueStore';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

const Layout = () => {
  const location = useLocation();
  const settings = useQueueStore(state => state.settings);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  // Protect routes if Firebase is configured
  if (isFirebaseConfigured && !user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Staff Dashboard', path: '/staff', icon: Users },
    { name: 'Admin Analytics', path: '/admin', icon: Activity },
    { name: 'TV Display', path: '/tv', icon: MonitorPlay },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Activity className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-slate-900">{settings.hospitalName}</span>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                        location.pathname === item.path
                          ? "border-primary-500 text-slate-900"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isFirebaseConfigured && user && (
                <button onClick={handleLogout} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700">
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
