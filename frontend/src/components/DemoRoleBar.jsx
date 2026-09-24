import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { User, Shield, Briefcase, Award } from 'lucide-react';

export default function DemoRoleBar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const demoAccounts = [
    { label: 'Student (Rahul)', email: 'student@college.edu', role: 'STUDENT', color: 'bg-emerald-600' },
    { label: 'Staff (Fees - Vikram)', email: 'staff.fees@college.edu', role: 'STAFF', color: 'bg-amber-600' },
    { label: 'Staff (IT - Priya)', email: 'staff.it@college.edu', role: 'STAFF', color: 'bg-sky-600' },
    { label: 'Manager (Prof. Rajesh)', email: 'manager@college.edu', role: 'MANAGER', color: 'bg-indigo-600' },
    { label: 'Admin (System)', email: 'admin@college.edu', role: 'ADMIN', color: 'bg-purple-600' },
  ];

  const handleQuickLogin = (email) => {
    dispatch(loginUser({ email, password: 'password123' }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 py-2.5 px-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>⚡ Live Interview Demo Switcher:</span>
        </div>

        <div className="flex items-center space-x-1.5 flex-wrap justify-center">
          {demoAccounts.map((acc) => {
            const isActive = user?.email === acc.email;
            return (
              <button
                key={acc.email}
                onClick={() => handleQuickLogin(acc.email)}
                className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 border ${
                  isActive
                    ? 'bg-white text-slate-900 border-white ring-2 ring-indigo-400 shadow-md scale-105'
                    : `${acc.color} text-white border-transparent opacity-90 hover:opacity-100 hover:scale-102`
                }`}
              >
                <span>{acc.label}</span>
                {isActive && <span className="ml-1 text-[9px] bg-indigo-100 text-indigo-900 px-1 rounded">Active</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
