import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getTodayCare,
  getCareEvents,
  createCareLog,
  getCareLogs,
  updateCareEvent,
  createCareTemplate,
  getCareTemplates,
} from '../controllers/careController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/pets/:id/care/today
router.get('/:id/care/today', getTodayCare);

// GET /api/pets/:id/care/events
router.get('/:id/care/events', getCareEvents);

// POST /api/pets/:id/care/logs
router.post('/:id/care/logs', createCareLog);

// GET /api/pets/:id/care/logs
router.get('/:id/care/logs', getCareLogs);

// POST /api/pets/:id/care/templates
router.post('/:id/care/templates', createCareTemplate);

// GET /api/pets/:id/care/templates
router.get('/:id/care/templates', getCareTemplates);

// Note: Update event status is on /api/care/events/:id (not /api/pets)
// This route is in the main index.ts as a separate route group

export default router;
