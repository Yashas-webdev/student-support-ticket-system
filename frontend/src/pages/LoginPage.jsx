import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { GraduationCap, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const demoAccounts = [
    { label: 'Student (Rahul Verma)', email: 'student@college.edu', role: 'STUDENT' },
    { label: 'Staff - Fees (Vikram Singh)', email: 'staff.fees@college.edu', role: 'STAFF' },
    { label: 'Staff - IT (Priya Patel)', email: 'staff.it@college.edu', role: 'STAFF' },
    { label: 'Manager (Prof. Rajesh Kumar)', email: 'manager@college.edu', role: 'MANAGER' },
  ];

  const handleDemoClick = (demoEmail) => {
    dispatch(loginUser({ email: demoEmail, password: 'password123' }));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-slate-900 rounded-2xl text-white shadow-md mb-3">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">UniSupport Pro</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Student Support & SLA Management Platform
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="user@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-3">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Quick Demo Accounts (Seeded)</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoClick(acc.email)}
                className="w-full text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-2.5 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                    {acc.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{acc.email}</div>
                </div>
                <span className="text-[10px] font-extrabold bg-slate-200 group-hover:bg-indigo-600 group-hover:text-white px-2 py-0.5 rounded-md text-slate-700 transition-all">
                  {acc.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
