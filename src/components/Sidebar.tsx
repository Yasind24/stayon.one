import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart2, Settings, LogOut, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useUserSettings } from '../lib/stores/userSettings';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { displayName } = useUserSettings();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Platforms', href: '/platforms', icon: Share2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="relative bg-white border-r transition-all duration-300 h-full" style={{ width: isCollapsed ? '5rem' : '16rem' }}>
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b">
        <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'}`}>
          <Logo />
        </div>
      </div>

      {/* User Greeting */}
      {displayName && !isCollapsed && (
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-600">Welcome,</p>
          <p className="font-medium text-gray-900 truncate">{displayName}</p>
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-16 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } transition-all duration-200`}
            >
              <item.icon
                className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'} ${
                  isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
                }`}
              />
              <span 
                className={`transition-all duration-300 whitespace-nowrap ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className={`absolute bottom-0 w-full p-4 border-t bg-white`}>
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut className={`flex-shrink-0 text-gray-400 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
          <span 
            className={`transition-all duration-300 whitespace-nowrap ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            Sign out
          </span>
        </button>
      </div>
    </div>
  );
}