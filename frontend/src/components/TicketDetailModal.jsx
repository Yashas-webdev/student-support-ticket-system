import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTicketById,
  updateTicketStatus,
  assignTicket,
  postMessage,
  escalateTicket,
} from '../store/ticketSlice';
import SlaBadge from './SlaBadge';
import API from '../api/axios';
import {
  X,
  Send,
  UserCheck,
  ShieldAlert,
  Clock,
  MessageSquare,
  Lock,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  History,
  Tag,
  User,
  Zap,
} from 'lucide-react';

export default function TicketDetailModal({ ticketId, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeTicketDetails, detailLoading } = useSelector((state) => state.tickets);

  const [message, setMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [submittingMsg, setSubmittingMsg] = useState(false);

  // Escalation & Assignment state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchTicketById(ticketId));
    }
  }, [ticketId, dispatch]);

  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'ADMIN')) {
      API.get('/auth/users?role=STAFF').then((res) => setStaffUsers(res.data)).catch(() => {});
    }
  }, [user]);

  if (!ticketId) return null;

  const detail = activeTicketDetails;
  const ticket = detail?.ticket;
  const messages = detail?.messages || [];
  const activities = detail?.activities || [];

  const handleStatusChange = (newStatus) => {
    dispatch(updateTicketStatus({ id: ticket._id, status: newStatus }));
  };

  const handleAssign = () => {
    if (!selectedStaffId) return;
    dispatch(assignTicket({ id: ticket._id, assignedToUserId: selectedStaffId }));
    setShowAssignModal(false);
  };

  const handleEscalateSubmit = () => {
    if (!escalateReason.trim()) return;
    dispatch(escalateTicket({ id: ticket._id, reason: escalateReason }));
    setShowEscalateModal(false);
    setEscalateReason('');
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmittingMsg(true);
    const formData = new FormData();
    formData.append('message', message);
    formData.append('isInternalNote', isInternalNote);
    for (let i = 0; i < attachments.length; i++) {
      formData.append('attachments', attachments[i]);
    }

    await dispatch(postMessage({ id: ticket._id, formData }));
    setMessage('');
    setIsInternalNote(false);
    setAttachments([]);
    setSubmittingMsg(false);
  };

  const statusSteps = ['Created', 'Assigned', 'In Progress', 'Waiting for Student', 'Resolved', 'Closed'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-black bg-indigo-500 text-white px-3 py-1 rounded-lg">
              {ticket?.ticketId || 'Loading...'}
            </span>
            {ticket && <SlaBadge sla={ticket.sla} status={ticket.status} />}
          </div>

          <div className="flex items-center space-x-3">
            {ticket?.isEscalated && (
              <span className="bg-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ESCALATED</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {detailLoading || !ticket ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading ticket details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Status Stepper */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold overflow-x-auto py-1">
                {statusSteps.map((step, idx) => {
                  const isCurrent = ticket.status === step;
                  const isPast = statusSteps.indexOf(ticket.status) >= idx;
                  return (
                    <div key={step} className="flex items-center space-x-2 shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                            : isPast
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <span className={isCurrent ? 'text-indigo-600 font-bold' : 'text-slate-600'}>
                        {step}
                      </span>
                      {idx < statusSteps.length - 1 && <span className="text-slate-300">→</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
              {/* Left Column: Messages & Activity Log */}
              <div className="lg:col-span-2 p-6 flex flex-col overflow-y-auto space-y-6 border-r border-slate-200">
                {/* Issue Header */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {ticket.category}
                    </span>
                    <span className="text-xs font-bold text-rose-600">{ticket.priority} PRIORITY</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{ticket.subject}</h2>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Messages & Notes Thread */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>Conversation & Internal Notes ({messages.length})</span>
                  </h3>

                  {messages.length === 0 ? (
                    <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                      No replies yet.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender?._id === user?._id;
                      const isInternal = msg.isInternalNote;

                      return (
                        <div
                          key={msg._id}
                          className={`p-4 rounded-2xl text-xs space-y-1.5 border transition-all ${
                            isInternal
                              ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                              : isMe
                              ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 ml-6'
                              : 'bg-white border-slate-200 text-slate-800 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold border-b border-slate-200/50 pb-1 mb-1">
                            <div className="flex items-center space-x-2">
                              <span>{msg.sender?.name || 'User'}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-bold">
                                {msg.sender?.role}
                              </span>
                              {isInternal && (
                                <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> INTERNAL STAFF NOTE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handlePostMessage} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Write a Reply</label>
                    {user?.role !== 'STUDENT' && (
                      <label className="flex items-center space-x-1.5 text-xs font-bold text-amber-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="rounded-md text-amber-600 focus:ring-amber-500"
                        />
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private Internal Staff Note</span>
                      </label>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    placeholder={
                      isInternalNote
                        ? 'Write internal note visible only to Staff & Managers...'
                        : 'Write message to student...'
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Press submit to post message</span>
                    <button
                      type="submit"
                      disabled={submittingMsg || !message.trim()}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 ${
                        isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInternalNote ? 'Save Internal Note' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>

                {/* Audit Trail & Activity Timeline */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2 mb-3">
                    <History className="w-4 h-4 text-indigo-500" />
                    <span>Audit Trail & Activity Log ({activities.length})</span>
                  </h3>

                  <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                    {activities.map((act) => (
                      <div key={act._id} className="relative pl-4 text-xs">
                        <div className="absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-100" />
                        <div className="font-semibold text-slate-800">
                          {act.actor?.name || 'System'}: <span className="font-mono text-indigo-600">{act.action}</span>
                        </div>
                        <p className="text-slate-600">{act.details}</p>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(act.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Metadata */}
              <div className="p-6 bg-slate-50/50 space-y-6 overflow-y-auto">
                {/* Control Panel Actions */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Ticket Controls
                  </h3>

                  {/* Status Change */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Update Ticket Status
                    </label>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      {statusSteps.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assign Staff Button */}
                  {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition-all"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>{ticket.assignedTo ? 'Reassign Staff' : 'Assign to Staff'}</span>
                    </button>
                  )}

                  {/* Escalate Button */}
                  {!ticket.isEscalated && (
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs transition-all"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Escalate to Management</span>
                    </button>
                  )}
                </div>

                {/* Ticket Overview Metadata */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Ticket Information
                  </h3>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Student</span>
                    <span className="font-bold text-slate-800">{ticket.student?.name}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Student ID</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {ticket.student?.studentIdNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Assigned Staff</span>
                    <span className="font-bold text-indigo-600">
                      {ticket.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Created Date</span>
                    <span className="text-slate-700 font-medium">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">SLA Deadline</span>
                    <span className="font-bold text-slate-800">
                      {new Date(ticket.slaDeadline).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Staff Assignment */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-slate-900">Assign Ticket to Staff Member</h3>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
              >
                <option value="">Select Staff Member</option>
                {staffUsers.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.department})
                  </option>
                ))}
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Manual Escalation */}
        {showEscalateModal && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Escalate Ticket to Management
              </h3>
              <p className="text-xs text-slate-600">
                This will flag the ticket as Escalated, notify department managers, and log an audit entry.
              </p>
              <textarea
                rows={3}
                required
                placeholder="Reason for escalation (e.g. Unresolved for 3 days, student request...)"
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowEscalateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalateSubmit}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
