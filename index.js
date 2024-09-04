const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();

// Enable CORS for specific origin
app.use(cors({
  origin: 'http://capturetheflagfrontend-production.up.railway.app',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// Get MongoDB connection string from environment variable
const mongoUri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api/auth', authRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
