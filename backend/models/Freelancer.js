const mongoose = require('mongoose');

const freelancerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  skills: [{ type: String, required: true }],
  experience: { type: Number, required: true },
  resume: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Freelancer', freelancerSchema);
