import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import TicketMessage from '../models/TicketMessage.js';
import TicketActivity from '../models/TicketActivity.js';
import Notification from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('🌱 Database already contains data. Skipping full re-seed.');
      return;
    }

    console.log('🌱 Seeding initial demo data into database...');

    // 1. Create Users
    const student1 = await User.create({
      name: 'Rahul Verma',
      email: 'student@college.edu',
      password: 'password123',
      role: 'STUDENT',
      department: 'Computer Science',
      studentIdNumber: 'CS-2024-089',
    });

    const student2 = await User.create({
      name: 'Ananya Sharma',
      email: 'student2@college.edu',
      password: 'password123',
      role: 'STUDENT',
      department: 'Electrical Engineering',
      studentIdNumber: 'EE-2024-042',
    });

    const staffFees = await User.create({
      name: 'Vikram Singh',
      email: 'staff.fees@college.edu',
      password: 'password123',
      role: 'STAFF',
      department: 'Fees & Finance',
    });

    const staffIT = await User.create({
      name: 'Priya Patel',
      email: 'staff.it@college.edu',
      password: 'password123',
      role: 'STAFF',
      department: 'IT & Portal Support',
    });

    const manager = await User.create({
      name: 'Prof. Rajesh Kumar',
      email: 'manager@college.edu',
      password: 'password123',
      role: 'MANAGER',
      department: 'General Administration',
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'ADMIN',
      department: 'General Administration',
    });

    const now = new Date();

    // 2. Create Sample Tickets

    // Ticket 1: Urgent Fee Issue (SLA Breached to test SLA Breached UI!)
    const ticket1Created = new Date(now.getTime() - 10 * 60 * 60 * 1000); // 10 hours ago
    const ticket1SlaDeadline = new Date(ticket1Created.getTime() + 4 * 60 * 60 * 1000); // 4 hours SLA -> Breached 6 hours ago!

    const ticket1 = await Ticket.create({
      ticketId: 'TCK-1001',
      student: student1._id,
      assignedTo: staffFees._id,
      category: 'Fees',
      priority: 'URGENT',
      status: 'In Progress',
      subject: 'Urgent: Semester Fee Receipt Paid but Status showing Unpaid in Portal',
      description:
        'I completed my 5th semester fee payment of Rs. 45,000 yesterday via NetBanking (TxnRef: TXN987654321). The amount was debited from my bank, but the ERP portal still shows "Payment Pending" and prevents registration.',
      slaHours: 4,
      slaDeadline: ticket1SlaDeadline,
      isEscalated: true,
      escalationLevel: 2,
      escalatedTo: manager._id,
      escalatedReason: 'Automatic SLA Breach Escalation (Urgent 4h SLA exceeded)',
      escalatedAt: new Date(ticket1SlaDeadline.getTime() + 10 * 60 * 1000),
      createdAt: ticket1Created,
    });

    // Ticket 1 Messages & Activities
    await TicketMessage.create({
      ticket: ticket1._id,
      sender: student1._id,
      message: 'Attached screenshot of bank debit SMS and transaction receipt.',
      createdAt: ticket1Created,
    });

    await TicketMessage.create({
      ticket: ticket1._id,
      sender: staffFees._id,
      message: 'Verification with accounting team is in progress. Please hold on.',
      createdAt: new Date(ticket1Created.getTime() + 1 * 60 * 60 * 1000),
    });

    await TicketMessage.create({
      ticket: ticket1._id,
      sender: staffFees._id,
      message: 'Internal Note: Spoke to HDFC payment gateway. Reconciliations batch was delayed. Expecting settlement log by 5 PM.',
      isInternalNote: true,
      createdAt: new Date(ticket1Created.getTime() + 2 * 60 * 60 * 1000),
    });

    await TicketActivity.create({
      ticket: ticket1._id,
      actor: student1._id,
      action: 'CREATED',
      details: 'Ticket created with URGENT priority. Category: Fees. SLA deadline set to 4 hours.',
      createdAt: ticket1Created,
    });

    await TicketActivity.create({
      ticket: ticket1._id,
      actor: staffFees._id,
      action: 'ASSIGNED',
      details: 'Ticket assigned to Vikram Singh (Fees & Finance)',
      createdAt: ticket1Created,
    });

    await TicketActivity.create({
      ticket: ticket1._id,
      actor: manager._id,
      action: 'SLA_BREACHED',
      details: 'Ticket breached URGENT SLA deadline of 4 hours. System auto-escalated ticket to Management.',
      createdAt: ticket1SlaDeadline,
    });

    // Ticket 2: High Priority Document Request (On Track - Warning)
    const ticket2Created = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    const ticket2SlaDeadline = new Date(ticket2Created.getTime() + 12 * 60 * 60 * 1000); // 12h SLA -> 4h left!

    const ticket2 = await Ticket.create({
      ticketId: 'TCK-1002',
      student: student2._id,
      assignedTo: staffFees._id,
      category: 'Documents',
      priority: 'HIGH',
      status: 'Assigned',
      subject: 'Bonafide Certificate Request for Passport Application',
      description:
        'I need an official Bonafide Certificate stamped by the college registrar for my upcoming passport appointment on Friday morning.',
      slaHours: 12,
      slaDeadline: ticket2SlaDeadline,
      createdAt: ticket2Created,
    });

    await TicketActivity.create({
      ticket: ticket2._id,
      actor: student2._id,
      action: 'CREATED',
      details: 'Ticket created with HIGH priority. Category: Documents. SLA deadline set to 12 hours.',
      createdAt: ticket2Created,
    });

    // Ticket 3: Medium Priority IT Support (Resolved)
    const ticket3Created = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ticket3SlaDeadline = new Date(ticket3Created.getTime() + 24 * 60 * 60 * 1000);

    const ticket3 = await Ticket.create({
      ticketId: 'TCK-1003',
      student: student1._id,
      assignedTo: staffIT._id,
      category: 'IT Support',
      priority: 'MEDIUM',
      status: 'Resolved',
      subject: 'Unable to access Campus WiFi credentials on new laptop',
      description:
        'My MAC address registration failed on the student portal login page. Requesting IT desk to whitelist my laptop MAC address: AA:BB:CC:11:22:33.',
      slaHours: 24,
      slaDeadline: ticket3SlaDeadline,
      resolvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      createdAt: ticket3Created,
    });

    await TicketMessage.create({
      ticket: ticket3._id,
      sender: staffIT._id,
      message: 'Your MAC address AA:BB:CC:11:22:33 has been registered in Radius server. You can connect now!',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    });

    await TicketActivity.create({
      ticket: ticket3._id,
      actor: staffIT._id,
      action: 'RESOLVED',
      details: 'Status updated to Resolved on time within SLA.',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });

    // Ticket 4: Low Priority Attendance Correction (Created - Unassigned)
    const ticket4Created = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const ticket4SlaDeadline = new Date(ticket4Created.getTime() + 48 * 60 * 60 * 1000);

    await Ticket.create({
      ticketId: 'TCK-1004',
      student: student2._id,
      assignedTo: null,
      category: 'Attendance',
      priority: 'LOW',
      status: 'Created',
      subject: 'Attendance correction for Data Structures lecture on Sept 20',
      description:
        'I was marked absent in DS lecture slot 3 on Sept 20 despite presenting my seminar paper. Attached medical approval copy for verification.',
      slaHours: 48,
      slaDeadline: ticket4SlaDeadline,
      createdAt: ticket4Created,
    });

    // Create Initial Notifications
    await Notification.create({
      recipient: manager._id,
      ticket: ticket1._id,
      title: '🚨 SLA Breach Alert: TCK-1001',
      message: 'Ticket "Urgent: Semester Fee Receipt" breached 4h SLA. Auto-escalated to Management.',
      type: 'ESCALATION',
    });

    await Notification.create({
      recipient: staffFees._id,
      ticket: ticket2._id,
      title: 'Ticket Assigned: TCK-1002',
      message: 'You have been assigned ticket "Bonafide Certificate Request".',
      type: 'ASSIGNMENT',
    });

    console.log('✅ Demo data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding demo data:', error.message);
  }
};
