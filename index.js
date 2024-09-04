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
const mongoUri = process.env.MONGO_URL;

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route to verify database connection and query
app.get('/api/test-db', async (req, res) => {
  try {
    // Replace 'your_collection_name' with the actual collection name you want to query
    const result = await mongoose.connection.db.collection('capturetheflagDB').findOne({});
    if (result) {
      res.send(result);
    } else {
      res.send('No documents found in the collection.');
    }
  } catch (err) {
    res.status(500).send('Error fetching data from database: ' + err.message);
  }
});

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port', process.env.PORT || 3000);
});
