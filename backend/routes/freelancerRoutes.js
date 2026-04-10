const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { requireFreelancer } = require('../middleware/authMiddleware');
const {
  registerFreelancer,
  loginFreelancer,
  getInvitations,
} = require('../controllers/freelancerController');

router.post('/register', upload.single('resume'), registerFreelancer);
router.post('/login', loginFreelancer);
router.get('/invitations', requireFreelancer, getInvitations);

module.exports = router;
