import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createNewTicket } from '../store/ticketSlice';
import { X, Send, Paperclip, AlertCircle, Clock } from 'lucide-react';

export default function CreateTicketModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [category, setCategory] = useState('Fees');
  const [priority, setPriority] = useState('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('subject', subject);
    formData.append('description', description);

    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i]);
    }

    await dispatch(createNewTicket(formData));
    setSubmitting(false);
    onClose();
  };

  const getSlaEstimateText = (p) => {
    switch (p) {
      case 'URGENT':
        return '⚡ 4-Hour Resolution SLA Guarantee';
      case 'HIGH':
        return '🔥 12-Hour Resolution SLA Guarantee';
      case 'MEDIUM':
        return '⏱️ 24-Hour Resolution SLA Guarantee';
      default:
        return '📅 48-Hour Resolution SLA Guarantee';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Submit New Support Request</h2>
            <p className="text-xs text-indigo-100 font-medium mt-0.5">
              Select category and priority. SLA countdown starts immediately upon submission.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="Fees">Fees & Finance</option>
                <option value="Attendance">Attendance & Leave</option>
                <option value="Documents">Documents & Transcripts</option>
                <option value="ID Card">ID Card & Hall Pass</option>
                <option value="Certificate">Certificate Request</option>
                <option value="Academic">Academic & Exams</option>
                <option value="Hostel">Hostel & Mess</option>
                <option value="IT Support">IT & Portal Support</option>
                <option value="General">General Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="LOW">LOW (General enquiry)</option>
                <option value="MEDIUM">MEDIUM (Standard query)</option>
                <option value="HIGH">HIGH (Important deadline)</option>
                <option value="URGENT">URGENT (Critical blocker)</option>
              </select>
            </div>
          </div>

          {/* SLA Info Callout */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 flex items-center space-x-2 text-xs font-semibold text-indigo-900">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{getSlaEstimateText(priority)}</span>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Title *
            </label>
            <input
              type="text"
              required
              placeholder="Brief summary of your issue (e.g. Fee receipt not generated)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide complete details, student ID, dates, transaction references, or symptoms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Attachments (Receipts / Screenshots / Proofs)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                  <Paperclip className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-600 font-medium">
                    Click to select files (PDF, PNG, JPG)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Create Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
