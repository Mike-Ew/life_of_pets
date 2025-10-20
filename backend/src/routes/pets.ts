import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserPets,
  getPetById,
  createPet,
  updatePet,
  uploadPetPhoto,
  updatePetPhoto,
} from '../controllers/petController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/me/pets
router.get('/me/pets', getUserPets);

// POST /api/pets
router.post('/pets', createPet);

// GET /api/pets/:id
router.get('/pets/:id', getPetById);

// PUT /api/pets/:id
router.put('/pets/:id', updatePet);

// POST /api/pets/:id/photos
router.post('/pets/:id/photos', uploadPetPhoto);

// PATCH /api/pet_photos/:photoId
router.patch('/pet_photos/:photoId', updatePetPhoto);

export default router;
