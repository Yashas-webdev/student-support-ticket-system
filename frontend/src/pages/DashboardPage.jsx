import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTickets,
  setFilterCategory,
  setFilterPriority,
  setFilterStatus,
  setFilterSlaBreached,
  setSearchTerm,
  addMessageToActiveTicket,
} from '../store/ticketSlice';
import socket from '../api/socket';
import Navbar from '../components/Navbar';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';
import ExecutiveAnalytics from '../components/ExecutiveAnalytics';
import {
  Search,
  Plus,
  Filter,
  ShieldAlert,
  RotateCcw,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    tickets,
    loading,
    filterCategory,
    filterPriority,
    filterStatus,
    filterSlaBreached,
    searchTerm,
  } = useSelector((state) => state.tickets);

  const [activeTab, setActiveTab] = useState('tickets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Fetch tickets whenever filters change or active user changes
  useEffect(() => {
    if (user) {
      dispatch(
        fetchTickets({
          search: searchTerm,
          category: filterCategory,
          priority: filterPriority,
          status: filterStatus,
          isSlaBreached: filterSlaBreached ? 'true' : undefined,
        })
      );
    }
  }, [dispatch, user, searchTerm, filterCategory, filterPriority, filterStatus, filterSlaBreached]);

  // Socket.IO Real-Time Listeners
  useEffect(() => {
    socket.on('ticket_created', () => {
      dispatch(fetchTickets());
    });

    socket.on('ticket_updated', () => {
      dispatch(fetchTickets());
    });

    socket.on('ticket_assigned', () => {
      dispatch(fetchTickets());
    });

    socket.on('ticket_escalated', () => {
      dispatch(fetchTickets());
    });

    socket.on('new_message', (data) => {
      dispatch(addMessageToActiveTicket(data.message));
    });

    return () => {
      socket.off('ticket_created');
      socket.off('ticket_updated');
      socket.off('ticket_assigned');
      socket.off('ticket_escalated');
      socket.off('new_message');
    };
  }, [dispatch]);

  const handleResetFilters = () => {
    dispatch(setFilterCategory(''));
    dispatch(setFilterPriority(''));
    dispatch(setFilterStatus(''));
    dispatch(setFilterSlaBreached(false));
    dispatch(setSearchTerm(''));
  };

  const categories = [
    'Fees',
    'Attendance',
    'Documents',
    'ID Card',
    'Certificate',
    'Academic',
    'Hostel',
    'IT Support',
    'General',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'analytics' ? (
          <ExecutiveAnalytics />
        ) : (
          <div className="space-y-6">
            {/* Header Title & Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {user?.role === 'STUDENT'
                    ? 'My Support Tickets'
                    : user?.role === 'STAFF'
                    ? 'Staff Ticket Desk & Queue'
                    : 'Master Ticket Oversight & SLA Management'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Track statuses, SLA countdowns, priority levels, and escalations in real-time.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Ticket</span>
                </button>
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Ticket ID or subject..."
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex items-center space-x-2 flex-wrap w-full md:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => dispatch(setFilterCategory(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => dispatch(setFilterPriority(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Priorities</option>
                  <option value="URGENT">URGENT</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => dispatch(setFilterStatus(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Created">Created</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Student">Waiting for Student</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                {/* SLA Breached Toggle Button */}
                <button
                  onClick={() => dispatch(setFilterSlaBreached(!filterSlaBreached))}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    filterSlaBreached
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>SLA Breached Only</span>
                </button>

                {(filterCategory || filterPriority || filterStatus || filterSlaBreached || searchTerm) && (
                  <button
                    onClick={handleResetFilters}
                    title="Reset Filters"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tickets Grid */}
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-medium text-sm">
                Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-12">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Tickets Found</h3>
                <p className="text-xs text-slate-500 mb-6">
                  {filterSlaBreached
                    ? 'No tickets currently breaching SLA deadline under selected filters.'
                    : 'There are no support tickets matching your search or filters.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-indigo-100 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onClick={() => setSelectedTicketId(ticket._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Ticket Creation Modal */}
      <CreateTicketModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
      )}
    </div>
  );
}
