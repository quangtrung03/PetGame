const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const friendController = require('../controllers/friendController');

router.use(auth);

router.get('/search', friendController.searchUsers);
router.post('/send', friendController.sendFriendRequest);
router.post('/accept', friendController.acceptFriendRequest);
router.post('/decline', friendController.declineFriendRequest);
router.get('/list', friendController.getFriends);
router.get('/requests', friendController.getFriendRequests);

module.exports = router;
