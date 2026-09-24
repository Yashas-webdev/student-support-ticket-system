import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
    },
    isInternalNote: {
      type: Boolean,
      default: false, // True if note is private for Staff/Manager/Admin
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
  },
  { timestamps: true }
);

export default mongoose.model('TicketMessage', ticketMessageSchema);
