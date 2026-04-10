const jwt = require('jsonwebtoken');
const Freelancer = require('../models/Freelancer');
const Recruiter = require('../models/Recruiter');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireFreelancer = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (!req.user || req.user.role !== 'freelancer') {
    return res.status(403).json({ message: 'Access denied. Freelancer only.' });
  }

  const freelancer = await Freelancer.findById(req.user.id);
  if (!freelancer) {
    return res.status(404).json({ message: 'Freelancer not found' });
  }

  req.freelancer = freelancer;
  next();
};

const requireRecruiter = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (!req.user || req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied. Recruiter only.' });
  }

  const recruiter = await Recruiter.findById(req.user.id);
  if (!recruiter) {
    return res.status(404).json({ message: 'Recruiter not found' });
  }

  req.recruiter = recruiter;
  next();
};

module.exports = {
  verifyToken,
  requireFreelancer,
  requireRecruiter,
};
