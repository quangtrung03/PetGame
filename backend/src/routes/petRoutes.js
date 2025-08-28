const express = require('express');
const {
  getUserPets,
  createPet,
  feedPet,
  playWithPet,
  deletePet
} = require('../controllers/petController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All pet routes are protected
router.use(protect);

router.route('/')
  .get(getUserPets)
  .post(createPet);

router.route('/:id/feed')
  .patch(feedPet);

router.route('/:id/play')
  .patch(playWithPet);

router.route('/:id')
  .delete(deletePet);

module.exports = router;
