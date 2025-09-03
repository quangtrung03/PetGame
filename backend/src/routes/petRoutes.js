const express = require('express');
const {
  getUserPets,
  createPet,
  feedPet,
  playWithPet,
  deletePet,
  usePetAbility
} = require('../controllers/petController');
const auth = require('../middleware/auth');
const {
  validatePetAction,
  apiRateLimit,
  validateRequest
} = require('../middleware/validation');

const router = express.Router();

// Apply general validation and rate limiting
router.use(validateRequest);
router.use(apiRateLimit);

// All pet routes are protected
router.use(auth);

router.route('/')
  .get(getUserPets)
  .post(createPet);

router.route('/:id/feed')
  .patch(validatePetAction, feedPet);

router.route('/:id/play')
  .patch(validatePetAction, playWithPet);

router.route('/:id')
  .delete(validatePetAction, deletePet);

// Use pet ability
router.route('/:id/use-ability')
  .post(validatePetAction, usePetAbility);

module.exports = router;
