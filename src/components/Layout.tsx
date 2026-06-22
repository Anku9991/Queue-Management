import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, LogOut, Activity, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { useQueueStore } from '../store/useQueueStore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { User as AuthUser } from 'firebase/auth';
import type { User } from '../types';

const Layout = () => {
  const location = useLocation();
  const { hospital, initListeners, setCurrentUser } = useQueueStore();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthUser(currentUser);
      if (currentUser && db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setDbUser(userData);
            setCurrentUser(userData);
            if (userData.hospitalId && userData.role !== 'super_admin') {
              initListeners(userData.hospitalId);
            }
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
        }
      } else {
        setDbUser(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initListeners, setCurrentUser]);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  // Protect routes if Firebase is configured
  if (isFirebaseConfigured && !authUser) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [];
  
  if (!isFirebaseConfigured) {
    navItems.push({ name: 'Staff Dashboard', path: '/staff', icon: Users });
    navItems.push({ name: 'Admin Analytics', path: '/admin', icon: Activity });
    navItems.push({ name: 'Global Dashboard', path: '/super-admin', icon: LayoutDashboard });
  } else {
    if (dbUser?.role === 'super_admin') {
      navItems.push({ name: 'Global Dashboard', path: '/super-admin', icon: LayoutDashboard });
    } else {
      navItems.push({ name: 'Staff Dashboard', path: '/staff', icon: Users });
      if (dbUser?.role === 'hospital_admin') {
        navItems.push({ name: 'Admin Analytics', path: '/admin', icon: Activity });
      }
    }
  }

  const displayName = dbUser?.role === 'super_admin' ? 'PihNexa Super Admin' : (hospital?.hospitalName || 'Loading...');
  const displayLogo = dbUser?.role === 'super_admin' ? '/logo.png' : (hospital?.logo || '/logo.png');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src={displayLogo} alt="Logo" className="h-10 w-auto object-contain" />
                <span className="ml-3 text-xl font-bold text-slate-900">{displayName}</span>
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
              {isFirebaseConfigured && authUser && (
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
