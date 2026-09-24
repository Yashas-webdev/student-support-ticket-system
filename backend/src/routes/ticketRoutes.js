import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addMessage,
  escalateTicket,
  getDashboardStats,
  triggerSlaCheck,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All ticket routes are protected

router.post('/', upload.array('attachments', 5), createTicket);
router.get('/', getTickets);
router.get('/stats', authorize('MANAGER', 'ADMIN', 'STAFF'), getDashboardStats);
router.post('/sla-check', authorize('MANAGER', 'ADMIN', 'STAFF'), triggerSlaCheck);

router.get('/:id', getTicketById);
router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/assign', authorize('MANAGER', 'ADMIN'), assignTicket);
router.post('/:id/messages', upload.array('attachments', 3), addMessage);
router.post('/:id/escalate', escalateTicket);

export default router;
