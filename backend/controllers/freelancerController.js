const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Freelancer = require('../models/Freelancer');
const Invitation = require('../models/Invitation');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerFreelancer = async (req, res) => {
  try {
    const { name, email, password, phone, skills, experience } = req.body;
    if (!name || !email || !password || !phone || !skills || !experience) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Freelancer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume upload is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map((skill) => skill.trim());

    const freelancer = await Freelancer.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      skills: skillsArray,
      experience,
      resume: req.file.path,
    });

    res.status(201).json({
      message: 'Freelancer registered successfully',
      freelancer: {
        id: freelancer._id,
        name: freelancer.name,
        email: freelancer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const loginFreelancer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const freelancer = await Freelancer.findOne({ email: email.toLowerCase() });
    if (!freelancer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, freelancer.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(freelancer._id, 'freelancer');
    res.json({
      token,
      freelancer: {
        id: freelancer._id,
        name: freelancer.name,
        email: freelancer.email,
        phone: freelancer.phone,
        skills: freelancer.skills,
        experience: freelancer.experience,
        resume: freelancer.resume,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ freelancerId: req.user.id })
      .populate('recruiterId', 'name companyName email address')
      .sort({ createdAt: -1 });

    res.json({ invitations });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load invitations', error: error.message });
  }
};

module.exports = {
  registerFreelancer,
  loginFreelancer,
  getInvitations,
};
