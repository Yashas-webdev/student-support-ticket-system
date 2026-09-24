import Ticket from '../models/Ticket.js';
import TicketMessage from '../models/TicketMessage.js';
import TicketActivity from '../models/TicketActivity.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { calculateSlaDeadline, evaluateSlaStatus, processSlaCheckAndEscalations } from '../services/slaService.js';

// Helper to generate readable Ticket ID like TCK-1001
const generateTicketId = async () => {
  const count = await Ticket.countDocuments();
  const nextNum = 1000 + count + 1;
  return `TCK-${nextNum}`;
};

export const createTicket = async (req, res) => {
  try {
    const { category, priority, subject, description } = req.body;
    const studentId = req.user._id;

    const ticketId = await generateTicketId();
    const { hours: slaHours, deadline: slaDeadline } = calculateSlaDeadline(priority || 'MEDIUM');

    // Handle file attachments if uploaded
    const attachments = req.files
      ? req.files.map((file) => ({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        }))
      : [];

    // Optional auto-assignment logic based on department match
    let assignedTo = null;
    let initialStatus = 'Created';

    const categoryDepartmentMap = {
      Fees: 'Fees & Finance',
      Attendance: 'Attendance & Leave',
      Documents: 'Documents & Certificates',
      'ID Card': 'ID Card & Pass',
      Certificate: 'Documents & Certificates',
      Academic: 'Academic & Exams',
      Hostel: 'Hostel & Mess',
      'IT Support': 'IT & Portal Support',
    };

    const matchingDept = categoryDepartmentMap[category];
    if (matchingDept) {
      const staffInDept = await User.findOne({ role: 'STAFF', department: matchingDept });
      if (staffInDept) {
        assignedTo = staffInDept._id;
        initialStatus = 'Assigned';
      }
    }

    const ticket = await Ticket.create({
      ticketId,
      student: studentId,
      assignedTo,
      category,
      priority: priority || 'MEDIUM',
      status: initialStatus,
      subject,
      description,
      attachments,
      slaHours,
      slaDeadline,
    });

    // Create Activity Log
    await TicketActivity.create({
      ticket: ticket._id,
      actor: studentId,
      action: 'CREATED',
      details: `Ticket created with ${priority || 'MEDIUM'} priority. Category: ${category}. SLA deadline set to ${slaHours} hours.`,
    });

    if (assignedTo) {
      await TicketActivity.create({
        ticket: ticket._id,
        actor: studentId,
        action: 'ASSIGNED',
        details: `System auto-assigned ticket to staff member based on department match.`,
      });

      await Notification.create({
        recipient: assignedTo,
        ticket: ticket._id,
        title: `New Ticket Assigned: ${ticket.ticketId}`,
        message: `You were assigned ticket "${ticket.subject}" in ${ticket.category}.`,
        type: 'ASSIGNMENT',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('ticket_created', { ticketId: ticket.ticketId, id: ticket._id });
    }

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('student', 'name email department avatar')
      .populate('assignedTo', 'name email department avatar');

    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const { search, category, priority, status, isEscalated, assignedTo, isSlaBreached } = req.query;

    const query = {};

    // Role-based visibility scoping
    if (role === 'STUDENT') {
      query.student = userId;
    } else if (role === 'STAFF') {
      // Staff see tickets assigned to them OR unassigned/in their department
      query.$or = [{ assignedTo: userId }, { assignedTo: null }];
    }
    // MANAGER & ADMIN see all tickets

    // Filters
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (isEscalated !== undefined) query.isEscalated = isEscalated === 'true';
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let tickets = await Ticket.find(query)
      .populate('student', 'name email department studentIdNumber avatar')
      .populate('assignedTo', 'name email department avatar')
      .populate('escalatedTo', 'name email role')
      .sort({ createdAt: -1 });

    // Enrich tickets with dynamic SLA calculations
    const enrichedTickets = tickets.map((t) => {
      const ticketObj = t.toObject({ virtuals: true });
      ticketObj.sla = evaluateSlaStatus(t);
      return ticketObj;
    });

    // Handle SLA breach filtering if requested
    let finalTickets = enrichedTickets;
    if (isSlaBreached === 'true') {
      finalTickets = enrichedTickets.filter((t) => t.sla.isBreached);
    }

    res.json(finalTickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    const ticket = await Ticket.findById(id)
      .populate('student', 'name email department studentIdNumber avatar')
      .populate('assignedTo', 'name email department avatar')
      .populate('escalatedTo', 'name email role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Access check
    if (role === 'STUDENT' && ticket.student._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    // Fetch messages (Hide internal notes from students)
    const messageQuery = { ticket: ticket._id };
    if (role === 'STUDENT') {
      messageQuery.isInternalNote = false;
    }

    const messages = await TicketMessage.find(messageQuery)
      .populate('sender', 'name email role avatar')
      .sort({ createdAt: 1 });

    // Fetch Activity Timeline
    const activities = await TicketActivity.find({ ticket: ticket._id })
      .populate('actor', 'name email role')
      .sort({ createdAt: 1 });

    const ticketObj = ticket.toObject({ virtuals: true });
    ticketObj.sla = evaluateSlaStatus(ticket);

    res.json({
      ticket: ticketObj,
      messages,
      activities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;

    if (status === 'Resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }
    if (status === 'Closed' && !ticket.closedAt) {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    // Log Activity
    await TicketActivity.create({
      ticket: ticket._id,
      actor: req.user._id,
      action: status === 'Resolved' ? 'RESOLVED' : status === 'Closed' ? 'CLOSED' : 'STATUS_CHANGED',
      details: `Status updated from "${oldStatus}" to "${status}"`,
    });

    // Notify Student
    await Notification.create({
      recipient: ticket.student,
      ticket: ticket._id,
      title: `Ticket Status Updated: ${ticket.ticketId}`,
      message: `Your ticket "${ticket.subject}" is now ${status}.`,
      type: 'STATUS_CHANGE',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('ticket_updated', { ticketId: ticket.ticketId, id: ticket._id, status });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate('student', 'name email department avatar')
      .populate('assignedTo', 'name email department avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToUserId } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const staff = await User.findById(assignedToUserId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const oldStaff = ticket.assignedTo;
    ticket.assignedTo = staff._id;
    if (ticket.status === 'Created') {
      ticket.status = 'Assigned';
    }

    await ticket.save();

    await TicketActivity.create({
      ticket: ticket._id,
      actor: req.user._id,
      action: oldStaff ? 'REASSIGNED' : 'ASSIGNED',
      details: `Ticket assigned to ${staff.name} (${staff.department})`,
    });

    await Notification.create({
      recipient: staff._id,
      ticket: ticket._id,
      title: `Ticket Assigned: ${ticket.ticketId}`,
      message: `You have been assigned ticket "${ticket.subject}"`,
      type: 'ASSIGNMENT',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('ticket_assigned', { ticketId: ticket.ticketId, assignedTo: staff.name });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate('student', 'name email department avatar')
      .populate('assignedTo', 'name email department avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isInternalNote } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const isNote = isInternalNote === 'true' || isInternalNote === true;

    // Check permissions for internal note
    if (isNote && req.user.role === 'STUDENT') {
      return res.status(403).json({ message: 'Students cannot post internal notes' });
    }

    const attachments = req.files
      ? req.files.map((file) => ({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        }))
      : [];

    const newMsg = await TicketMessage.create({
      ticket: ticket._id,
      sender: req.user._id,
      message,
      isInternalNote: isNote,
      attachments,
    });

    // If staff/manager replies to student, update status if needed
    if (req.user.role !== 'STUDENT' && !isNote && ticket.status === 'Assigned') {
      ticket.status = 'In Progress';
      await ticket.save();
    } else if (req.user.role === 'STUDENT' && ticket.status === 'Waiting for Student') {
      ticket.status = 'In Progress';
      await ticket.save();
    }

    // Log Activity
    await TicketActivity.create({
      ticket: ticket._id,
      actor: req.user._id,
      action: isNote ? 'INTERNAL_NOTE_ADDED' : 'REPLIED',
      details: isNote ? 'Added an internal note' : `Posted a reply: "${message.substring(0, 40)}..."`,
    });

    // Notify counterpart
    const recipientId = req.user.role === 'STUDENT' ? ticket.assignedTo : ticket.student;
    if (recipientId && !isNote) {
      await Notification.create({
        recipient: recipientId,
        ticket: ticket._id,
        title: `New Reply on Ticket ${ticket.ticketId}`,
        message: `${req.user.name} replied: "${message.substring(0, 50)}..."`,
        type: 'REPLY',
      });
    }

    const populatedMsg = await TicketMessage.findById(newMsg._id).populate('sender', 'name email role avatar');

    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', { ticketId: ticket.ticketId, message: populatedMsg });
    }

    res.status(201).json(populatedMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const escalateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, targetRole } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const managers = await User.find({ role: targetRole || 'MANAGER' });
    let managerUser = managers.length > 0 ? managers[0] : null;

    ticket.isEscalated = true;
    ticket.escalationLevel = (ticket.escalationLevel || 0) + 1;
    ticket.escalatedReason = reason || 'Manual Escalation by Staff/Manager';
    ticket.escalatedAt = new Date();
    if (managerUser) ticket.escalatedTo = managerUser._id;

    await ticket.save();

    await TicketActivity.create({
      ticket: ticket._id,
      actor: req.user._id,
      action: 'ESCALATED',
      details: `Ticket escalated to Level ${ticket.escalationLevel}. Reason: ${ticket.escalatedReason}`,
    });

    if (managerUser) {
      await Notification.create({
        recipient: managerUser._id,
        ticket: ticket._id,
        title: `⚠️ Escalation Alert: ${ticket.ticketId}`,
        message: `Ticket "${ticket.subject}" was escalated by ${req.user.name}. Reason: ${ticket.escalatedReason}`,
        type: 'ESCALATION',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('ticket_escalated', { ticketId: ticket.ticketId, id: ticket._id, reason: ticket.escalatedReason });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate('student', 'name email department avatar')
      .populate('assignedTo', 'name email department avatar')
      .populate('escalatedTo', 'name email role');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const allTickets = await Ticket.find()
      .populate('student', 'name department')
      .populate('assignedTo', 'name department');

    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter((t) => t.status === 'Created' || t.status === 'Assigned').length;
    const inProgressTickets = allTickets.filter((t) => t.status === 'In Progress' || t.status === 'Waiting for Student').length;
    const resolvedTickets = allTickets.filter((t) => t.status === 'Resolved').length;
    const closedTickets = allTickets.filter((t) => t.status === 'Closed').length;
    const escalatedTickets = allTickets.filter((t) => t.isEscalated).length;

    // Evaluate SLA Statuses
    let breachedCount = 0;
    let totalMetCount = 0;
    const now = new Date();

    allTickets.forEach((t) => {
      const sla = evaluateSlaStatus(t);
      if (sla.isBreached) breachedCount++;
      else totalMetCount++;
    });

    const slaComplianceRate = totalTickets > 0 ? Math.round(((totalTickets - breachedCount) / totalTickets) * 100) : 100;

    // Category Breakdown
    const categories = ['Fees', 'Attendance', 'Documents', 'ID Card', 'Certificate', 'Academic', 'Hostel', 'IT Support', 'General'];
    const categoryStats = categories.map((cat) => {
      const catTickets = allTickets.filter((t) => t.category === cat);
      const breachedCat = catTickets.filter((t) => evaluateSlaStatus(t).isBreached).length;
      return {
        category: cat,
        total: catTickets.length,
        open: catTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length,
        breached: breachedCat,
      };
    });

    // Priority Breakdown
    const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
    const priorityStats = priorities.map((p) => {
      const count = allTickets.filter((t) => t.priority === p).length;
      return { priority: p, count };
    });

    // Staff Workload Metrics
    const staffList = await User.find({ role: 'STAFF' }).select('name department avatar');
    const staffWorkload = staffList.map((staff) => {
      const staffTickets = allTickets.filter((t) => t.assignedTo && t.assignedTo._id.toString() === staff._id.toString());
      const active = staffTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
      const resolved = staffTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
      const breached = staffTickets.filter((t) => evaluateSlaStatus(t).isBreached).length;

      return {
        id: staff._id,
        name: staff.name,
        department: staff.department,
        activeTickets: active,
        resolvedTickets: resolved,
        breachedTickets: breached,
      };
    });

    // Ageing Analysis (<12h, 12-24h, 24-48h, >48h)
    const openOnly = allTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed');
    const ageing = {
      under12h: 0,
      h12to24: 0,
      h24to48: 0,
      over48h: 0,
    };

    openOnly.forEach((t) => {
      const ageHours = (now.getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
      if (ageHours < 12) ageing.under12h++;
      else if (ageHours < 24) ageing.h12to24++;
      else if (ageHours < 48) ageing.h24to48++;
      else ageing.over48h++;
    });

    res.json({
      summary: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        escalatedTickets,
        breachedCount,
        slaComplianceRate,
      },
      categoryStats,
      priorityStats,
      staffWorkload,
      ageing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerSlaCheck = async (req, res) => {
  try {
    const io = req.app.get('io');
    await processSlaCheckAndEscalations(io);
    res.json({ message: 'SLA evaluation and escalation check completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
