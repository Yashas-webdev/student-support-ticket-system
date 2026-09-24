import Ticket from '../models/Ticket.js';
import TicketActivity from '../models/TicketActivity.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const SLA_HOURS_MAP = {
  URGENT: 4,
  HIGH: 12,
  MEDIUM: 24,
  LOW: 48,
};

export const calculateSlaDeadline = (priority, startDate = new Date()) => {
  const hours = SLA_HOURS_MAP[priority] || 24;
  const deadline = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
  return { hours, deadline };
};

export const evaluateSlaStatus = (ticket) => {
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
    const end = ticket.resolvedAt || ticket.closedAt || new Date();
    const breached = end > new Date(ticket.slaDeadline);
    return {
      status: breached ? 'BREACHED_BEFORE_RESOLVE' : 'MET_ON_TIME',
      percentage: 100,
      remainingMs: 0,
      isBreached: breached,
    };
  }

  const now = new Date();
  const created = new Date(ticket.createdAt);
  const deadline = new Date(ticket.slaDeadline);
  const totalMs = deadline.getTime() - created.getTime();
  const remainingMs = deadline.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return {
      status: 'BREACHED',
      percentage: 100,
      remainingMs: 0,
      isBreached: true,
      timeText: 'Overdue!',
    };
  }

  const elapsedMs = now.getTime() - created.getTime();
  const percentage = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  let status = 'ON_TRACK';
  if (remainingMs < 2 * 60 * 60 * 1000) {
    status = 'WARNING_CRITICAL'; // < 2 hours left
  } else if (remainingMs < 6 * 60 * 60 * 1000) {
    status = 'WARNING_NEAR'; // < 6 hours left
  }

  return {
    status,
    percentage,
    remainingMs,
    remainingHours,
    remainingMins,
    isBreached: false,
    timeText: `${remainingHours}h ${remainingMins}m remaining`,
  };
};

export const processSlaCheckAndEscalations = async (io) => {
  try {
    const now = new Date();
    // Find tickets that have crossed deadline, are not resolved/closed, and not yet escalated
    const breachedTickets = await Ticket.find({
      status: { $nin: ['Resolved', 'Closed'] },
      slaDeadline: { $lt: now },
      isEscalated: false,
    });

    if (breachedTickets.length === 0) return;

    console.log(`🚨 SLA Engine: Found ${breachedTickets.length} breached ticket(s). Escalating...`);

    const managers = await User.find({ role: { $in: ['MANAGER', 'ADMIN'] } });

    for (const ticket of breachedTickets) {
      ticket.isEscalated = true;
      ticket.escalationLevel = 2; // Escalated to Manager Level
      ticket.escalatedReason = 'System SLA Breach: Response/Resolution SLA Exceeded';
      ticket.escalatedAt = now;
      if (managers.length > 0) {
        ticket.escalatedTo = managers[0]._id;
      }
      await ticket.save();

      // Log SLA Breach Activity
      await TicketActivity.create({
        ticket: ticket._id,
        actor: ticket.assignedTo || ticket.student,
        action: 'SLA_BREACHED',
        details: `Ticket breached ${ticket.priority} SLA deadline of ${ticket.slaHours} hours. System auto-escalated ticket to Management.`,
      });

      // Notify Managers
      for (const manager of managers) {
        await Notification.create({
          recipient: manager._id,
          ticket: ticket._id,
          title: `🚨 SLA Breach Alert: ${ticket.ticketId}`,
          message: `Ticket "${ticket.subject}" breached its ${ticket.priority} SLA. Escalated for immediate review.`,
          type: 'ESCALATION',
        });
      }

      // Emit WebSocket event
      if (io) {
        io.emit('ticket_escalated', {
          ticketId: ticket.ticketId,
          id: ticket._id,
          reason: 'SLA Breach Auto-Escalation',
        });
      }
    }
  } catch (error) {
    console.error('Error processing SLA check:', error);
  }
};
