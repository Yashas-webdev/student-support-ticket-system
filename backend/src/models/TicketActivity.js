import mongoose from 'mongoose';

const ticketActivitySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATED',
        'STATUS_CHANGED',
        'ASSIGNED',
        'REASSIGNED',
        'PRIORITY_CHANGED',
        'REPLIED',
        'INTERNAL_NOTE_ADDED',
        'ESCALATED',
        'SLA_BREACHED',
        'RESOLVED',
        'CLOSED',
      ],
    },
    details: {
      type: String,
      default: '',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('TicketActivity', ticketActivitySchema);
