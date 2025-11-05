import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, LogOut, User, Home, ArrowRight, Bell } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Marketplace', href: '/marketplace', icon: ArrowRight },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-blue-400 p-2 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-blue-400 bg-clip-text text-transparent">
                  SlotSwapper
                </span>
              </Link>
            </div>

            {/* Navigation Links - Show only when logged in */}
            {user && (
              <div className="flex items-center space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActiveRoute(item.href)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 bg-primary-50 rounded-lg px-3 py-2">
                    <User className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Hello, {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isActiveRoute('/login')
                        ? 'bg-blue-400 text-white shadow-md'
                        : 'text-gray-600 hover:text-primary-500'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className=" bg-blue-400 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;