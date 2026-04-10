const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Freelancer = require('../models/Freelancer');
const Recruiter = require('../models/Recruiter');
const Invitation = require('../models/Invitation');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerRecruiter = async (req, res) => {
  try {
    const { name, email, password, companyName, companyStartDate, address } = req.body;
    if (!name || !email || !password || !companyName || !companyStartDate || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Recruiter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const recruiter = await Recruiter.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      companyName,
      companyStartDate,
      address,
    });

    res.status(201).json({
      message: 'Recruiter registered successfully',
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};
const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const recruiter = await require('../models/Recruiter').findOne({ email: email.toLowerCase() });
    if (!recruiter) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, recruiter.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(recruiter._id, 'recruiter');
    res.json({ token, recruiter: { id: recruiter._id, name: recruiter.name, email: recruiter.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const searchFreelancers = async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) {
      return res.status(400).json({ message: 'Skill query parameter is required' });
    }

    const freelancers = await Freelancer.find({
      skills: { $regex: new RegExp(skill, 'i') },
    }).select('-password');

    res.json({ freelancers });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

const inviteFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.body;
    if (!freelancerId) {
      return res.status(400).json({ message: 'freelancerId is required' });
    }

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    const invitation = await Invitation.create({
      recruiterId: req.user.id,
      freelancerId,
      status: 'invited',
    });

    res.status(201).json({ message: 'Invitation sent', invitation });
  } catch (error) {
    res.status(500).json({ message: 'Unable to send invitation', error: error.message });
  }
};

module.exports = {
  registerRecruiter,
  loginRecruiter,
  searchFreelancers,
  inviteFreelancer,
};
