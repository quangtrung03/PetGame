const express = require('express');
const {
  getUserPets,
  createPet,
  feedPet,
  playWithPet,
  deletePet
} = require('../controllers/petController');
const auth = require('../middleware/auth');

const router = express.Router();

// All pet routes are protected
router.use(auth);

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
