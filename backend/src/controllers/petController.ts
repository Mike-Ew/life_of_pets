import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, Pet, PetCreateInput, PetPhoto } from '../types';

// GET /api/me/pets - Get all pets for the authenticated user
export const getUserPets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const result = await pool.query<Pet & { main_photo_url: string }>(
      `SELECT
        p.*,
        pp.url as main_photo_url
       FROM pets p
       LEFT JOIN pet_photos pp ON p.id = pp.pet_id AND pp.is_main = true
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ pets: result.rows });
  } catch (error) {
    console.error('Get user pets error:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
};

// GET /api/pets/:id - Get single pet by ID
export const getPetById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get pet details
    const petResult = await pool.query<Pet>(
      'SELECT * FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const pet = petResult.rows[0];

    // Get all photos
    const photosResult = await pool.query<PetPhoto>(
      'SELECT * FROM pet_photos WHERE pet_id = $1 ORDER BY is_main DESC, created_at ASC',
      [id]
    );

    res.json({
      pet: {
        ...pet,
        photos: photosResult.rows,
      },
    });
  } catch (error) {
    console.error('Get pet by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
};

// POST /api/pets - Create new pet
export const createPet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, age, breed, description, looking_for, temperament_tags }: PetCreateInput = req.body;

    if (!name) {
      res.status(400).json({ error: 'Pet name is required' });
      return;
    }

    const result = await pool.query<Pet>(
      `INSERT INTO pets (user_id, name, age, breed, description, looking_for, temperament_tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        name,
        age || null,
        breed || null,
        description || null,
        looking_for || null,
        temperament_tags || null,
      ]
    );

    res.status(201).json({
      message: 'Pet created successfully',
      pet: result.rows[0],
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: 'Failed to create pet' });
  }
};

// PUT /api/pets/:id - Update pet
export const updatePet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, age, breed, description, looking_for, temperament_tags }: Partial<PetCreateInput> = req.body;

    // Check ownership
    const ownerCheck = await pool.query(
      'SELECT id FROM pets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await pool.query<Pet>(
      `UPDATE pets
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           breed = COALESCE($3, breed),
           description = COALESCE($4, description),
           looking_for = COALESCE($5, looking_for),
           temperament_tags = COALESCE($6, temperament_tags)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, age, breed, description, looking_for, temperament_tags, id, userId]
    );

    res.json({
      message: 'Pet updated successfully',
      pet: result.rows[0],
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
};

// POST /api/pets/:id/photos - Upload pet photo
export const uploadPetPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { url, is_main = false } = req.body;

    if (!url) {
      res.status(400).json({ error: 'Photo URL is required' });
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

    // If this is to be the main photo, unset other main photos
    if (is_main) {
      await pool.query(
        'UPDATE pet_photos SET is_main = false WHERE pet_id = $1',
        [id]
      );
    }

    const result = await pool.query<PetPhoto>(
      'INSERT INTO pet_photos (pet_id, url, is_main) VALUES ($1, $2, $3) RETURNING *',
      [id, url, is_main]
    );

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: result.rows[0],
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// PATCH /api/pet_photos/:photoId - Update photo (set as main)
export const updatePetPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const userId = req.user?.id;
    const { is_main } = req.body;

    // Check ownership through pet
    const photoCheck = await pool.query(
      `SELECT pp.*, p.user_id
       FROM pet_photos pp
       JOIN pets p ON pp.pet_id = p.id
       WHERE pp.id = $1`,
      [photoId]
    );

    if (photoCheck.rows.length === 0) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    if (photoCheck.rows[0].user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const petId = photoCheck.rows[0].pet_id;

    // If setting as main, unset other main photos
    if (is_main) {
      await pool.query(
        'UPDATE pet_photos SET is_main = false WHERE pet_id = $1',
        [petId]
      );
    }

    const result = await pool.query<PetPhoto>(
      'UPDATE pet_photos SET is_main = $1 WHERE id = $2 RETURNING *',
      [is_main, photoId]
    );

    res.json({
      message: 'Photo updated successfully',
      photo: result.rows[0],
    });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
};
