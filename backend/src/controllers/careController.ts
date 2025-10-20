import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, CareLog, CareLogCreateInput } from '../types';

// GET /api/pets/:id/care/today - Get today's care tasks
export const getTodayCare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    // Get today's events
    const result = await pool.query(
      `SELECT * FROM care_events
       WHERE pet_id = $1
       AND DATE(due_at) = CURRENT_DATE
       ORDER BY due_at ASC`,
      [id]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get today care error:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s care tasks' });
  }
};

// GET /api/pets/:id/care/events - Get upcoming care events
export const getCareEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { range } = req.query; // e.g., "today..+14d"

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    // Get upcoming events (next 14 days by default)
    const result = await pool.query(
      `SELECT * FROM care_events
       WHERE pet_id = $1
       AND due_at >= CURRENT_DATE
       AND due_at <= CURRENT_DATE + INTERVAL '14 days'
       AND status = 'upcoming'
       ORDER BY due_at ASC`,
      [id]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get care events error:', error);
    res.status(500).json({ error: 'Failed to fetch care events' });
  }
};

// POST /api/pets/:id/care/logs - Create care log
export const createCareLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { type, title, value, notes, occurred_at }: CareLogCreateInput = req.body;

    if (!type) {
      res.status(400).json({ error: 'Type is required' });
      return;
    }

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await pool.query<CareLog>(
      `INSERT INTO care_logs (pet_id, type, title, value, notes, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, type, title || null, value || null, notes || null, occurred_at || new Date()]
    );

    res.status(201).json({
      message: 'Care log created successfully',
      log: result.rows[0],
    });
  } catch (error) {
    console.error('Create care log error:', error);
    res.status(500).json({ error: 'Failed to create care log' });
  }
};

// GET /api/pets/:id/care/logs - Get care history
export const getCareLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await pool.query<CareLog>(
      `SELECT * FROM care_logs
       WHERE pet_id = $1
       ORDER BY occurred_at DESC
       LIMIT 50`,
      [id]
    );

    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get care logs error:', error);
    res.status(500).json({ error: 'Failed to fetch care logs' });
  }
};

// PATCH /api/care/events/:id - Update care event status
export const updateCareEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status } = req.body;

    if (!status || !['done', 'skipped', 'upcoming'].includes(status)) {
      res.status(400).json({ error: 'Valid status is required (done, skipped, upcoming)' });
      return;
    }

    // Check ownership through pet
    const eventCheck = await pool.query(
      `SELECT ce.*, p.user_id
       FROM care_events ce
       JOIN pets p ON ce.pet_id = p.id
       WHERE ce.id = $1`,
      [id]
    );

    if (eventCheck.rows.length === 0) {
      res.status(404).json({ error: 'Care event not found' });
      return;
    }

    if (eventCheck.rows[0].user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      'UPDATE care_events SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({
      message: 'Care event updated successfully',
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Update care event error:', error);
    res.status(500).json({ error: 'Failed to update care event' });
  }
};

// POST /api/pets/:id/care/templates - Create care template
export const createCareTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { type, title, cadence, time_of_day } = req.body;

    if (!type || !title) {
      res.status(400).json({ error: 'Type and title are required' });
      return;
    }

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO care_templates (pet_id, type, title, cadence, time_of_day)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, type, title, cadence || null, time_of_day || null]
    );

    res.status(201).json({
      message: 'Care template created successfully',
      template: result.rows[0],
    });
  } catch (error) {
    console.error('Create care template error:', error);
    res.status(500).json({ error: 'Failed to create care template' });
  }
};

// GET /api/pets/:id/care/templates - Get care templates
export const getCareTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM care_templates WHERE pet_id = $1 AND active = true ORDER BY created_at DESC',
      [id]
    );

    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get care templates error:', error);
    res.status(500).json({ error: 'Failed to fetch care templates' });
  }
};
