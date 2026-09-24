import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fees',
        'Attendance',
        'Documents',
        'ID Card',
        'Certificate',
        'Academic',
        'Hostel',
        'IT Support',
        'General',
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Created',
        'Assigned',
        'In Progress',
        'Waiting for Student',
        'Resolved',
        'Closed',
      ],
      default: 'Created',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    attachments: [
      {
        originalName: String,
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
      },
    ],
    slaHours: {
      type: Number,
      default: 24,
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalationLevel: {
      type: Number,
      default: 0, // 0: Normal, 1: Team Lead, 2: Manager, 3: Admin
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    escalatedReason: {
      type: String,
      default: '',
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual for SLA Breach Check
ticketSchema.virtual('isSlaBreached').get(function () {
  if (this.status === 'Resolved' || this.status === 'Closed') {
    if (this.resolvedAt && this.slaDeadline) {
      return this.resolvedAt > this.slaDeadline;
    }
    return false;
  }
  return new Date() > this.slaDeadline;
});

ticketSchema.set('toJSON', { virtuals: true });
ticketSchema.set('toObject', { virtuals: true });

export default mongoose.model('Ticket', ticketSchema);
