import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { triggerSlaCheck } from '../store/ticketSlice';
import {
  LifeBuoy,
  LogOut,
  Bell,
  Zap,
  UserCheck,
  ShieldAlert,
  BarChart3,
  Ticket,
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleRunSlaCheck = () => {
    dispatch(triggerSlaCheck());
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'STAFF':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white shadow-md">
              <LifeBuoy className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                UniSupport Pro
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Student Ticket & SLA Management
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {user && (
            <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'tickets'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Ticket Desk</span>
              </button>

              {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'STAFF') && (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Executive Analytics</span>
                </button>
              )}
            </div>
          )}

          {/* Right Actions */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Force SLA Check Button (Great for Live Demos!) */}
              {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'STAFF') && (
                <button
                  onClick={handleRunSlaCheck}
                  title="Force re-evaluate SLA deadlines & trigger auto-escalations"
                  className="flex items-center space-x-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span className="hidden sm:inline">Run SLA Check</span>
                </button>
              )}

              {/* User Profile & Role Info */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{user.name}</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xs border-2 border-white">
                  {user.name.charAt(0)}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
