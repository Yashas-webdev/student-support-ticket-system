import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { triggerSlaCheck } from '../store/ticketSlice';
import {
  GraduationCap,
  LogOut,
  RefreshCw,
  BarChart3,
  Ticket,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

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
            <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                <span>UniSupport Pro</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded border border-indigo-200">
                  Enterprise
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Student Support & SLA Audit Desk
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
              {/* SLA Re-evaluation Button */}
              {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'STAFF') && (
                <button
                  onClick={handleRunSlaCheck}
                  title="Force re-evaluate SLA deadlines & trigger auto-escalations"
                  className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Run SLA Audit</span>
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

                <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-xs border-2 border-white">
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
