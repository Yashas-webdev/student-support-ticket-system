import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../store/ticketSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  TrendingUp,
  BarChart2,
  Users,
  AlertTriangle,
} from 'lucide-react';

export default function ExecutiveAnalytics() {
  const dispatch = useDispatch();
  const { stats, statsLoading } = useSelector((state) => state.tickets);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (statsLoading || !stats) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading executive analytics...</div>;
  }

  const { summary, categoryStats, priorityStats, staffWorkload, ageing } = stats;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const ageingData = [
    { name: '< 12 Hours', count: ageing.under12h },
    { name: '12 - 24 Hours', count: ageing.h12to24 },
    { name: '24 - 48 Hours', count: ageing.h24to48 },
    { name: '> 48 Hours (Overdue)', count: ageing.over48h },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Executive Support & SLA Analytics</h2>
        <p className="text-xs text-slate-500 font-medium">
          Management visibility into resolution rates, category bottlenecks, and staff workloads.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tickets</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalTickets}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.openTickets} Open / {summary.resolvedTickets} Resolved
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Compliance Rate</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{summary.slaComplianceRate}%</h3>
            <p className="text-[11px] text-slate-400 mt-1">{summary.breachedCount} Breached SLA</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escalated Tickets</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{summary.escalatedTickets}</h3>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Requires Manager Review</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical SLA Warnings</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{ageing.over48h}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Ageing &gt; 48 hours</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Ticket Count & SLA Breaches by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" name="Total Tickets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="breached" name="SLA Breaches" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Ageing Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Ticket Ageing Analysis (Open Tickets)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Ticket Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Workload Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Staff Workload & Resolution Performance</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Active Tickets</th>
                <th className="p-3.5">Resolved Tickets</th>
                <th className="p-3.5">SLA Breaches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {staffWorkload.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{staff.name}</td>
                  <td className="p-3.5 text-slate-600">{staff.department}</td>
                  <td className="p-3.5">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                      {staff.activeTickets}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                      {staff.resolvedTickets}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold ${
                        staff.breachedTickets > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {staff.breachedTickets}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
