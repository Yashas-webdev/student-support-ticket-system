import React from 'react';
import SlaBadge from './SlaBadge';
import {
  Tag,
  User,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

export default function TicketCard({ ticket, onClick }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Closed':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'In Progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Waiting for Student':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Assigned':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg cursor-pointer p-5 flex flex-col justify-between relative overflow-hidden group ${
        ticket.isEscalated
          ? 'border-rose-400 bg-gradient-to-b from-rose-50/30 to-white shadow-xs'
          : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      {/* Escalation Alert Top Banner */}
      {ticket.isEscalated && (
        <div className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between -mx-5 -mt-5 mb-3">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ESCALATED TO MANAGEMENT (SLA BREACHED)</span>
          </div>
          <span className="text-[10px] opacity-90">Level {ticket.escalationLevel || 1}</span>
        </div>
      )}

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {ticket.ticketId}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border ${getPriorityColor(
                ticket.priority
              )}`}
            >
              {ticket.priority}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {ticket.category}
            </span>
          </div>

          <SlaBadge sla={ticket.sla} status={ticket.status} />
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {ticket.subject}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          {/* Status Tag */}
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${getStatusColor(
              ticket.status
            )}`}
          >
            {ticket.status}
          </span>

          {/* Student Info */}
          <div className="flex items-center space-x-1 text-slate-600 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{ticket.student?.name || 'Student'}</span>
          </div>
        </div>

        {/* Assigned Staff */}
        <div className="flex items-center space-x-1 font-medium">
          {ticket.assignedTo ? (
            <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] border border-indigo-100">
              Assigned: {ticket.assignedTo.name.split(' ')[0]}
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] border border-amber-200 font-semibold">
              Unassigned
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}
