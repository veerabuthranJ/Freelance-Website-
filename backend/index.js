const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const freelancerRoutes = require('./routes/freelancerRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/api/freelancer', freelancerRoutes);
app.use('/api/recruiter', recruiterRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
