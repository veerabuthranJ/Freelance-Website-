const express = require('express');
const router = express.Router();
const { requireRecruiter } = require('../middleware/authMiddleware');
const {
  registerRecruiter,
  loginRecruiter,
  searchFreelancers,
  inviteFreelancer,
} = require('../controllers/recruiterController');

router.post('/register', registerRecruiter);
router.post('/login', loginRecruiter);
router.get('/search', requireRecruiter, searchFreelancers);
router.post('/invite', requireRecruiter, inviteFreelancer);

module.exports = router;
