import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';
import DeleteConfirmationModal from './DeleteConfirmationModal';

function Layout({ children }) {
  const location = useLocation();
  const user = getUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/borrowers', label: 'Borrowers', icon: '👥' }
  ];

  // Add Admin link for admin users
  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: '⚙️' });
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
         style={{
           background: 'linear-gradient(to bottom, rgb(15, 23, 42) 0%, rgb(14, 29, 59) 40%, rgba(25, 65, 85, 0.6) 100%)'
         }}>
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0" style={{
        backgroundImage: `linear-gradient(rgba(203, 255, 77, 0.05) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(203, 255, 77, 0.05) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-lime-500 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-500 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-lime-400/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <img
                  src="/assets/Logo.png"
                  alt="Borrowinex Logo"
                  className="h-12 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    filter: 'invert(25%) sepia(25%) saturate(800%) hue-rotate(5deg) brightness(100%)'
                  }}
                />
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition ${
                      location.pathname.startsWith(item.path)
                        ? 'border-lime-400 text-lime-400'
                        : 'border-transparent text-gray-300 hover:border-lime-400/50 hover:text-lime-300'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* Desktop: Show welcome message and logout */}
                <div className="hidden md:flex items-center">
                  <span className="text-sm text-gray-300 mr-4">
                    Welcome, <strong className="text-white">{user?.name}</strong>
                  </span>
                  <button onClick={handleLogoutClick} className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 hover:border-lime-400/50 transition">
                    Logout
                  </button>
                </div>
                {/* Mobile: Show only logout button */}
                <button onClick={handleLogoutClick} className="md:hidden px-3 py-1 text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden border-t border-lime-400/20">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition ${
                  location.pathname.startsWith(item.path)
                    ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                    : 'border-transparent text-gray-300 hover:bg-white/5 hover:border-lime-400/50 hover:text-lime-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-lime-400/20 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-400">
            Borrowinex &copy; {new Date().getFullYear()} - Personal Lending Management System
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Logout Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
      />
    </div>
  );
}

export default Layout;
