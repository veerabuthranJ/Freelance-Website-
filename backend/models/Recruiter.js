const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  companyStartDate: { type: Date, required: true },
  address: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
