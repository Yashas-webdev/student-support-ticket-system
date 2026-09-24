import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function SlaBadge({ sla, status }) {
  if (status === 'Resolved' || status === 'Closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        SLA Met
      </span>
    );
  }

  if (sla?.isBreached || sla?.status === 'BREACHED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        SLA BREACHED
      </span>
    );
  }

  const isWarning = sla?.status === 'WARNING_CRITICAL' || sla?.status === 'WARNING_NEAR';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isWarning
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
      }`}
    >
      {isWarning ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-indigo-500" />
      )}
      <span>{sla?.timeText || 'SLA Active'}</span>
    </span>
  );
}
